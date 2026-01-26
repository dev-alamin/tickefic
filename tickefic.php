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

defined('ABSPATH') || die('No script kiddies please!');

define('TICKEFIC_VERSION', '1.0.0');
define('TICKEFIC_PLUGIN', __FILE__);
define('TICKEFIC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('TICKEFIC_PLUGIN_PATH', plugin_dir_path(__FILE__));

add_action('plugins_loaded', 'tickefic_plugin_init');
/**
 * Load localization files
 *
 * @return void
 */
function tickefic_plugin_init()
{
    load_plugin_textdomain('tickefic', false, dirname(plugin_basename(__FILE__)) . '/languages');
}

require_once TICKEFIC_PLUGIN_PATH . 'includes/class-shortcode.php';
require_once TICKEFIC_PLUGIN_PATH . 'includes/class-cpt.php';

function support_dashboard_enqueue_assets()
{
    if (defined('WP_DEBUG') && WP_DEBUG) {
        // Load Vite client first
        wp_enqueue_script(
            'support-dashboard-dev',
            'http://localhost:5173/src/main.jsx',
            ['wp-element'],
            null,
            true
        );


        // Add type="module"
        add_filter('script_loader_tag', function ($tag, $handle, $src) {
            if (in_array($handle, ['vite-client', 'support-dashboard-dev'], true)) {
                return '<script type="module" src="' . esc_url($src) . '"></script>';
            }
            return $tag;
        }, 10, 3);
    } else {
        // Production build
        wp_enqueue_script(
            'support-dashboard-app',
            plugin_dir_url(__FILE__) . 'assets/build/app.js',
            ['wp-element'],
            null,
            true
        );
    }

    // enqueue assets/js/script.js 
    wp_enqueue_script(
        'tickefic-frontend-script',
        TICKEFIC_PLUGIN_URL . 'assets/js/script.js',
        ['jquery'],
        TICKEFIC_VERSION,
        true
    );

    wp_localize_script('tickefic-frontend-script', 'SupportDashboard', [
        'nonce' => wp_create_nonce('wp_rest')
    ]);
}
add_action('wp_enqueue_scripts', 'support_dashboard_enqueue_assets');

// Upon plugin activation, create a new page and set the shortcode
function tickefic_activate_plugin()
{
    // Check if the page already exists
    $page = get_page_by_title('User Dashboard');

    if (! $page) {
        // Create post object
        $page_data = [
            'post_title'   => 'User Dashboard',
            'post_content' => '[tickefic_user_dashboard]',
            'post_status'  => 'publish',
            'post_type'    => 'page',
        ];

        // Insert the post into the database
        wp_insert_post($page_data);
    }
}
// register_activation_hook(__FILE__, 'tickefic_activate_plugin');

// Add new role to assign 'agent' role
function tickefic_add_agent_role()
{
    add_role('agent', __('Agent', 'tickefic'), [
        'read'         => true,
        'edit_posts'   => false,
        'delete_posts' => false,
    ]);
}
register_activation_hook(__FILE__, 'tickefic_add_agent_role');