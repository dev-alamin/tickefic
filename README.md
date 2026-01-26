# Support Dashboard Plugin

## Overview

This plugin provides a **frontend user dashboard** where logged-in users can submit and manage support tickets, while administrators handle tickets from the WordPress admin panel. The solution is designed as a **lightweight ticketing system** using native WordPress concepts (Custom Post Types, Comments, REST API) and a modern React-based frontend.

The goal of this test project was to demonstrate **clean architecture, secure REST-based communication, and long-term maintainability**, suitable for a monthly engagement.

---

## Key Features

* Automatic creation of a **User Dashboard** page on plugin activation
* Shortcode `[user_dashboard]` used as a React mount point
* Frontend dashboard for logged-in users
* Login form shown to logged-out users
* User profile view and edit section
* Support ticket submission from frontend
* View all submitted tickets with status
* Ticket replies using WordPress comments (bonus feature)
* Admin manages tickets and replies from WP Admin
* Fully responsive UI

---

## Architecture Overview

The plugin follows a **decoupled architecture**:

```
React Frontend (Browser)
        |
        | REST API (JSON)
        v
WordPress Backend (PHP)
        |
        v
WordPress Database
```

* **React** handles all frontend UI and state management
* **WordPress REST API** handles data creation, retrieval, and updates
* **No Node.js server** is required in production
* Node.js is used only during development for building frontend assets

---

## Why React-only Frontend

The dashboard is an **authenticated, application-style interface**, not a public content page. Using a React-only frontend provides:

* Clear separation of UI and business logic
* Easier long-term maintenance for a monthly project
* Faster iteration for new features
* Alignment with modern WordPress development practices (e.g. Gutenberg, WooCommerce Admin)

The shortcode is used purely as a **mount point** for the React application.

---

## Data Model Design

### Support Tickets

Support tickets are implemented using a **Custom Post Type (CPT)** called `support_ticket`.

Each ticket is stored as a post:

* `post_title` → Ticket subject
* `post_content` → Ticket description
* `post_author` → Ticket owner (user)
* `post_meta` → Ticket status (open, pending, closed)

### Ticket Replies (Bonus)

Replies are implemented using **WordPress comments**:

* Each reply is a comment
* `comment_post_ID` links the reply to a ticket
* Admin and user replies are both supported

This approach leverages WordPress’s built-in:

* Permission system
* Admin UI
* REST compatibility
* Database structure

---

## REST API Design

All frontend-backend communication is handled via custom REST API endpoints.

### Endpoints Overview

* `GET /support/v1/me` – Get current user profile
* `PUT /support/v1/me` – Update user profile
* `POST /support/v1/tickets` – Create a new ticket
* `GET /support/v1/tickets` – Get tickets for logged-in user
* `GET /support/v1/tickets/{id}` – Get single ticket with replies
* `POST /support/v1/tickets/{id}/reply` – Add reply to ticket (bonus)

---

## Security Considerations

Security was a primary focus of this implementation.

### Measures Implemented

* **Nonce verification** using `X-WP-Nonce`
* **Capability checks** using `current_user_can()`
* **Ownership validation** (users can only access their own tickets)
* **Input sanitization** using `sanitize_text_field()` and `wp_kses_post()`
* **Output escaping** using `esc_html()` and related functions
* REST `permission_callback` used on all routes

---

## Plugin Structure

```
support-dashboard/
├── support-dashboard.php
├── readme.md
├── assets/
│   └── build/
│       ├── app.[hash].js
│       └── app.[hash].css
├── includes/
│   ├── class-plugin.php
│   ├── class-rest.php
│   ├── class-tickets.php
│   ├── class-profile.php
│   └── helpers.php
└── src/
    └── React source files
```

* `assets/build` contains compiled frontend assets
* `src` contains React source (not used in production)
* `includes` contains backend logic separated by responsibility

---

## Automatic Page Creation

On plugin activation:

* A page titled **User Dashboard** is created
* The page content contains the shortcode `[user_dashboard]`
* The page ID is stored in the options table
* Duplicate pages are not created on reactivation

---

## Tech Stack

### Backend

* WordPress
* PHP 7+
* Custom Post Types
* REST API

### Frontend

* React
* Modern JavaScript (ES6+)
* Built using a bundler (Vite/Webpack)

### Development Tools

* Node.js (development only)
* Git

---

## Time Breakdown

* Architecture & planning: ~2 hours
* Backend (CPT + REST API): ~5 hours
* Frontend dashboard (React): ~6 hours
* Security & validation: ~2 hours
* Testing & refinement: ~2 hours

**Total:** ~17 hours

---

## Possible Improvements (Future Scope)

With more time, the following could be added:

* Ticket priority levels
* File attachments
* Email notifications
* Admin React dashboard
* Pagination and search
* Ticket status workflow automation

---

## Conclusion

This plugin demonstrates a **modern, scalable, and secure approach** to building a frontend dashboard in WordPress. By leveraging native WordPress features and a React-based UI, the solution is well-suited for long-term maintenance and future expansion.

support-dashboard/
 ├─ support-dashboard.php
 ├─ readme.md
 ├─ assets/
 │   └─ build/
 │       ├─ app.[hash].js
 │       ├─ app.[hash].css
 ├─ src/
 │   ├─ React source (not shipped)
 ├─ includes/
 │   ├─ class-plugin.php
 │   ├─ class-rest.php
 │   ├─ class-tickets.php
 │   ├─ class-profile.php
 │   └─ helpers.php
