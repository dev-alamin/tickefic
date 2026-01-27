<?php
/**
 * Class Roles_Permissions
 * Handles custom roles and capabilities for Tickefic plugin
 */
class Roles_Permissions {
    /**
     * Constructor
     * Initializes hooks for capability management
     */
    public function __construct() {
        add_filter( 'user_has_cap', [ $this, 'filter_user_capabilities' ], 10, 3 );
        add_action( 'init', [ $this, 'grant_subscriber_capabilities' ] );
    }

    /**
     * Filter user capabilities for custom post meta
     *
     * @param array $allcaps User capabilities
     * @param array $caps Capability being checked
     * @param array $args Additional arguments
     * @return array Modified capabilities
     */
    public function filter_user_capabilities( $allcaps, $caps, $args ) {
        if ( isset( $args[0] ) && $args[0] === 'edit_post_meta' && strpos( $args[3] ?? '', 'tickefic_' ) === 0 ) {
            if ( is_user_logged_in() ) {
                $allcaps[ $caps[0] ] = true;
            }
        }
        return $allcaps;
    }

    /**
     * Grant capabilities to subscriber role
     */
    public function grant_subscriber_capabilities() {
        $role = get_role( 'subscriber' );
        if ( $role ) {
            $capabilities = [ 'edit_posts', 'publish_posts', 'edit_tickefic_ticket', 'publish_tickefic_tickets' ];
            foreach ( $capabilities as $cap ) {
                $role->add_cap( $cap );
            }
        }
    }
}

// Initialize the class
new Roles_Permissions();