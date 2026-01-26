import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import CreateTicket from './components/CreateTicket';
import ListTicket from './components/ListTicket';
import './App.css';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tickets once when the app loads
  useEffect(() => {
    apiFetch({ path: 'http://localhost/devspark/wordpress-backend/wp-json/wp/v2/tickefic/tickets?_embed' })
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

  return (
    <div className="tickefic-dashboard">
      <CreateTicket onTicketCreated={handleTicketCreated} />
      <ListTicket 
        tickets={tickets} 
        loading={loading} 
        setTickets={setTickets} // Pass this if ListTicket needs to update state (like for replies)
      />
    </div>
  );
}