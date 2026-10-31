import React, { useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
  CreditCard,
  Building,
  Calendar,
  Layers
} from 'lucide-react';
import { CartMandate } from '../types';
import { ThreeSecurityBadge } from './ThreeSecurityBadge';

interface DetailCardProps {
  mandate: CartMandate;
  onApprove: (id: string) => void;
  onToggleChatModal: () => void;
}

export const DetailCard: React.FC<DetailCardProps> = ({
  mandate,
  onApprove,
  onToggleChatModal
}) => {
  const [copied, setCopied] = useState(false);
  const isSettled = mandate.status === 'SETTLED';

  const handleCopyId = () => {
    navigator.clipboard.writeText(mandate.mandate_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mini sparkline / bar chart heights for Amount Trend (matching reference image)
  const trendBars = [35, 50, 42, 68, 85, 60];
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

  return (
    <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-5 transition-all animate-fadeIn">
      {/* Top Section: 3D Emblem, Titles, Lifecycle, and Trend Chart */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* Left Section: 3D Three.js Interactive Emblem & Title */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0">
            <ThreeSecurityBadge status={mandate.status} size={92} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 font-sans">
                {mandate.item}
              </h3>
              <span
                className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                  isSettled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {isSettled ? 'Verified & Settled' : 'A2A Mandate Formed'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="font-mono text-slate-600">{mandate.mandate_id}</span>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-slate-400 hover:text-slate-700 transition-colors"
                title="Copy Mandate ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-1.5 max-w-lg leading-relaxed">
              Customer upgraded from Basic to Pro plan. Includes autonomous AP2 SLA guarantees and high-frequency settlement.
            </p>

            {/* Quick Action Buttons (matching reference image: View Invoice, Edit, ...) */}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={onToggleChatModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>View A2A Chat</span>
              </button>

              {!isSettled ? (
                <button
                  type="button"
                  onClick={() => onApprove(mandate.mandate_id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-sm transition-colors active:scale-95"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Authorize Settlement</span>
                </button>
              ) : (
                <a
                  href={mandate.checkout_url || 'https://sandbox.paypal.com/checkout/mock'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-700 border border-emerald-200 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>View PayPal Receipt</span>
                  <ExternalLink className="w-3 h-3 text-emerald-500" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Center: Lifecycle Steps Flow (Created -> Processing -> Verifying -> Complete) */}
        <div className="flex items-center gap-4 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
              ✓
            </div>
            <span className="text-[10px] font-semibold text-slate-800 mt-1">Created</span>
            <span className="text-[9px] text-slate-400 font-mono">Oct 27, 6:45 PM</span>
          </div>

          <div className="w-8 h-0.5 bg-emerald-300 -mt-4"></div>

          <div className="flex flex-col items-center">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
              ●
            </div>
            <span className="text-[10px] font-semibold text-slate-800 mt-1">Processing</span>
            <span className="text-[9px] text-slate-400 font-mono">Oct 27, 6:45 PM</span>
          </div>

          <div className="w-8 h-0.5 bg-slate-200 -mt-4"></div>

          <div className="flex flex-col items-center">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isSettled ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {isSettled ? '✓' : '○'}
            </div>
            <span className="text-[10px] font-medium text-slate-600 mt-1">Verifying</span>
            <span className="text-[9px] text-slate-400 font-mono">...</span>
          </div>

          <div className="w-8 h-0.5 bg-slate-200 -mt-4"></div>

          <div className="flex flex-col items-center">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isSettled ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {isSettled ? '✓' : '4'}
            </div>
            <span className="text-[10px] font-medium text-slate-600 mt-1">Complete</span>
            <span className="text-[9px] text-slate-400 font-mono">Expected Oct 27</span>
          </div>
        </div>

        {/* Right: Amount Trend Mini Bar Chart (matching reference image) */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between min-w-[200px]">
          <div className="flex items-center justify-between text-[11px] mb-2">
            <span className="font-semibold text-slate-700">Amount Trend</span>
            <span className="text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Last 6 months
            </span>
          </div>

          {/* Bar Chart Columns */}
          <div className="flex items-end justify-between gap-2 h-14 pt-1 px-1 relative">
            {/* Tooltip Tag on 5th bar */}
            <div className="absolute -top-3 right-4 bg-slate-900 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
              ${mandate.total_value.toFixed(0)} This deal
            </div>

            {trendBars.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`w-full rounded-xs transition-all ${
                    i === 4 ? 'bg-blue-600' : 'bg-blue-200/80 hover:bg-blue-300'
                  }`}
                  style={{ height: `${h}%` }}
                />
                <span className="text-[9px] text-slate-400 font-mono">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Metadata Pills (matching reference image Row 3) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Building className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col truncate">
            <span className="text-[10px] text-slate-400">Customer</span>
            <span className="font-semibold text-slate-800 truncate">{mandate.consumer_agent}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CreditCard className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">Settlement Total</span>
            <span className="font-semibold text-emerald-700 font-mono">${mandate.total_value.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col truncate">
            <span className="text-[10px] text-slate-400">Order Tier</span>
            <span className="font-semibold text-slate-800 truncate">Enterprise A2A ({mandate.quantity} units)</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">Next Scheduled Cycle</span>
            <span className="font-semibold text-slate-800 font-mono">Nov 12, 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
