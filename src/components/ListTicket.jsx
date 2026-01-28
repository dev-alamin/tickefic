import { useState, useEffect } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";

/**
 * Main ListTicket Component
 */
export default function ListTicket({
  tickets,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  activeTab, // Lifted to App.js to trigger re-fetch
  setActiveTab, // Lifted to App.js to trigger re-fetch
}) {
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const decodeEntities = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value.replace(/<[^>]*>/g, "");
  };

  // Fetch replies when a ticket is expanded
  useEffect(() => {
    if (expandedTicket) {
      setReplies([]);
      apiFetch({
        path: `${SupportDashboard.api_url}wp/v2/comments?post=${expandedTicket}&order=asc&_embed`,
      })
        .then((data) => setReplies(data))
        .catch((err) => console.error("Error fetching replies:", err));
    }
  }, [expandedTicket]);

  const handleReply = (ticketId) => {
    if (!replyText.trim()) return;
    setSubmitting(true);

    apiFetch({
      path: "${SupportDashboard.api_url}wp/v2/comments",
      method: "POST",
      data: {
        post: ticketId,
        content: replyText,
        status: "approve",
      },
      headers: { "X-WP-Nonce": window.SupportDashboard?.nonce },
    })
      .then((newComment) => {
        setReplies([...replies, newComment]);
        setReplyText("");
      })
      .catch((err) =>
        alert(err.message || __("Failed to send reply.", "tickefic")),
      )
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="max-w-4xl space-y-6 mt-8">
      {/* Tab Navigation - Switching this now triggers a fetch in App.js */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab("open");
            onPageChange(1); // Crucial: Reset to page 1 when switching tabs
          }}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === "open"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500"
          }`}
        >
          {__("Active Tickets", "tickefic")}
        </button>
        <button
          onClick={() => {
            setActiveTab("closed");
            onPageChange(1);
          }}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === "closed"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          {__("Closed", "tickefic")}
        </button>
      </div>

      <div className="space-y-4 relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {tickets.length === 0 && !loading ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
            {__("No tickets found in this section.", "tickefic")}
          </div>
        ) : (
          tickets.map((ticket) => {
            const isExpanded = expandedTicket === ticket.id;
            const priority = ticket.meta?.tickefic_priority || "normal";

            return (
              <div
                key={ticket.id}
                className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${isExpanded ? "border-slate-300 shadow-xl" : "border-slate-200 shadow-sm"}`}
              >
                <div
                  className="p-5 cursor-pointer flex justify-between items-center group"
                  onClick={() =>
                    setExpandedTicket(isExpanded ? null : ticket.id)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-2 h-2 rounded-full ${priority === "high" ? "bg-red-500" : priority === "low" ? "bg-slate-300" : "bg-blue-500"}`}
                    ></div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600">
                        {decodeEntities(ticket.title.rendered)}
                      </h2>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium uppercase">
                        <span>#{ticket.id}</span>
                        <span>•</span>
                        <span>
                          {new Date(ticket.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-blue-600 text-xs font-black uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white">
                    {isExpanded
                      ? __("Close", "tickefic")
                      : __("View Thread", "tickefic")}
                  </span>
                </div>

                {isExpanded && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/30">
                    <div className="flex gap-4 mb-8">
                      <div className="w-10 h-10 rounded-full bg-slate-900 flex-shrink-0 flex items-center justify-center text-white font-bold">
                        {ticket._embedded?.author?.[0]?.name?.charAt(0) || "U"}
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 text-sm text-slate-700 flex-1 shadow-sm">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: ticket.content.rendered,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-6 mb-8">
                      {replies.map((reply) => (
                        <div
                          key={reply.id}
                          className={`flex gap-4 ${reply.author !== ticket.author ? "flex-row-reverse text-right" : ""}`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${reply.author !== ticket.author ? "bg-blue-600" : "bg-slate-400"}`}
                          >
                            {reply.author_name?.charAt(0)}
                          </div>
                          <div
                            className={`p-5 rounded-2xl text-sm max-w-[85%] border ${reply.author !== ticket.author ? "bg-blue-50 border-blue-100" : "bg-white border-slate-200"}`}
                          >
                            <div className="font-bold mb-2">
                              {reply.author_name}
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

                    <div className="mt-8 pt-8 border-t border-slate-200">
                      <textarea
                        className="w-full p-4 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
                        rows="4"
                        placeholder={__(
                          "Type your response here...",
                          "tickefic",
                        )}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => handleReply(ticket.id)}
                          disabled={submitting || !replyText.trim()}
                          className="px-8 py-3 bg-slate-900 text-white text-xs font-black uppercase rounded-xl hover:bg-blue-600 transition-all"
                        >
                          {submitting
                            ? __("Sending...", "tickefic")
                            : __("Post Reply", "tickefic")}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 pb-10">
          <button
            disabled={currentPage === 1 || loading}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:text-blue-600 disabled:opacity-40"
          >
            ←
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => onPageChange(i + 1)}
              className={`py-2 px-4 text-sm font-bold rounded-xl transition-all ${currentPage === i + 1 ? "!bg-blue-600 !text-white shadow-lg shadow-blue-200" : "!bg-white !text-slate-500 border border-slate-200"}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages || loading}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:text-blue-600 disabled:opacity-40"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
