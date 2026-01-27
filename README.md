Support Dashboard Plugin
========================

Overview
--------

A lightweight, modern ticketing system for WordPress. Logged-in users manage tickets via a React-powered frontend dashboard, while administrators handle requests through the native WordPress backoffice.

Key Features
------------

*   **Automated Setup:** Creates a "User Dashboard" page with \[tickefic\_user\_dashboard\] on activation.
    
*   **Modern Frontend:** React-based UI for ticket submission, status tracking, and profile management.
    
*   **Secure Authentication:** Custom REST login and session handling with nonce verification.
    
*   **Native Integration:** Uses Custom Post Types (CPT), Taxonomies, and Metadata for data storage.
    
*   **Role-Based Access:** Private views for customers; full oversight for agents and admins.
    

Architecture
------------

The plugin utilizes a **decoupled architecture**:

*   **Backend:** WordPress (PHP) provides the data layer and REST API.
    
*   **Frontend:** React handles UI and state management.
    
*   **Communication:** JSON-based exchange via the WordPress REST API using apiFetch.
    

Data Model
----------

### Tickets (tickefic\_ticket)

*   **Subject/Description:** Stored as post\_title and post\_content.
    
*   **Ownership:** Linked via post\_author.
    
*   **Status/Priority:** Managed through registered post metadata:
    
    *   tickefic\_status (Open, In Progress, Closed)
        
    *   tickefic\_priority (Low, Normal, High)
        
    *   tickefic\_assigned\_agent (User ID)
        

### Categories

*   Handled via the tickefic\_cat custom taxonomy.
    

REST API Endpoints
------------------

Custom routes registered under the tickefic/v1 namespace:

*   GET /user-status: Validates login session and retrieves user data.
    
*   POST /login: Handles secure frontend authentication.
    
*   GET /wp/v2/tickefic: Retrieves tickets (filtered by author/status).
    
*   POST /wp/v2/tickefic: Creates new tickets with metadata.
    

Security & Permissions
----------------------

*   **Data Isolation:** Users are restricted to viewing only their own posts via rest\_tickefic\_ticket\_query.
    
*   **Capability Mapping:** Subscribers are granted specific tickefic\_ticket capabilities without gaining access to standard blog posts.
    
*   **Meta Protection:** auth\_callback and user\_has\_cap filters ensure only authorized users can modify ticket attributes.
    
*   **Validation:** All inputs processed via sanitize\_text\_field and absint.
    

Technical Stack
---------------

*   **Backend:** PHP 7.4+, WordPress CPT, REST API.
    
*   **Frontend:** React, ES6+, Vite (Development).
    
*   **State Management:** React Hooks and WordPress apiFetch.
    
Future Scope
------------

*   **Priority Workflow:** Automated escalations based on ticket age.
    
*   **Attachments:** Support for media uploads via REST.
    
*   **Notifications:** Email triggers for status changes or agent replies.
    
*   **Agent Dashboard:** Dedicated React view for support staff.