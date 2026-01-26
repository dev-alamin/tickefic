<?php

defined('ABSPATH') || die('No script kiddies please!');

if (! class_exists('Custom_Post_Type')) :

    class Custom_Post_Type
    {
        public function __construct()
        {
            add_action('init', [$this, 'register_tickefic_post_type']);
        }


        public function register_tickefic_post_type()
        {
            $labels = [
                'name'                  => _x('Tickets', 'Post Type General Name', 'text_domain'),
                'singular_name'         => _x('Ticket', 'Post Type Singular Name', 'text_domain'),
                'menu_name'             => __('Tickets', 'text_domain'),
                'name_admin_bar'        => __('Ticket', 'text_domain'),
                'archives'              => __('Ticket Archives', 'text_domain'),
                'attributes'            => __('Ticket Attributes', 'text_domain'),
                'parent_item_colon'     => __('Parent Ticket:', 'text_domain'),
                'all_items'             => __('All Tickets', 'text_domain'),
                'add_new_item'          => __('Add New Ticket', 'text_domain'),
                'add_new'               => __('Add New', 'text_domain'),
                'new_item'              => __('New Ticket', 'text_domain'),
                'edit_item'             => __('Edit Ticket', 'text_domain'),
                'update_item'           => __('Update Ticket', 'text_domain'),
                'view_item'             => __('View Ticket', 'text_domain'),
                'view_items'            => __('View Tickets', 'text_domain'),
                'search_items'          => __('Search Ticket', 'text_domain'),
                'not_found'             => __('Not found', 'text_domain'),
                'not_found_in_trash'    => __('Not found in Trash', 'text_domain'),
                'featured_image'        => __('Featured Image', 'text_domain'),
                'set_featured_image'    => __('Set featured image', 'text_domain'),
                'remove_featured_image' => __('Remove featured image', 'text_domain'),
                'use_featured_image'    => __('Use as featured image', 'text_domain'),
                'insert_into_item'      => __('Insert into Ticket', 'text_domain'),
                'uploaded_to_this_item' => __('Uploaded to this Ticket', 'text_domain'),
                'items_list'            => __('Tickets list', 'text_domain'),
                'items_list_navigation' => __('Tickets list navigation', 'text_domain'),
                'filter_items_list'     => __('Filter Tickets list', 'text_domain'),
            ];
            $args = [
                'label'                 => __('Ticket', 'text_domain'),
                'description'           => __('Custom Post Type for Tickets', 'text_domain'),
                'labels'                => $labels,
                'supports'              => ['title', 'editor', 'thumbnail', 'custom-fields', 'comments'],
                'hierarchical'          => true,
                'public'                => true,
                'show_ui'               => true,
                'show_in_menu'          => true,
                'menu_position'         => 5,
                'menu_icon'             => 'dashicons-tickets-alt',
                'show_in_admin_bar'     => true,
                'show_in_nav_menus'     => true,
                'can_export'            => true,
                'has_archive'           => true,
                'exclude_from_search'   => false,
                'publicly_queryable'    => true,
                'capability_type'       => 'post',
                'show_in_rest'          => true,
                'rest_base'             => 'tickefic/tickets',
            ];

            if (post_type_exists('tickefic_ticket')) {
                return;
            }

            register_post_type('tickefic_ticket', $args);
        }
    }

    new Custom_Post_Type();

endif;

// Show meta field in admin columns
function add_tickefic_ticket_columns($columns)
{
    $columns['tickefic_priority'] = __('Priority', 'tickefic');
    $columns['tickefic_status']   = __('Status', 'tickefic');
    $columns['tickefic_assigned_agent'] = __('Assigned Agent', 'tickefic');
    $columns['id'] = __('Ticket ID', 'tickefic');
    return $columns;
}
add_filter('manage_tickefic_ticket_posts_columns', 'add_tickefic_ticket_columns');

function custom_tickefic_ticket_column_content($column, $post_id)
{
    switch ($column) {
        case 'tickefic_priority':
            $priority = get_post_meta($post_id, 'tickefic_priority', true);
            echo esc_html(ucfirst($priority));
            break;
        case 'tickefic_status':
            $status = get_post_meta($post_id, 'tickefic_status', true);
            echo esc_html(ucfirst($status));
            break;
        case 'tickefic_assigned_agent':
            $agent_id = get_post_meta($post_id, 'tickefic_assigned_agent', true);
            if ($agent_id) {
                $agent_info = get_userdata($agent_id);
                if ($agent_info) {
                    echo esc_html($agent_info->display_name);
                } else {
                    echo __('Unknown Agent', 'tickefic');
                }
            } else {
                echo __('Unassigned', 'tickefic');
            }
            break;
        case 'id':
            echo esc_html($post_id);
            break;
    }
}
add_action('manage_tickefic_ticket_posts_custom_column', 'custom_tickefic_ticket_column_content', 10, 2);

/**
 * Register Metadata for REST API
 * This ensures your React frontend can see/update these fields.
 */
add_action('init', 'tickefic_register_ticket_meta');
function tickefic_register_ticket_meta() {
    $meta_fields = [
        'tickefic_priority'       => ['type' => 'string', 'default' => 'normal'],
        'tickefic_status'         => ['type' => 'string', 'default' => 'open'],
        'tickefic_assigned_agent' => ['type' => 'integer', 'default' => 0],
    ];

    foreach ($meta_fields as $key => $args) {
        register_post_meta('tickefic_ticket', $key, [
            'type'         => $args['type'],
            'single'       => true,
            'show_in_rest' => true, // Essential for your React ListTicket component
            'default'      => $args['default'],
            'auth_callback' => function() {
                return current_user_can('edit_posts');
            }
        ]);
    }
}

/**
 * Add Meta Box to Ticket Edit Screen
 */
add_action('add_meta_boxes', function () {
    add_meta_box(
        'tickefic_ticket_meta', 
        __('Ticket Details', 'tickefic'), 
        'tickefic_render_ticket_metabox', 
        'tickefic_ticket', 
        'side', 
        'high'
    );
});

/**
 * Render Meta Box HTML
 */
function tickefic_render_ticket_metabox($post) {
    // SECURITY: This was missing! Without this, the save_post function will fail.
    wp_nonce_field('tickefic_save_meta', 'tickefic_ticket_meta_nonce');

    $priority = get_post_meta($post->ID, 'tickefic_priority', true) ?: 'normal';
    $status   = get_post_meta($post->ID, 'tickefic_status', true) ?: 'open';
    $agent    = get_post_meta($post->ID, 'tickefic_assigned_agent', true) ?: 0;

    ?>
    <div class="tickefic-meta-wrapper">
        <p>
            <label class="post-attributes-label" for="tickefic_priority"><strong><?php _e('Priority', 'tickefic'); ?></strong></label><br>
            <select name="tickefic_priority" id="tickefic_priority" class="widefat">
                <option value="low" <?php selected($priority, 'low'); ?>><?php _e('Low', 'tickefic'); ?></option>
                <option value="normal" <?php selected($priority, 'normal'); ?>><?php _e('Normal', 'tickefic'); ?></option>
                <option value="high" <?php selected($priority, 'high'); ?>><?php _e('High', 'tickefic'); ?></option>
            </select>
        </p>

        <p>
            <label class="post-attributes-label" for="tickefic_status"><strong><?php _e('Status', 'tickefic'); ?></strong></label><br>
            <select name="tickefic_status" id="tickefic_status" class="widefat">
                <option value="open" <?php selected($status, 'open'); ?>><?php _e('Open', 'tickefic'); ?></option>
                <option value="in_progress" <?php selected($status, 'in_progress'); ?>><?php _e('In Progress', 'tickefic'); ?></option>
                <option value="closed" <?php selected($status, 'closed'); ?>><?php _e('Closed', 'tickefic'); ?></option>
            </select>
        </p>

        <p>
            <label class="post-attributes-label" for="tickefic_assigned_agent"><strong><?php _e('Assigned Agent', 'tickefic'); ?></strong></label><br>
            <select name="tickefic_assigned_agent" id="tickefic_assigned_agent" class="widefat">
                <option value="0" <?php selected($agent, 0); ?>><?php _e('Unassigned', 'tickefic'); ?></option>
                <?php
                $users = get_users(['role__in' => ['agent', 'administrator']]);
                foreach ($users as $user) : ?>
                    <option value="<?php echo esc_attr($user->ID); ?>" <?php selected($agent, $user->ID); ?>>
                        <?php echo esc_html($user->display_name); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </p>
    </div>
    <?php
}

/**
 * Save Meta Box Data
 */
add_action('save_post', function ($post_id) {
    // 1. Verify Nonce
    if (!isset($_POST['tickefic_ticket_meta_nonce']) || !wp_verify_nonce($_POST['tickefic_ticket_meta_nonce'], 'tickefic_save_meta')) {
        return;
    }

    // 2. Checks
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    // 3. Save Fields
    if (isset($_POST['tickefic_priority'])) {
        update_post_meta($post_id, 'tickefic_priority', sanitize_text_field($_POST['tickefic_priority']));
    }
    if (isset($_POST['tickefic_status'])) {
        update_post_meta($post_id, 'tickefic_status', sanitize_text_field($_POST['tickefic_status']));
    }
    if (isset($_POST['tickefic_assigned_agent'])) {
        update_post_meta($post_id, 'tickefic_assigned_agent', absint($_POST['tickefic_assigned_agent']));
    }
});

// Add a taxonomy for Ticket Categories
function tickefic_register_ticket_taxonomy() {
    $labels = [
        'name'              => _x('Ticket Categories', 'taxonomy general name', 'tickefic'),
        'singular_name'     => _x('Ticket Category', 'taxonomy singular name', 'tickefic'),
        'search_items'      => __('Search Ticket Categories', 'tickefic'),
        'all_items'         => __('All Ticket Categories', 'tickefic'),
        'parent_item'       => __('Parent Ticket Category', 'tickefic'),
        'parent_item_colon' => __('Parent Ticket Category:', 'tickefic'),
        'edit_item'         => __('Edit Ticket Category', 'tickefic'),
        'update_item'       => __('Update Ticket Category', 'tickefic'),
        'add_new_item'      => __('Add New Ticket Category', 'tickefic'),
        'new_item_name'     => __('New Ticket Category Name', 'tickefic'),
        'menu_name'         => __('Ticket Categories', 'tickefic'),
    ];
    $args = [
        'hierarchical'      => true,
        'labels'            => $labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => ['slug' => 'ticket-category'],
        'show_in_rest'      => true,
    ];

    register_taxonomy('tickefic_cat', ['tickefic_ticket'], $args);
}
add_action('init', 'tickefic_register_ticket_taxonomy');