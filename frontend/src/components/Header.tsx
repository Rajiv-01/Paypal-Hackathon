import React from 'react';
import {
  ShieldCheck,
  Bot,
  Zap,
  Activity,
  DollarSign,
  Clock,
  Flame,
  Download
} from 'lucide-react';
import { CartMandate } from '../types';

interface HeaderProps {
  wsConnected: boolean;
  onOpenSimulate: () => void;
  onTriggerBurst: () => void;
  onExportCsv: () => void;
  mandates: CartMandate[];
}

export const Header: React.FC<HeaderProps> = ({
  wsConnected,
  onOpenSimulate,
  onTriggerBurst,
  onExportCsv,
  mandates
}) => {
  const totalVolume = mandates.reduce((sum, m) => sum + (m.total_value || 0), 0);
  const pendingCount = mandates.filter((m) => m.status === 'PENDING_APPROVAL').length;
  const settledCount = mandates.filter((m) => m.status === 'SETTLED').length;
  const avgRisk = mandates.length
    ? Math.round(mandates.reduce((sum, m) => sum + (m.risk_score || 0), 0) / mandates.length)
    : 0;

  return (
    <header className="border-b border-slate-850 bg-[#090d16]/95 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Terminal Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40 shrink-0">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2 font-mono">
                  <span>autonopay</span>
                  <span className="text-[10px] font-sans uppercase font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                    A2A Terminal
                  </span>
                </h1>
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${
                    wsConnected
                      ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/70 border-rose-500/50 text-rose-300'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                    }`}
                  ></span>
                  <span>{wsConnected ? 'STREAM ACTIVE' : 'DISCONNECTED'}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Institutional Financial Clearance Gateway for Autonomous Agent-to-Agent Commerce
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5">
            {/* Export CSV */}
            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 hover:border-slate-700 font-mono transition-colors"
              title="Export AG Grid to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>

            {/* Quick Burst Button */}
            <button
              onClick={onTriggerBurst}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold shadow-sm transition-all active:scale-95"
              title="Simulate 4 concurrent streaming agents"
            >
              <Flame className="w-3.5 h-3.5 text-purple-400 fill-current" />
              <span>Stream Burst</span>
            </button>

            {/* Inbound Agent Simulator Button */}
            <button
              onClick={onOpenSimulate}
              id="simulate-agent-btn"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 active:scale-95 text-xs text-slate-950 font-mono font-black shadow-lg shadow-cyan-500/25 transition-all border border-cyan-300/40"
            >
              <Zap className="w-4 h-4 fill-current text-slate-950" />
              <span>Simulate Agent</span>
            </button>
          </div>
        </div>

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3.5 pt-3 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="p-1.5 rounded-lg bg-blue-950/80 border border-blue-500/30 text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Total Deals</div>
              <div className="text-sm font-bold text-white font-mono">{mandates.length} mandates</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-500/30 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Pending Signoff</div>
              <div className="text-sm font-bold text-amber-300 font-mono">{pendingCount} orders</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                Cleared Volume ({settledCount} Settled)
              </div>
              <div className="text-sm font-bold text-emerald-300 font-mono">
                ${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="p-1.5 rounded-lg bg-purple-950/80 border border-purple-500/30 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Average Risk</div>
              <div className="text-sm font-bold text-purple-300 font-mono">{avgRisk}% / 100%</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
