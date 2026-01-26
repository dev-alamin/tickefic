import { useState, useEffect } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";

export default function ListTicket() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [replies, setReplies] = useState([]); // Store current ticket replies
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const decodeEntities = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value.replace(/<[^>]*>/g, "");
  };

  // Initial Fetch
  useEffect(() => {
    apiFetch({
      path: "http://localhost/devspark/wordpress-backend/wp-json/wp/v2/tickefic/tickets",
    })
      .then((data) => {
        setTickets(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Fetch Replies when a ticket is expanded
  useEffect(() => {
    if (expandedTicket) {
      setReplies([]); // Clear previous replies while loading
      apiFetch({
        path: `http://localhost/devspark/wordpress-backend/wp-json/wp/v2/comments?post=${expandedTicket}&order=asc`,
      })
        .then((data) => setReplies(data))
        .catch((err) => console.error("Error fetching replies:", err));
    }
  }, [expandedTicket]);

  const handleReply = (ticketId) => {
    if (!replyText.trim()) return;
    setSubmitting(true);

    apiFetch({
      path: "http://localhost/devspark/wordpress-backend/wp-json/wp/v2/comments",
      method: "POST",
      data: {
        post: ticketId,
        content: replyText,
        status: "approve",
      },
      headers: {
        "X-WP-Nonce": SupportDashboard.nonce,
      },
    })
      .then((newComment) => {
        // Update state locally for real-time feel
        setReplies([...replies, newComment]);
        setReplyText("");
        setSubmitting(false);
      })
      .catch((err) => {
        alert(err.message || __("Failed to send reply.", "tickefic"));
        setSubmitting(false);
      });
  };

  if (loading)
    return (
      <div className="p-10 text-center">{__("Loading...", "tickefic")}</div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {tickets.map((ticket) => {
        const isExpanded = expandedTicket === ticket.id;

        return (
          <div
            key={ticket.id}
            className={`bg-white border rounded-xl overflow-hidden transition-all ${isExpanded ? "border-blue-500 shadow-lg" : "border-slate-200"}`}
          >
            {/* Ticket Header */}
            <div
              className="p-4 cursor-pointer hover:bg-slate-50 flex justify-between items-center"
              onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
            >
              <div>
                <h2 className="text-md font-bold text-slate-900">
                  {decodeEntities(ticket.title.rendered)}
                </h2>
                <div className="flex gap-2 text-[10px] mt-1 uppercase font-bold text-slate-400">
                  <span>#{ticket.id}</span>
                  <span>•</span>
                  <span>{ticket.meta.tickefic_status}</span>
                </div>
              </div>
              <span className="text-blue-600 text-xs font-bold">
                {isExpanded
                  ? __("Close", "tickefic")
                  : __("View Thread", "tickefic")}
              </span>
            </div>

            {/* Expanded Thread Section */}
            {isExpanded && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                {/* Original Ticket Content */}
                <div className="flex gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                    U
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl rounded-tl-none border border-blue-100 text-sm text-slate-700 flex-1 shadow-sm">
                    <div className="font-bold mb-1 text-blue-800 text-xs">
                      {__("Ticket Opener", "tickefic")}
                    </div>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: ticket.content.rendered,
                      }}
                    />
                  </div>
                </div>

                {/* The Conversation / Replies */}
                <div className="space-y-4 mb-8">
                  {replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`flex gap-3 ${reply.author === 1 ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold ${reply.author === 1 ? "bg-slate-800" : "bg-blue-400"}`}
                      >
                        {reply.author === 1 ? "A" : "U"}
                      </div>
                      <div
                        className={`p-4 rounded-2xl text-sm flex-1 max-w-[80%] shadow-sm border ${reply.author === 1 ? "bg-white border-slate-200 rounded-tr-none" : "bg-blue-50 border-blue-100 rounded-tl-none"}`}
                      >
                        <div className="font-bold mb-1 text-[10px] uppercase tracking-wide flex justify-between">
                          <span>{reply.author_name}</span>
                          <span className="font-normal text-slate-400 lowercase">
                            {new Date(reply.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: reply.content.rendered,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <textarea
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder={__("Write your reply...", "tickefic")}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => handleReply(ticket.id)}
                      disabled={submitting}
                      className="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                    >
                      {submitting
                        ? __("Sending...", "tickefic")
                        : __("Send Reply", "tickefic")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
