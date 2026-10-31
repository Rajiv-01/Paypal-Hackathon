import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Building2, Zap, ShieldCheck, ArrowRight, Activity } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050b18] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(59,130,246,0.08),transparent)]" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-8">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>A2A Commerce Protocol v2.0 — LIVE</span>
        </div>

        {/* Logo & Title */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">autonopay</h1>
        </div>

        <p className="text-lg text-slate-400 mb-2 font-medium">Agent-to-Agent Commerce Gateway</p>
        <p className="text-sm text-slate-600 mb-14 max-w-xl mx-auto leading-relaxed">
          Deploy AI shopping bots that autonomously negotiate deals and execute real-world payments.
          Monitor, authorize, and settle all inbound A2A mandates from your merchant command center.
        </p>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Client Platform */}
          <button
            onClick={() => navigate('/client')}
            className="group relative p-6 rounded-2xl bg-gradient-to-br from-[#0f1629] to-[#0a0f1e] border border-blue-500/20 hover:border-blue-500/50 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/25 transition-colors">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-xs font-mono text-blue-400 mb-1">PLATFORM 1</div>
              <h2 className="text-lg font-bold text-white mb-2">Buyer / Client Portal</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                Deploy AI shopping bots to negotiate and purchase digital goods autonomously. Set budgets, configure strategy, and pay via PayPal.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 group-hover:gap-2.5 transition-all">
                <span>Enter Buyer Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>

          {/* Business Platform */}
          <button
            onClick={() => navigate('/business')}
            className="group relative p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:border-slate-300 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/3 to-blue-500/3 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-xs font-mono text-emerald-600 mb-1">PLATFORM 2</div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Business Command Center</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                Monitor all inbound A2A negotiations in real-time. Review chat transcripts, analyze product KPIs, approve mandates, and accept PayPal settlement.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 group-hover:gap-2.5 transition-all">
                <span>Enter Command Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
          {[
            { icon: <ShieldCheck className="w-3 h-3" />, label: 'Live WebSocket Telemetry' },
            { icon: <Bot className="w-3 h-3" />,         label: 'AI Negotiation Agents' },
            { icon: <Zap className="w-3 h-3" />,         label: 'PayPal Settlement' },
            { icon: <Activity className="w-3 h-3" />,    label: 'AG Grid Analytics' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/4 border border-white/8 text-slate-500 text-xs">
              {icon}
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
