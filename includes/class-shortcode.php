<?php
class ShortCode {
    public function __construct() {
        add_shortcode('tickefic_user_dashboard', array($this, 'render_user_dashboard'));
    }

    public function render_user_dashboard() {

        if( ! is_user_logged_in() ) {
            // return a nice UI using tailwindcss for prompting user to login
            return '<div class="mx-auto mt-10 p-6 bg-slate-100 rounded-lg shadow-md text-center">
                <h2 class="text-2xl font-semibold mb-4">' . __('Please Log In', 'tickefic') . '</h2>
                <p class="mb-6">' . __('You must be logged in to view your dashboard.', 'tickefic') . '</p>
                <a href="' . wp_login_url(get_permalink()) . '" class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">' . __('Log In', 'tickefic') . '</a>
            </div>';
        }

        return '<div id="user-dashboard-root"></div>';
    }
}

new ShortCode();