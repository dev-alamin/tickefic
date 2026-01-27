import { useState, useEffect } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import CreateTicket from "./components/CreateTicket";
import ListTicket from "./components/ListTicket";
import "./App.css";
import User from "./components/User";

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tickets once when the app loads
  useEffect(() => {
    apiFetch({
      path: "http://localhost/devspark/wordpress-backend/wp-json/wp/v2/tickefic/tickets?_embed",
    })
      .then((data) => {
        setTickets(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // This function will be called by CreateTicket
  const handleTicketCreated = (newTicket) => {
    // Add the new ticket to the top of the list immediately
    setTickets((prevTickets) => [newTicket, ...prevTickets]);
  };

  const [user, setUser] = useState(null);
  const [statusLoading, setIsStatusLoading] = useState(true);

  useEffect(() => {
    apiFetch({
      path: "http://localhost/devspark/wordpress-backend/wp-json/tickefic/v1/user-status", // Relative path is safer
      method: "GET",
      credentials: "same-origin",
      headers: {
        "X-WP-Nonce": SupportDashboard.nonce,
      },
    })
      .then((response) => {
        if (response.logged_in) {
          setUser(response.user);
          setIsStatusLoading(false);
        }
      })
      .catch((err) => console.error("Auth check failed", err))
      .finally(() => setIsStatusLoading(false)); // End loading regardless of result
  }, []);

  return (
    <div className="tickefic-dashboard">
      { user ? (
        <>
        <User user={user} isLoading={statusLoading} />
          <CreateTicket onTicketCreated={handleTicketCreated} />
          <ListTicket
            tickets={tickets}
            loading={loading}
            setTickets={setTickets} // Pass this if ListTicket needs to update state (like for replies)
          />
        </>
      ):
      <User user={user} isLoading={statusLoading} />
      }
    </div>
  );
}
