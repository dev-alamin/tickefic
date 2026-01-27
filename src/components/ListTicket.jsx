import { useState, useEffect } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import TicketItem from "./TicketItem";

export default function ListTicket() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("open"); // Default tab
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const decodeEntities = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value.replace(/<[^>]*>/g, "");
  };

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

  useEffect(() => {
    if (expandedTicket) {
      setReplies([]);
      apiFetch({
        path: `http://localhost/devspark/wordpress-backend/wp-json/wp/v2/comments?post=${expandedTicket}&order=asc`,
      })
        .then((data) => setReplies(data))
        .catch((err) => console.error("Error fetching replies:", err));
    }
  }, [expandedTicket]);

  // Filter tickets based on the active tab
  const filteredTickets = tickets.filter((ticket) => {
    const status = ticket.meta.tickefic_status || "open";
    if (activeTab === "open") return status !== "closed";
    return status === "closed";
  });

  const handleReply = (ticketId) => {
    if (!replyText.trim()) return;
    setSubmitting(true);

    apiFetch({
      path: "http://localhost/devspark/wordpress-backend/wp-json/wp/v2/comments",
      method: "POST",
      data: { post: ticketId, content: replyText, status: "approve" },
    })
      .then((newComment) => {
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
    <div className="max-w-4xl space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("open")}
          className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 ${
            activeTab === "open"
              ? "border-blue-600 text-blue-600"
              : "!bg-slate-500 !rounded-0 border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          {__("Open Tickets", "tickefic")} (
          {
            tickets.filter(
              (t) => (t.meta.tickefic_status || "open") !== "closed",
            ).length
          }
          )
        </button>
        <button
          onClick={() => setActiveTab("closed")}
          className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 ${
            activeTab === "closed"
              ? "border-blue-600 text-blue-600"
              : "!bg-slate-500 !rounded-0 border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          {__("Closed", "tickefic")} (
          {tickets.filter((t) => t.meta.tickefic_status === "closed").length})
        </button>
      </div>

      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
            {__("No tickets found in this category.", "tickefic")}
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isExpanded = expandedTicket === ticket.id;
            return (
              <div
                key={ticket.id}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${isExpanded ? "border-slate-300 shadow-lg" : "border-slate-200 shadow-sm"}`}
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-slate-50 flex justify-between items-center"
                  onClick={() =>
                    setExpandedTicket(isExpanded ? null : ticket.id)
                  }
                >
                  <div>
                    <h2 className="!text-lg font-semibold text-slate-900 mb-1">
                      {decodeEntities(ticket.title.rendered)}
                    </h2>
                    <TicketItem ticket={ticket} />
                  </div>
                  <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">
                    {isExpanded
                      ? __("Close", "tickefic")
                      : __("View Thread", "tickefic")}
                  </span>
                </div>

                {/* Thread */}
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
                            className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${reply.author === 1 ? "bg-slate-800" : "bg-blue-400"}`}
                          >
                            {reply.author === 1 ? "A" : "U"}
                          </div>

                          <div
                            className={`p-4 rounded-2xl text-sm flex-1 max-w-[80%] shadow-sm border ${reply.author === 1 ? "bg-white border-slate-200 rounded-tr-none" : "bg-blue-50 border-blue-100 rounded-tl-none"}`}
                          >
                            <div className="font-bold mb-1 text-sm uppercase tracking-wide flex justify-between">
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
          })
        )}
      </div>
    </div>
  );
}
