import React from 'react';
import { CartMandate } from '../../types';
import { CheckCircle2, Clock, ExternalLink, Receipt } from 'lucide-react';

interface TransactionHistoryProps {
  mandates: CartMandate[];
}

const STATUS_STYLES: Record<string, string> = {
  SETTLED:          'text-emerald-700 bg-emerald-50 border-emerald-200',
  AWAITING_PAYMENT: 'text-cyan-700 bg-cyan-50 border-cyan-200',
  PENDING_APPROVAL: 'text-amber-700 bg-amber-50 border-amber-200',
  NEGOTIATING:      'text-blue-700 bg-blue-50 border-blue-200',
  REJECTED:         'text-rose-700 bg-rose-50 border-rose-200',
  FAILED:           'text-rose-700 bg-rose-50 border-rose-200',
};

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ mandates }) => {
  return (
    <div className="space-y-2.5 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            4. Procurement History & PayPal Receipts
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {mandates.length} COMPLETED
          </span>
        </div>
        <span className="text-[11px] text-slate-400">Audited cryptographic settlements</span>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Target Line Item</th>
                <th className="px-4 py-2.5">Shopping Bot</th>
                <th className="px-4 py-2.5">Agreed Price</th>
                <th className="px-4 py-2.5">Units</th>
                <th className="px-4 py-2.5">Total Settled</th>
                <th className="px-4 py-2.5">Region</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">PayPal Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mandates.map((m, i) => (
                <tr
                  key={m.mandate_id}
                  className={`hover:bg-slate-50/70 transition-colors ${i === 0 ? 'bg-blue-50/30' : ''}`}
                >
                  <td className="px-4 py-3 font-mono text-slate-500">
                    {new Date(m.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 max-w-[200px] truncate">{m.item}</td>
                  <td className="px-4 py-3 text-slate-700">{m.consumer_agent}</td>
                  <td className="px-4 py-3 font-mono text-slate-700">${m.agreed_price.toFixed(2)}</td>
                  <td className="px-4 py-3 font-mono text-slate-700">{m.quantity}</td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                    ${m.total_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500">{m.region || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold ${STATUS_STYLES[m.status] || 'text-slate-600'}`}>
                      {m.status === 'SETTLED' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                      <span>{m.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {m.checkout_url ? (
                      <a
                        href={m.checkout_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        <span>View Order</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400 font-mono text-[10px]">Settled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
