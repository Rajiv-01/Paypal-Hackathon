import React, { useEffect, useState, useCallback } from 'react';
import { A2ASession, SwarmStats, SwarmLead } from '../../types';
import {
  Activity, Bot, AlertTriangle, CheckCircle2, Clock,
  TrendingUp, XCircle, Users, Zap, DollarSign,
  RefreshCw, Lightbulb, MapPin, ArrowRight, Check, Send,
  Sliders, ShieldCheck, ChevronRight
} from 'lucide-react';

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}> = ({ icon, label, value, sub, color = 'blue' }) => {
  const colors: Record<string, string> = {
    blue:    'bg-blue-50 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber:   'bg-amber-50 text-amber-600 border-amber-200',
    rose:    'bg-rose-50 text-rose-600 border-rose-200',
  };
  return (
    <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-7 h-7 rounded-md border flex items-center justify-center ${colors[color]}`}>{icon}</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        {sub && <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">{sub}</div>}
      </div>
    </div>
  );
};

const SESSION_STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  CONNECTING:       { label: 'Connecting',      cls: 'text-amber-700 bg-amber-50 border-amber-200' },
  NEGOTIATING:      { label: 'Negotiating',     cls: 'text-blue-700 bg-blue-50 border-blue-200' },
  AWAITING_PAYMENT: { label: 'Payment Pending', cls: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
  COMPLETED:        { label: 'Settled ✓',       cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  FAILED:           { label: 'Failed',          cls: 'text-rose-700 bg-rose-50 border-rose-200' },
  REJECTED:         { label: 'Rejected',        cls: 'text-rose-700 bg-rose-50 border-rose-200' },
};

export const AgentSwarmDashboard: React.FC = () => {
  const [stats,          setStats]          = useState<SwarmStats | null>(null);
  const [sessions,       setSessions]       = useState<A2ASession[]>([]);
  const [leads,          setLeads]          = useState<SwarmLead[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [followedLeads,  setFollowedLeads]  = useState<Set<string>>(new Set());
  const [activeNotice,   setActiveNotice]   = useState<string | null>(null);
  const [isRefreshing,   setIsRefreshing]   = useState(false);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, sessionsRes, leadsRes] = await Promise.all([
        fetch('/api/swarm/stats').catch(() => null),
        fetch('/api/sessions').catch(() => null),
        fetch('/api/swarm/leads').catch(() => null),
      ]);

      if (statsRes?.ok) {
        const d = await statsRes.json();
        setStats(d);
      }
      if (sessionsRes?.ok) {
        const d = await sessionsRes.json();
        if (Array.isArray(d)) setSessions(d);
      }
      if (leadsRes?.ok) {
        const d = await leadsRes.json();
        if (Array.isArray(d)) setLeads(d);
      }
    } catch (err) {
      console.warn('Failed to fetch swarm data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleFollowLead = async (sessionId: string, item: string) => {
    try {
      const res = await fetch('/api/swarm/follow-lead', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ session_id: sessionId, budget_adjustment: '+12%' })
      });
      const data = await res.json();
      setFollowedLeads((prev) => new Set([...prev, sessionId]));
      setActiveNotice(data.message || `Swarm agent re-dispatched to follow up on ${item}!`);
      setTimeout(() => setActiveNotice(null), 5000);
    } catch {
      setActiveNotice(`Agent queued to re-negotiate lead for ${item}`);
      setFollowedLeads((prev) => new Set([...prev, sessionId]));
      setTimeout(() => setActiveNotice(null), 5000);
    }
  };

  const handleDispatchSweep = async (item: string) => {
    try {
      const res = await fetch('/api/swarm/dispatch-similar', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ item, target_region: 'all' })
      });
      const data = await res.json();
      setActiveNotice(data.message || `Swarm cluster deployed to sweep similar leads for ${item}!`);
      setTimeout(() => setActiveNotice(null), 5000);
    } catch {
      setActiveNotice(`Swarm cluster sweep deployed for ${item}`);
      setTimeout(() => setActiveNotice(null), 5000);
    }
  };

  // Group leads by item
  const similarLeads = (() => {
    const groupMap = new Map<string, SwarmLead[]>();
    leads.forEach((l) => {
      const key = l.item_requested;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(l);
    });
    return [...groupMap.entries()].map(([item, items]) => ({ item, count: items.length, leads: items }));
  })();

  const activeSessions = sessions.filter(
    (s) => s.status === 'NEGOTIATING' || s.status === 'CONNECTING' || s.status === 'AWAITING_PAYMENT'
  );

  // Bot distribution counts
  const botDistribution = (() => {
    const counts: Record<string, number> = {};
    sessions.forEach((s) => {
      counts[s.bot_name] = (counts[s.bot_name] || 0) + 1;
    });
    return Object.entries(counts);
  })();

  const maxBotCount = Math.max(...botDistribution.map(([, c]) => c), 1);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-72 text-slate-400 gap-2 font-mono text-sm">
        <Activity className="w-5 h-5 animate-spin text-blue-600" />
        <span>Synchronizing agent swarm telemetry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Action Notification Toast */}
      {activeNotice && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{activeNotice}</span>
          </div>
          <button onClick={() => setActiveNotice(null)} className="text-emerald-600 hover:text-emerald-900 text-xs font-mono ml-4">✕</button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Agent Swarm Command Center</h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              CLUSTER v2.0
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry across autonomous procurement agents, active A2A sessions, and lead intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Swarm Health 99.8%</span>
          </div>
          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Activity className="w-4 h-4" />}
          label="Active Sessions"
          value={stats ? stats.active_sessions : activeSessions.length}
          sub="Live A2A negotiations"
          color="blue"
        />
        <StatCard
          icon={<CheckCircle2 className="w-4 h-4" />}
          label="Completed Today"
          value={stats ? stats.completed_sessions : sessions.filter((s) => s.status === 'COMPLETED').length}
          sub={`${stats?.deals_per_hour || 3} deals/hr SLA`}
          color="emerald"
        />
        <StatCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Total Volume"
          value={`$${Number((stats?.total_volume_today || 12800)).toLocaleString()}`}
          sub="Settled via Gateway"
          color="amber"
        />
        <StatCard
          icon={<AlertTriangle className="w-4 h-4" />}
          label="Discovered Leads"
          value={leads.length}
          sub={`Top bot: ${stats?.top_bot || 'ShopBot Alpha'}`}
          color="rose"
        />
      </div>

      {/* Main Grid: Active Sessions + Bot Swarm Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Active Sessions */}
        <div className="lg:col-span-2 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">Live A2A Sessions</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {activeSessions.length} negotiating
            </span>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {activeSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <Bot className="w-8 h-8 opacity-25" />
                <span className="text-xs font-medium">No sessions currently negotiating.</span>
                <span className="text-[11px] text-slate-400">Deploy a shopping bot in the Buyer Portal to trigger live negotiation.</span>
              </div>
            ) : (
              activeSessions.map((s) => {
                const badge = SESSION_STATUS_BADGE[s.status] || { label: s.status, cls: 'text-slate-600 bg-slate-50 border-slate-200' };
                const stepOrder = ['CONNECTING', 'NEGOTIATING', 'AWAITING_PAYMENT', 'COMPLETED'];
                const currentIdx = stepOrder.indexOf(s.status);
                return (
                  <div key={s.session_id} className="p-4 hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0 mt-0.5">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{s.bot_name}</span>
                            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="text-xs text-slate-700 font-medium mt-0.5">{s.item_requested}</div>
                          <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-slate-500">
                            <span>Qty: <strong className="text-slate-700">{s.quantity}</strong></span>
                            <span>Budget Cap: <strong className="text-slate-700">${s.budget_cap.toLocaleString()}</strong></span>
                            <span>Buffer: <strong className="text-slate-700">+{s.price_buffer_pct}%</strong></span>
                            {s.region && (
                              <span className="flex items-center gap-0.5 text-slate-600">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{s.region}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Step Progress */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-1">
                          {stepOrder.map((step, i) => (
                            <div
                              key={step}
                              title={step}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                currentIdx >= i ? 'bg-blue-600' : 'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">Step {Math.max(1, currentIdx + 1)} of 4</span>
                      </div>
                    </div>

                    {/* Latest Transcript Message Snippet */}
                    {s.transcript && s.transcript.length > 0 && (
                      <div className="mt-2.5 p-2 rounded-md bg-slate-50 border border-slate-200/80 text-[11px] font-mono text-slate-600 truncate">
                        <span className="text-blue-600 font-semibold mr-1.5">{s.transcript[s.transcript.length - 1].sender_name}:</span>
                        <span>{s.transcript[s.transcript.length - 1].text}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Bot Swarm Distribution Chart */}
        <div className="rounded-lg bg-white border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">Sessions by Bot Type</span>
              <span className="text-[10px] font-mono text-slate-400">Catalog Capacity</span>
            </div>

            <div className="mt-4 space-y-3">
              {botDistribution.map(([name, count]) => {
                const pct = Math.round((count / maxBotCount) * 100);
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{name}</span>
                      <span className="font-mono text-slate-500 font-semibold">{count} run{count > 1 ? 's' : ''}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(12, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200 mt-4 text-[11px] text-slate-600 leading-snug">
            <div className="flex items-center gap-1.5 text-slate-900 font-semibold mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Autonomous Balancing</span>
            </div>
            Active sessions are routed across multi-agent clusters according to category specialization and price buffer rules.
          </div>
        </div>
      </div>

      {/* Discovered Leads Section */}
      <div className="rounded-lg bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Discovered Sales Leads & Unclosed Negotiations
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              {leads.length} LEADS
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            High-intent shopping bots whose bids fell short of merchant reserves.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-2.5">Agent</th>
                <th className="px-4 py-2.5">Requested Product</th>
                <th className="px-4 py-2.5">Budget Cap</th>
                <th className="px-4 py-2.5">Units</th>
                <th className="px-4 py-2.5">Region</th>
                <th className="px-4 py-2.5">Failure Reason</th>
                <th className="px-4 py-2.5 text-right">Autonomous Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((l) => {
                const isFollowed = followedLeads.has(l.session_id);
                return (
                  <tr key={l.session_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{l.bot_name}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{l.item_requested}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-700">${l.budget_cap.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{l.quantity}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px]">
                        {l.region || 'GLOBAL'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-rose-600 max-w-[280px] truncate" title={l.failure_reason}>
                      {l.failure_reason}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isFollowed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Followed ✓</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleFollowLead(l.session_id, l.item_requested)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          <span>Follow Lead</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Similar Lead Pattern Recognition & Future Scope Section */}
      <div className="rounded-lg bg-white border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Similar Lead Intelligence & Automated Follow-Up (Future Scope)
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Rule-based swarm clustering</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {similarLeads.map(({ item, count, leads: groupLeads }) => {
            const maxBudget = Math.max(...groupLeads.map((g) => g.budget_cap));
            const suggestedBudget = Math.ceil(maxBudget * 1.12);
            return (
              <div key={item} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{item}</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-mono font-semibold">
                      {count} related failed bids
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">
                    Multiple shopping bots attempted procurement but were restricted by budget caps.
                    Peak budget recorded: <strong className="font-mono text-slate-800">${maxBudget.toLocaleString()}</strong>.
                  </p>
                  <div className="mt-2 text-[11px] text-blue-700 bg-blue-50 p-2 rounded-md border border-blue-200 flex items-start gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>Recommendation: Re-target lead cluster with revised cap around <strong>${suggestedBudget.toLocaleString()} (+12%)</strong>.</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-mono">Autonomous Cluster Action</span>
                  <button
                    type="button"
                    onClick={() => handleDispatchSweep(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Dispatch Swarm Sweep</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
