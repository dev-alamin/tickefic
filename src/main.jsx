import { createRoot } from "@wordpress/element";
import App from "./App";
import "./index.css";

const container = document.getElementById("user-dashboard-root");

/**
 * Important:
 * - Shortcode may not exist on every page
 * - Script may be enqueued globally or conditionally
 */
if (container) {
  /**
   * WP 6.2+ supports createRoot
   * Fallback is provided for older versions
   */
  if (createRoot) {
    const root = createRoot(container);
    root.render(<App />);
  }
}
