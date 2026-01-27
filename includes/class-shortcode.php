<?php
/**
 * ShortCode class for Tickefic plugin.
 *
 * Handles the registration and rendering of the user dashboard shortcode.
 * This class manages the [tickefic_user_dashboard] WordPress shortcode that
 * provides a React-based user dashboard interface.
 *
 * @since 1.0.0
 * @package Tickefic
 * @subpackage Includes
 */
class ShortCode {
    /**
     * Constructor.
     *
     * Registers the 'tickefic_user_dashboard' shortcode and maps it to the
     * render_user_dashboard() method callback.
     *
     * @since 1.0.0
     */
    public function __construct() {
        add_shortcode('tickefic_user_dashboard', array($this, 'render_user_dashboard'));
    }

    /**
     * Render user dashboard shortcode.
     *
     * Outputs a container div element with ID 'user-dashboard-root' that serves
     * as the mount point for the React user dashboard application.
     *
     * @since 1.0.0
     * @return string The HTML markup for the dashboard root container.
     */
    public function render_user_dashboard() {
        return '<div id="user-dashboard-root"></div>';
    }
}

new ShortCode();