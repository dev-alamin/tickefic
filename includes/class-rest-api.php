<?php
/**
 * Rest_Api Class
 *
 * Handles custom REST API routes and endpoints for the Tickefic plugin.
 * Manages user authentication, login verification, and ticket-related REST operations.
 *
 * @class       Rest_Api
 * @package     Tickefic
 * @subpackage  Includes
 * @since       1.0.0
 */
class Rest_Api {
    /**
     * Constructor
     *
     * Initializes the REST API class by registering hooks for:
     * - Custom route registration on REST API initialization
     * - Ticket query filtering based on user permissions
     * - Ticket endpoint permission checks
     *
     * @since 1.0.0
     */
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_custom_routes']);
        add_filter('rest_tickefic_ticket_query', [$this, 'filter_ticket_query'], 10, 2);
        add_filter('rest_tickefic_ticket_permissions_check', [$this, 'check_ticket_permissions'], 10, 2);
    }

    /**
     * Register Custom REST API Routes
     *
     * Registers custom REST API endpoints for user status checking and login functionality.
     * Also registers ticket-related post meta fields to be accessible via REST API.
     *
     * Endpoints:
     * - GET /tickefic/v1/user-status - Check if user is logged in
     * - POST /tickefic/v1/login - Handle user authentication
     *
     * Meta Fields Registered:
     * - tickefic_priority (string)
     * - tickefic_status (string)
     * - tickefic_assigned_agent (integer)
     *
     * @since 1.0.0
     * @return void
     */
    public function register_custom_routes() {
        // Check User Status
        register_rest_route('tickefic/v1', '/user-status', [
            'methods'             => 'GET',
            'callback'            => [$this, 'custom_api_check_user_login'],
            'permission_callback' => '__return_true',
        ]);

        // Custom Login
        register_rest_route('tickefic/v1', '/login', [
            'methods'             => 'POST',
            'callback'            => [$this, 'tickefic_rest_login'],
            'permission_callback' => '__return_true',
        ]);
    }

    /**
     * Custom API Check User Login
     *
     * Checks if the current user is authenticated and returns user details
     * including display name and email address.
     *
     * @since  1.0.0
     * @return WP_REST_Response Response object containing login status and user data.
     *                           Returns 200 status code.
     */
    public function custom_api_check_user_login() {
        $logged_in = is_user_logged_in();
        $current_user = wp_get_current_user();
        return new WP_REST_Response([
            'logged_in' => $logged_in,
            'user'      => $logged_in ? [
                'name'  => $current_user->display_name,
                'email' => $current_user->user_email
            ] : ['name' => 'Guest', 'email' => '']
        ], 200);
    }

    /**
     * Tickefic REST Login Handler
     *
     * Processes user login requests via REST API. Validates credentials,
     * authenticates the user, and sets WordPress authentication cookies.
     *
     * @since  1.0.0
     * @param  WP_REST_Request $request The REST request object containing username and password.
     * @return WP_REST_Response|void   Returns success response with user ID and name on success,
     *                                 or JSON error response with 403 status on failure.
     */
    public function tickefic_rest_login($request) {
        $creds = [
            'user_login'    => $request->get_param('username'),
            'user_password' => $request->get_param('password'),
            'remember'      => true,
        ];

        $user = wp_signon($creds, false);
        if (is_wp_error($user)) {
            wp_send_json_error(['message' => __('Invalid credentials.', 'tickefic')], 403);
        }

        wp_set_current_user($user->ID);
        wp_set_auth_cookie($user->ID, true);

        return new WP_REST_Response([
            'success' => true,
            'user'    => ['id' => $user->ID, 'name' => $user->display_name]
        ], 200);
    }

    /**
     * Filter Ticket Query
     *
     * Filters ticket queries based on user capabilities and requested status.
     * Non-admin users see only their own tickets, while admins can see all tickets.
     * Optionally filters by ticket status if provided in the request.
     *
     * @since  1.0.0
     * @param  array           $args    The query arguments.
     * @param  WP_REST_Request $request The REST request object.
     * @return array                    Modified query arguments.
     */
    public function filter_ticket_query($args, $request) {
        if (!current_user_can('manage_options') && !current_user_can('edit_others_posts')) {
            $args['author'] = get_current_user_id() ?: -1;
        }

        $status = $request->get_param('tickefic_status');
        if ($status) {
            $args['meta_query'][] = [
                'key'     => 'tickefic_status',
                'value'   => sanitize_text_field($status),
                'compare' => '=',
            ];
        }
        return $args;
    }

    /**
     * Check Ticket Permissions
     *
     * Validates permissions for ticket REST endpoint requests.
     * Allows POST requests from authenticated users.
     *
     * @since  1.0.0
     * @param  bool            $permission Current permission status.
     * @param  WP_REST_Request $request    The REST request object.
     * @return bool                        True if permitted, otherwise returns original permission.
     */
    public function check_ticket_permissions($permission, $request) {
        if ('POST' === $request->get_method() && is_user_logged_in()) return true;
        return $permission;
    }
}

new Rest_Api();