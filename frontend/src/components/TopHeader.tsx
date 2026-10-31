import React from 'react';
import {
  Search,
  Calendar,
  ArrowUpRight,
  Sparkles,
  Zap,
  Package
} from 'lucide-react';
import { CartMandate } from '../types';

interface TopHeaderProps {
  mandates: CartMandate[];
  onOpenSimulate?: () => void;
  onTriggerBurst?: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  mandates,
  searchTerm,
  onSearchChange
}) => {
  const totalVolume = mandates.reduce((sum, m) => sum + (m.total_value || 0), 0);
  const pendingCount = mandates.filter((m) => m.status === 'PENDING_APPROVAL').length;
  const settledCount = mandates.filter((m) => m.status === 'SETTLED').length;
  const highRiskCount = mandates.filter((m) => m.risk_score > 50).length;

  return (
    <div className="space-y-4 font-sans">
      {/* Top Title & Command Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Transactions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track, negotiate and settle all your autonomous A2A commerce mandates in real-time.
          </p>
        </div>

        {/* Search, Date Picker, Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Search Input with ⌘ K */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search transactions, agents, customers..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-11 py-1.5 rounded-md bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-64 shadow-xs transition-all"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-400 px-1 py-0.2 rounded bg-slate-100 border border-slate-200">
              ⌘ K
            </span>
          </div>

          {/* Date Picker Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-xs cursor-pointer hover:bg-slate-50 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Today, Oct 12, 2026</span>
          </div>
        </div>
      </div>

      {/* Compact Sleek KPI Stat Cards Row (Decreased height, streamlined padding, mini sparklines) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {/* Card 1: Cleared Volume */}
        <div className="px-3 py-2.5 rounded-lg bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between h-[86px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Cleared Volume</span>
            <div className="w-5 h-5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-1">
            <div className="leading-none">
              <div className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-mono">
                ${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium mt-1">
                <span className="font-bold">↑ 14.8%</span>
                <span className="text-slate-400">vs last cycle</span>
              </div>
            </div>
            {/* Mini Sparkline Bar Chart (Emerald) */}
            <div className="flex items-end gap-1 h-7 pb-0.5 shrink-0">
              {[35, 50, 40, 65, 80, 95].map((h, i) => (
                <div key={i} className="w-1.5 bg-emerald-200 rounded-xs" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Pending Signoff */}
        <div className="px-3 py-2.5 rounded-lg bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between h-[86px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Pending Signoff</span>
            <div className="w-5 h-5 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-1">
            <div className="leading-none">
              <div className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-mono">
                {pendingCount} Deals
              </div>
              <div className="mt-1">
                <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-semibold text-[10px]">
                  Awaiting Human
                </span>
              </div>
            </div>
            {/* Mini Sparkline Bar Chart (Amber) */}
            <div className="flex items-end gap-1 h-7 pb-0.5 shrink-0">
              {[25, 40, 55, 45, 70, 60].map((h, i) => (
                <div key={i} className="w-1.5 bg-amber-200 rounded-xs" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Settled (PayPal) */}
        <div className="px-3 py-2.5 rounded-lg bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between h-[86px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Settled (PayPal)</span>
            <div className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-1">
            <div className="leading-none">
              <div className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-mono">
                {settledCount} Orders
              </div>
              <div className="mt-1">
                <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold font-mono text-[10px]">
                  100% SLA
                </span>
              </div>
            </div>
            {/* Mini Sparkline Bar Chart (Blue) */}
            <div className="flex items-end gap-1 h-7 pb-0.5 shrink-0">
              {[30, 45, 50, 70, 85, 100].map((h, i) => (
                <div key={i} className="w-1.5 bg-blue-200 rounded-xs" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Card 4: Total Mandates */}
        <div className="px-3 py-2.5 rounded-lg bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between h-[86px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Total Mandates</span>
            <div className="w-5 h-5 rounded bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-3 h-3 text-purple-600" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-1">
            <div className="leading-none">
              <div className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-mono">
                {mandates.length}
              </div>
              <div className="mt-1">
                <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-semibold text-[10px]">
                  {highRiskCount} Flagged
                </span>
              </div>
            </div>
            {/* Mini Sparkline Bar Chart (Purple) */}
            <div className="flex items-end gap-1 h-7 pb-0.5 shrink-0">
              {[40, 55, 35, 75, 90, 80].map((h, i) => (
                <div key={i} className="w-1.5 bg-purple-200 rounded-xs" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Card 5: AI Insights Card (Compact Navy) */}
        <div className="px-3 py-2.5 rounded-lg bg-slate-900 text-white border border-slate-800 shadow-xs flex flex-col justify-between h-[86px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-100">
              <Sparkles className="w-3 h-3 text-blue-400 fill-blue-400" />
              <span>AI Insights</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[8px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono font-bold">AP2</span>
              <span className="text-[8px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono font-bold">CORE</span>
            </div>
          </div>
          <div className="text-[10.5px] text-slate-300 leading-snug line-clamp-2">
            Autonomous negotiations running at <strong className="text-white font-semibold">14ms latency</strong>. Zero breach incidents.
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AP2 Gateway Active &amp; Guarded</span>
          </div>
        </div>
      </div>
    </div>
  );
};
