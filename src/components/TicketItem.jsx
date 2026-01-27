import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

// ... inside your map loop in ListTicket
export default function TicketItem({ ticket }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    
    // Trigger the tooltip
    setCopiedId(id);
    
    // Hide it after 2 seconds
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex gap-2 text-sm mt-1 font-bold text-slate-400">
      <div className="relative flex items-center">
        <button
          onClick={(e) => handleCopy(e, ticket.id)}
          className="ml-2 text-slate-400 !text-xs transition-colors !p-0 !bg-white flex items-center group"
          title={__('Copy ticket ID', 'tickefic')}
        >
          <span className="px-2 py-1 text-black bg-slate-100 rounded-l-md border-y border-l border-slate-200 group-hover:bg-slate-200 transition-colors">
            #{ticket.id}
          </span>
          <span className="px-2 py-1 bg-white border border-slate-200 rounded-r-md group-hover:border-blue-400 transition-colors">
            📋
          </span>
        </button>

        {/* Tooltip Popup */}
        {copiedId === ticket.id && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow-lg animate-bounce">
            {__('Copied!', 'tickefic')}
            {/* Tooltip Arrow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
          </div>
        )}
      </div>

      <span className="flex items-center"></span>

      <span className="bg-yellow-100 border border-yellow-200 rounded-md px-2 py-1 text-black text-xs">
        {ticket.meta.tickefic_status}
      </span>
    </div>
  );
}