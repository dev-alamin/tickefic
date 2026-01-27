import { useState, useEffect } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import CreateTicket from "./components/CreateTicket";
import ListTicket from "./components/ListTicket";
import User from "./components/User";
import "./App.css";

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [statusLoading, setIsStatusLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 2;

  // Inside App.js useEffect for fetching tickets:
  const [activeTab, setActiveTab] = useState("open");

  // 1. Fetch User Status
  useEffect(() => {
    apiFetch({
      path: "http://localhost/devspark/wordpress-backend/wp-json/tickefic/v1/user-status",
      method: "GET",
      headers: { "X-WP-Nonce": window.SupportDashboard?.nonce },
    })
      .then((response) => {
        if (response.logged_in) setUser(response.user);
      })
      .catch((err) => console.error("Auth check failed", err))
      .finally(() => setIsStatusLoading(false));
  }, []);

  // 2. Fetch Tickets
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    apiFetch({
      path: `http://localhost/devspark/wordpress-backend/wp-json/wp/v2/tickefic/?_embed&page=${currentPage}&per_page=${perPage}&tickefic_status=${activeTab}`,
      parse: false,
      headers: { "X-WP-Nonce": window.SupportDashboard?.nonce },
    })
      .then((response) => {
        setTotalPages(parseInt(response.headers.get("X-WP-TotalPages") || 1));
        return response.json();
      })
      .then((data) => {
        setTickets(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, currentPage, activeTab]); // Re-fetches only when these change

  // 3. Handle Auto-Update DOM
  const handleTicketCreated = (newTicket) => {
    if (currentPage === 1) {
      const ticketWithMeta = {
        ...newTicket,
        _embedded: { author: [{ name: user?.name }] },
      };
      setTickets((prev) => [ticketWithMeta, ...prev.slice(0, perPage - 1)]);
    } else {
      // If on another page, reset to page 1 to show the new ticket
      setCurrentPage(1);
    }
  };

  return (
    <div className="tickefic-dashboard">
      <User user={user} isLoading={statusLoading} />
      {user && (
        <>
          <CreateTicket onTicketCreated={handleTicketCreated} />
          <ListTicket
            tickets={tickets}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            activeTab={activeTab} // Pass the current string value
            setActiveTab={setActiveTab} // Pass the setter function
          />
        </>
      )}
    </div>
  );
}
