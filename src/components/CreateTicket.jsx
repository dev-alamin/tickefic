import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";

const CreateTicket = ({ onTicketCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initialFormState = {
    title: "",
    content: "",
    status: "publish",
    meta: {
      tickefic_priority: "normal",
      tickefic_status: "open",
    },
    tickefic_cat: [37], 
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("meta.")) {
      const metaKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        meta: { ...prev.meta, [metaKey]: value },
      }));
    } else if (name === "tickefic_cat") {
      setFormData((prev) => ({ ...prev, [name]: [parseInt(value)] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch({
        path: `/wp/v2/tickefic/`, // Relative path
        method: "POST",
        data: formData,
        headers: { "X-WP-Nonce": SupportDashboard.nonce }
      });

      setFormData(initialFormState);
      setIsOpen(false);
      
      if (onTicketCreated) onTicketCreated(data);
    } catch (err) {
      setError(err.message || __("Failed to create ticket", "tickefic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mb-8">
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="w-[300px] py-2 rounded-xl flex items-center justify-center gap-2 text-slate-600 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group">
          <span className="text-xl group-hover:rotate-90 transition-transform">＋</span>
          <span className="font-semibold">{__("Open a New Support Ticket", "tickefic")}</span>
        </button>
      ) : (
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800">{__("Create Ticket", "tickefic")}</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{__("Subject", "tickefic")}</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{__("Priority", "tickefic")}</label>
                <select name="meta.tickefic_priority" value={formData.meta.tickefic_priority} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none">
                  <option value="low">{__("Low", "tickefic")}</option>
                  <option value="normal">{__("Normal", "tickefic")}</option>
                  <option value="high">{__("High", "tickefic")}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{__("Category", "tickefic")}</label>
                <select name="tickefic_cat" value={formData.tickefic_cat[0]} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg outline-none">
                  <option value="38">{__("Technical Issue", "tickefic")}</option>
                  <option value="37">{__("Billing / Account", "tickefic")}</option>
                  <option value="39">{__("Feature Request", "tickefic")}</option>
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{__("Message", "tickefic")}</label>
              <textarea name="content" value={formData.content} onChange={handleChange} required rows="4" className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded border border-red-100">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-blue-600 disabled:bg-slate-400 text-white font-bold py-2.5 rounded-lg transition-colors">
              {loading ? __("Sending...", "tickefic") : __("Submit Ticket", "tickefic")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateTicket;