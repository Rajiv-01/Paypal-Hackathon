import React, { useState } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { Check, Loader2, ExternalLink, MoreHorizontal, MessageSquare, BarChart2 } from 'lucide-react';
import { CartMandate } from '../types';

export const ActionCellRenderer: React.FC<ICellRendererParams<CartMandate>> = (params) => {
  const [loading, setLoading] = useState(false);
  const data = params.data;

  if (!data) return null;

  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading || data.status === 'SETTLED') return;
    setLoading(true);
    try {
      const response = await fetch('/api/execute-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mandate_id: data.mandate_id }),
      });
      if (!response.ok) throw new Error(`Settlement failed: ${response.statusText}`);
      const result     = await response.json();
      const checkoutUrl = result.checkout_url || 'https://sandbox.paypal.com/checkout/mock';

      if (params.node) {
        params.node.setData({ ...data, status: 'SETTLED', checkout_url: checkoutUrl });
      }
      if (params.context?.onApproveSuccess) {
        params.context.onApproveSuccess(data.mandate_id, checkoutUrl);
      }
    } catch (error) {
      console.error('Failed to approve mandate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (params.context?.onOpenChat) params.context.onOpenChat(data);
  };

  const handleOpenAnalytics = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (params.context?.onOpenAnalytics) params.context.onOpenAnalytics(data);
  };

  const handleInspect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (params.context?.onInspectMandate) params.context.onInspectMandate(data);
  };

  return (
    <div className="flex items-center gap-1 h-full">
      {data.status === 'SETTLED' ? (
        <a
          href={data.checkout_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
        >
          <Check className="w-3 h-3 text-emerald-600" />
          <span>Settled</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
        </a>
      ) : (
        <button
          onClick={handleApprove}
          disabled={loading}
          id={`approve-btn-${data.mandate_id}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm disabled:opacity-50 transition-all"
        >
          {loading
            ? <><Loader2 className="w-3 h-3 animate-spin" /><span>Settling...</span></>
            : <><Check className="w-3 h-3 stroke-[2.5]" /><span>Approve</span></>
          }
        </button>
      )}

      {/* Analytics Button */}
      <button
        type="button"
        onClick={handleOpenAnalytics}
        className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
        title="View Product Analytics & Regional Demand"
      >
        <BarChart2 className="w-3.5 h-3.5" />
      </button>

      {/* Chat Trigger */}
      <button
        type="button"
        onClick={handleOpenChat}
        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        title="Open A2A Dialogue"
      >
        <MessageSquare className="w-3.5 h-3.5" />
      </button>

      {/* Options */}
      <button
        onClick={handleInspect}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        title="More options"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
