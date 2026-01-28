<?php
/**
 * Plugin Name: Tickefic
 * Plugin URI:  
 * Description: A simple plugin for ticket system.
 * Version:     1.0.0
 * Author:      Al Amin
 * Author URI:  https://almn.me
 * Text Domain: tickefic
 * Domain Path: /languages
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 *
 * Requires at least: 5.4
 * Requires PHP: 7.0
 * Requires Plugins: 
 *
 * @package     TickeFic
 * @author      Al Amin
 * @copyright   2026 Themefic
 * @license     GPL-2.0+
 *
 * @wordpress-plugin
 *
 * Prefix:      tickefic
 */
/**
 * Security check to prevent direct file access.
 */
defined( 'ABSPATH' ) || die( 'No script kiddies please!' );

/**
 * Plugin Constants
 */
define( 'TICKEFIC_VERSION', WP_DEBUG ? time() : '1.0.0' );
define( 'TICKEFIC_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'TICKEFIC_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );

/**
 * Include required files.
 */
require_once TICKEFIC_PLUGIN_PATH . 'includes/class-shortcode.php';
require_once TICKEFIC_PLUGIN_PATH . 'includes/class-cpt.php';
require_once TICKEFIC_PLUGIN_PATH . 'includes/class-rest-api.php';
require_once TICKEFIC_PLUGIN_PATH . 'includes/class-roles-permissions.php';

/**
 * Load plugin text domain for translations.
 */
add_action( 'plugins_loaded', function() {
    load_plugin_textdomain( 'tickefic', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
} );

/**
 * Run plugin activation hook.
 */
register_activation_hook( __FILE__, 'tickefic_activate_plugin' );

/**
 * Enqueue frontend scripts and styles.
 */
add_action( 'wp_enqueue_scripts', 'support_dashboard_enqueue_assets' );
function support_dashboard_enqueue_assets() {
    $handle = 'support-dashboard-app'; // Default handle
    
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        // Ensure the module type is added correctly
        add_filter( 'script_loader_tag', function( $tag, $handle, $src ) {
            if ( in_array( $handle, array( 'support-dashboard-dev', 'support-dashboard-app' ), true ) ) {
                return '<script type="module" src="' . esc_url( $src ) . '"></script>';
            }
            return $tag;
        }, 10, 3 );

        $handle = 'support-dashboard-dev';
        wp_enqueue_script( $handle, 'http://localhost:5173/src/main.jsx', array( 'wp-element' ), null, true );
    } else {
        wp_enqueue_style( 'support-dashboard-style', TICKEFIC_PLUGIN_URL . 'assets/build/app.css', array(), TICKEFIC_VERSION );
        wp_enqueue_script( $handle, TICKEFIC_PLUGIN_URL . 'assets/build/app.js', array( 'wp-element', 'wp-i18n', 'wp-api-fetch' ), TICKEFIC_VERSION, true );
    }

    // ALWAYS localize to the main app handle so the React app can see it
    wp_localize_script( $handle, 'SupportDashboard', array(
        'nonce'   => wp_create_nonce( 'wp_rest' ),
        'api_url' => esc_url_raw( rest_url() ),
    ) );
}

add_filter('script_loader_tag', function($tag, $handle, $src) {
    // List all handles that need to be treated as modules
    $module_handles = array(
        'support-dashboard-dev', 
        'support-dashboard-app'
    );

    if (in_array($handle, $module_handles, true)) {
        // Replace the standard script tag with one containing type="module"
        return '<script type="module" src="' . esc_url($src) . '" id="' . esc_attr($handle) . '-js"></script>';
    }
    
    return $tag;
}, 10, 3);
/**
 * Register ticket taxonomy.
 */
add_action( 'init', 'tickefic_register_ticket_taxonomy' );
function tickefic_register_ticket_taxonomy() {
    register_taxonomy( 'tickefic_cat', array( 'tickefic_ticket' ), array(
        'hierarchical'      => true,
        'labels'            => array( 'name' => __( 'Ticket Categories', 'tickefic' ) ),
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
    ) );
}

/**
 * Add custom columns to ticket post list.
 */
add_filter( 'manage_tickefic_ticket_posts_columns', 'add_tickefic_ticket_columns' );
function add_tickefic_ticket_columns( $columns ) {
    $columns['tickefic_priority'] = __( 'Priority', 'tickefic' );
    $columns['tickefic_status']   = __( 'Status', 'tickefic' );
    return $columns + array( 'id' => __( 'ID', 'tickefic' ) );
}

/**
 * Display custom column content for tickets.
 */
add_action( 'manage_tickefic_ticket_posts_custom_column', 'custom_tickefic_ticket_column_content', 10, 2 );
function custom_tickefic_ticket_column_content( $column, $post_id ) {
    if ( 'id' === $column ) {
        echo esc_html( $post_id );
    }
    if ( 0 === strpos( $column, 'tickefic_' ) ) {
        echo esc_html( ucfirst( get_post_meta( $post_id, $column, true ) ) );
    }
}

/**
 * Make tickefic meta keys publicly accessible.
 */
add_filter( 'is_protected_meta', function( $protected, $meta_key ) {
    return ( 0 === strpos( $meta_key, 'tickefic_' ) ) ? false : $protected;
}, 10, 2 );

/**
 * Create User Dashboard page on plugin activation.
 */
function tickefic_activate_plugin() {
    $dashboard_page = new WP_Query( array(
        'post_type'      => 'page',
        'title'          => 'User Dashboard',
        'posts_per_page' => 1,
    ) );

    if ( ! $dashboard_page->have_posts() ) {
        wp_insert_post( array(
            'post_title'   => 'User Dashboard',
            'post_content' => '[tickefic_user_dashboard]',
            'post_status'  => 'publish',
            'post_type'    => 'page',
        ) );
    }
}

/*
* Register Ticket Meta Fields for REST API
*/
add_action( 'init', 'register_metaboxes_for_tickefic_tickets' );

function register_metaboxes_for_tickefic_tickets() {
    // Register Ticket Meta Fields
    $meta_fields = [
            'tickefic_priority'       => 'string',
            'tickefic_status'         => 'string',
            'tickefic_assigned_agent' => 'integer',
        ];

    foreach ($meta_fields as $key => $type) {
        register_post_meta('tickefic_ticket', $key, [
            'type'          => $type,
            'single'        => true,
            'show_in_rest'  => true,
            'auth_callback' => function() { return is_user_logged_in(); },
        ]);
    }
}

/**
 * Register Metaboxes for Tickefic Tickets
 */

/**
 * Add Meta Box to Ticket Edit Screen
 *
 * Registers the ticket details meta box on the ticket post type edit page.
 *
 * @since 1.0.0
 * @return void
 */
add_action( 'add_meta_boxes', function() {
    add_meta_box(
        'tickefic_ticket_meta',
        __( 'Ticket Details', 'tickefic' ),
        'tickefic_render_ticket_metabox',
        'tickefic_ticket',
        'side',
        'high'
    );
} );

/**
 * Render Meta Box HTML
 *
 * Displays the ticket details meta box with priority, status, and agent assignment fields.
 *
 * @since 1.0.0
 * @param WP_Post $post The post object for the current ticket.
 * @return void
 */
function tickefic_render_ticket_metabox( $post ) {
    // Security: Nonce field verification required for save_post hook.
    wp_nonce_field( 'tickefic_save_meta', 'tickefic_ticket_meta_nonce' );


    $priority = get_post_meta( $post->ID, 'tickefic_priority', true ) ?: 'normal';
    $status   = get_post_meta( $post->ID, 'tickefic_status', true ) ?: 'open';
    $agent    = get_post_meta( $post->ID, 'tickefic_assigned_agent', true ) ?: 0;

    ?>
    <div class="tickefic-meta-wrapper">
        <p>
            <label class="post-attributes-label" for="tickefic_priority">
                <strong><?php esc_html_e( 'Priority', 'tickefic' ); ?></strong>
            </label><br>
            <select name="tickefic_priority" id="tickefic_priority" class="widefat">
                <option value="low" <?php selected( $priority, 'low' ); ?>>
                    <?php esc_html_e( 'Low', 'tickefic' ); ?>
                </option>
                <option value="normal" <?php selected( $priority, 'normal' ); ?>>
                    <?php esc_html_e( 'Normal', 'tickefic' ); ?>
                </option>
                <option value="high" <?php selected( $priority, 'high' ); ?>>
                    <?php esc_html_e( 'High', 'tickefic' ); ?>
                </option>
            </select>
        </p>

        <p>
            <label class="post-attributes-label" for="tickefic_status">
                <strong><?php esc_html_e( 'Status', 'tickefic' ); ?></strong>
            </label><br>
            <select name="tickefic_status" id="tickefic_status" class="widefat">
                <option value="open" <?php selected( $status, 'open' ); ?>>
                    <?php esc_html_e( 'Open', 'tickefic' ); ?>
                </option>
                <option value="in_progress" <?php selected( $status, 'in_progress' ); ?>>
                    <?php esc_html_e( 'In Progress', 'tickefic' ); ?>
                </option>
                <option value="closed" <?php selected( $status, 'closed' ); ?>>
                    <?php esc_html_e( 'Closed', 'tickefic' ); ?>
                </option>
            </select>
        </p>

        <p>
            <label class="post-attributes-label" for="tickefic_assigned_agent">
                <strong><?php esc_html_e( 'Assigned Agent', 'tickefic' ); ?></strong>
            </label><br>
            <select name="tickefic_assigned_agent" id="tickefic_assigned_agent" class="widefat">
                <option value="0" <?php selected( $agent, 0 ); ?>>
                    <?php esc_html_e( 'Unassigned', 'tickefic' ); ?>
                </option>
                <?php
                $users = get_users( array( 'role__in' => array( 'agent', 'administrator' ) ) );
                foreach ( $users as $user ) :
                    ?>
                    <option value="<?php echo esc_attr( $user->ID ); ?>" <?php selected( $agent, $user->ID ); ?>>
                        <?php echo esc_html( $user->display_name ); ?>
                    </option>
                    <?php
                endforeach;
                ?>
            </select>
        </p>
    </div>
    <?php
}


/**
 * Save Meta Box Data
 *
 * Handles saving ticket details meta box data with nonce verification,
 * autosave checks, and proper capability checks.
 *
 * @since 1.0.0
 * @param int $post_id The ID of the post being saved.
 * @return void
 */
add_action( 'save_post', function( $post_id ) {
    // 1. Verify Nonce
    if ( ! isset( $_POST['tickefic_ticket_meta_nonce'] ) || ! wp_verify_nonce( $_POST['tickefic_ticket_meta_nonce'], 'tickefic_save_meta' ) ) {
        return;
    }

    // 2. Skip autosave and check user capabilities
    if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || ! current_user_can( 'edit_post', $post_id ) ) {
        return;
    }

    // 3. Save ticket priority
    if ( isset( $_POST['tickefic_priority'] ) ) {
        update_post_meta( $post_id, 'tickefic_priority', sanitize_text_field( wp_unslash( $_POST['tickefic_priority'] ) ) );
    }

    // 4. Save ticket status
    if ( isset( $_POST['tickefic_status'] ) ) {
        update_post_meta( $post_id, 'tickefic_status', sanitize_text_field( wp_unslash( $_POST['tickefic_status'] ) ) );
    }

    // 5. Save assigned agent
    if ( isset( $_POST['tickefic_assigned_agent'] ) ) {
        update_post_meta( $post_id, 'tickefic_assigned_agent', absint( $_POST['tickefic_assigned_agent'] ) );
    }
} );