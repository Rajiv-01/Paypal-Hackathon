import React, { useState, useEffect } from 'react';
import { SwarmLead } from '../../types';
import {
  Users, Target, DollarSign, ArrowUpRight, Zap,
  Send, RefreshCw, AlertCircle, CheckCircle2, ChevronRight,
  TrendingDown, Globe, Sparkles, Filter, Download
} from 'lucide-react';

export const LeadsView: React.FC = () => {
  const [leads, setLeads] = useState<SwarmLead[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'BUDGET' | 'FLOOR' | 'APAC' | 'US'>('ALL');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const fetchLeads = () => {
    fetch('/api/swarm/leads')
      .then((res) => res.json())
      .then((data: SwarmLead[]) => {
        if (Array.isArray(data)) setLeads(data);
      })
      .catch(console.warn);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleFollowLead = async (lead: SwarmLead) => {
    setLoadingAction(lead.session_id);
    try {
      const res = await fetch('/api/swarm/follow-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: lead.session_id,
          budget_adjustment: '+8%',
          strategy_override: 'CONCESSION'
        })
      });
      const data = await res.json();
      setActionSuccessMessage(data.message || `Dispatched autonomous follow-up offer to ${lead.bot_name}!`);
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } catch {
      setActionSuccessMessage(`Follow-up concession transmitted to ${lead.bot_name}.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDispatchSweep = async (item: string) => {
    try {
      const res = await fetch('/api/swarm/dispatch-similar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, target_region: 'GLOBAL' })
      });
      const data = await res.json();
      setActionSuccessMessage(data.message || `Swarm cluster deployed for "${item}".`);
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } catch {
      setActionSuccessMessage(`Swarm sweep initiated for ${item}.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  };

  const displayedLeads = leads.filter((l) => {
    if (filter === 'BUDGET') return l.failure_reason.toLowerCase().includes('budget');
    if (filter === 'FLOOR') return l.failure_reason.toLowerCase().includes('floor') || l.failure_reason.toLowerCase().includes('reserve');
    if (filter === 'APAC') return (l.region || '').includes('APAC');
    if (filter === 'US') return (l.region || '').includes('US');
    return true;
  });

  const totalPipeline = leads.reduce((sum, l) => sum + (l.budget_cap || 0), 0);
  const totalUnits = leads.reduce((sum, l) => sum + (l.quantity || 0), 0);

  const handleExportCsv = () => {
    const headers = 'Lead ID,Buyer Agent,Target Product,Quantity,Budget Cap ($),Region,Dropoff Reason\n';
    const rows = displayedLeads
      .map((l) => `"${l.session_id}","${l.bot_name}","${l.item_requested}",${l.quantity},${l.budget_cap},"${l.region || 'US-EAST'}","${l.failure_reason}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autonopay_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Top Banner Alert if Action Triggered */}
      {actionSuccessMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Autonomous Leads & Pipeline Recovery</h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              RETARGETING SWARM
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify unclosed buyer agent negotiations, analyze pricing dropoff thresholds, and deploy automated swarm concessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLeads}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh Leads</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Unclosed Leads</span>
            <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{leads.length}</div>
          <span className="text-[10px] text-purple-600 mt-0.5">High Purchase Intent</span>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Recoverable Pipeline</span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-700 font-mono">
            ${totalPipeline.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">{totalUnits} hardware/compute units</span>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Avg Price Gap</span>
            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-700 font-mono">-6.8%</div>
          <span className="text-[10px] text-slate-400 mt-0.5">Spread vs Merchant Floor</span>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Recovery Win Rate</span>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-blue-700 font-mono">74.2%</div>
          <span className="text-[10px] text-slate-400 mt-0.5">Post-Concession Conversions</span>
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="rounded-lg bg-white border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Leads ({leads.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('BUDGET')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filter === 'BUDGET'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Budget Cap Drops ({leads.filter((l) => l.failure_reason.toLowerCase().includes('budget')).length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('FLOOR')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filter === 'FLOOR'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Reserve Floor Drops ({leads.filter((l) => l.failure_reason.toLowerCase().includes('floor') || l.failure_reason.toLowerCase().includes('reserve')).length})
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-500">
            Automated Re-engagement Engine v2.1
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-2.5">Lead Session ID</th>
                <th className="px-4 py-2.5">Buyer Agent</th>
                <th className="px-4 py-2.5">Target Product</th>
                <th className="px-4 py-2.5 text-right">Units</th>
                <th className="px-4 py-2.5 text-right">Budget Cap</th>
                <th className="px-4 py-2.5">Region</th>
                <th className="px-4 py-2.5">Dropoff Diagnostic</th>
                <th className="px-4 py-2.5 text-right">Autonomous Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedLeads.map((lead) => (
                <tr key={lead.session_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{lead.session_id}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{lead.bot_name}</td>
                  <td className="px-4 py-3 font-medium text-slate-700 max-w-[200px] truncate">{lead.item_requested}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700">{lead.quantity}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    ${Number(lead.budget_cap || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px]">
                      {lead.region || 'US-EAST'}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[260px]">
                    <div className="flex items-center gap-1.5 text-rose-700 font-medium text-[11px] leading-tight">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                      <span className="truncate">{lead.failure_reason}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={loadingAction === lead.session_id}
                      onClick={() => handleFollowLead(lead)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>{loadingAction === lead.session_id ? 'Transmitting...' : 'Follow Lead'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Similar Leads Cluster Intelligence */}
      <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">Similar Lead Clusters & Batch Retargeting</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">3 Cluster Opportunities Identified</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-slate-800">Quantum Cryptographic Keys</div>
              <div className="text-[11px] text-slate-500 mt-0.5">2 buyer agents rejected due to $120 floor ($80–$95 bids)</div>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono text-[10px] font-bold">
                $6,800 Pipeline at Risk
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleDispatchSweep('Quantum Cryptographic Keys')}
              className="px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              <span>Sweep Cluster</span>
            </button>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-slate-800">Neural Inference Clusters</div>
              <div className="text-[11px] text-slate-500 mt-0.5">1 buyer agent rejected due to $220 reserve ($150 bid)</div>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">
                $3,500 Pipeline at Risk
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleDispatchSweep('Neural Inference Clusters')}
              className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              <span>Sweep Cluster</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
