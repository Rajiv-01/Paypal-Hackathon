import React from 'react';
import {
  Layers, Receipt, FileText, Settings, Sparkles,
  Zap, CheckCircle2, Users, Target, BarChart2,
  Box, Blocks
} from 'lucide-react';

export type BusinessView = 'clearance' | 'swarm' | 'leads' | 'settlements' | 'invoices';

interface SidebarProps {
  transactionCount: number;
  leadCount?: number;
  activeView: BusinessView;
  onViewChange: (view: BusinessView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  transactionCount,
  leadCount = 3,
  activeView,
  onViewChange
}) => {
  const navItem = (
    label: string,
    Icon: React.FC<{ className?: string }>,
    view?: BusinessView,
    badge?: React.ReactNode
  ) => {
    const isActive = view ? activeView === view : false;
    return (
      <button
        type="button"
        onClick={() => view && onViewChange(view)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-xs font-semibold ${
          isActive
            ? 'bg-blue-50 text-blue-600 border border-blue-200/60 shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
          <span className="truncate">{label}</span>
        </div>
        {badge}
      </button>
    );
  };

  return (
    <aside className="w-52 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-slate-200">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 font-sans truncate">autonopay</span>
        </div>

        {/* Navigation Matching Reference Image */}
        <nav className="p-2.5 space-y-1 text-sm font-medium">
          {navItem('Overview', Box, 'clearance')}

          {navItem('Transactions', Layers, 'clearance',
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-blue-600 text-white shadow-xs">
              {transactionCount}
            </span>
          )}

          {navItem('Agent Swarm', Users, 'swarm',
            activeView === 'swarm' ? undefined : (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            )
          )}

          {navItem('Leads', Target, 'leads',
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-700">
              {leadCount}
            </span>
          )}

          {navItem('Settlements', Receipt, 'settlements')}

          {navItem('Invoices', FileText, 'invoices')}

          {navItem('Analytics', BarChart2, 'clearance')}

          {navItem('Integrations', Blocks, 'clearance')}

          {navItem('Settings', Settings, 'clearance')}
        </nav>
      </div>

      {/* Bottom Info & User Profile */}
      <div className="p-2.5 space-y-2 border-t border-slate-200">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 mb-1 text-slate-900 font-bold">
            <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            <span className="text-[11px]">AP2 Protocol</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-snug mb-1.5">
            Autonomous agent commerce layer.
          </p>
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-semibold">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
            <span>Gateway Verified</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-1 py-1">
          <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">SC</div>
          <div className="flex flex-col leading-none truncate">
            <span className="text-xs font-semibold text-slate-900 truncate">Sarah Chen</span>
            <span className="text-[10px] text-slate-400 truncate mt-0.5">sarah@autonopay.io</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
