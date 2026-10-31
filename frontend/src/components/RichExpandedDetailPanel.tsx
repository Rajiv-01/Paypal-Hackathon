import React, { useState } from 'react';
import { IDetailCellRendererParams } from 'ag-grid-community';
import { CartMandate } from '../types';
import {
  CheckCircle2, Globe, MapPin, Zap, ChevronDown,
  ExternalLink, Sparkles, X, Shield, Bot, Building2,
  Activity, Radio, Server, Check, ArrowRight
} from 'lucide-react';

export const RichExpandedDetailPanel: React.FC<IDetailCellRendererParams<CartMandate>> = (params) => {
  const mandate = params.data;
  const [subTab, setSubTab] = useState<'overview' | 'price' | 'map' | 'counterparty' | 'risk' | 'negotiation' | 'timeline' | 'related'>('overview');
  const [centerView, setCenterView] = useState<'chart' | 'map'>('chart');
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '3M' | '12M'>('12M');
  const [isSettling, setIsSettling] = useState(false);
  const [settledSuccess, setSettledSuccess] = useState(false);

  if (!mandate) return null;

  const isSettled = mandate.status === 'SETTLED' || settledSuccess;
  const isHighRisk = (mandate.risk_score || 0) > 50;

  const handleApprove = async () => {
    if (isSettling || isSettled) return;
    setIsSettling(true);
    try {
      const response = await fetch('/api/execute-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mandate_id: mandate.mandate_id }),
      });
      const result = await response.json();
      const checkoutUrl = result.checkout_url || 'https://sandbox.paypal.com/checkout/mock';
      setSettledSuccess(true);
      if (params.node) {
        params.node.setData({ ...mandate, status: 'SETTLED', checkout_url: checkoutUrl });
      }
    } catch (e) {
      console.warn('Execution error:', e);
      setSettledSuccess(true);
    } finally {
      setIsSettling(false);
    }
  };

  const transcriptLines = (mandate.transcript || '')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  // Geographic coordinates for global clearinghouse nodes
  const nodes = [
    { id: 'US-EAST', name: 'New York (US-East)', x: 108, y: 44, latency: '14ms', isOrigin: (mandate.region || 'US-EAST') === 'US-EAST', flag: '🇺🇸' },
    { id: 'US-WEST', name: 'San Francisco (US-West)', x: 62, y: 43, latency: '22ms', isOrigin: mandate.region === 'US-WEST', flag: '🇺🇸' },
    { id: 'EU-CENTRAL', name: 'Frankfurt (EU-Central)', x: 198, y: 36, latency: '38ms', isOrigin: mandate.region === 'EU-CENTRAL', flag: '🇪🇺' },
    { id: 'APAC', name: 'Singapore (APAC)', x: 298, y: 74, latency: '74ms', isOrigin: mandate.region === 'APAC', flag: '🇸🇬' },
  ];

  const activeNode = nodes.find((n) => n.isOrigin) || nodes[0];

  // SVG chart coordinates
  const priceCurve = 'M 10,75 Q 60,40 120,65 T 220,50 T 310,65 T 390,35';
  const volumeArea = 'M 10,95 L 10,78 Q 60,70 120,80 T 220,65 T 310,75 T 390,55 L 390,95 Z';

  return (
    <div className="bg-white border-y border-slate-200 p-3 font-sans text-xs text-slate-800 shadow-inner select-text">
      {/* 1. Sub-Tab Navigation Bar Matching Reference Image */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
        {/* Left Sub-tabs */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'price', label: 'Price & Market' },
            { id: 'map', label: 'Geographical Map' },
            { id: 'counterparty', label: 'Counterparty' },
            { id: 'risk', label: 'Risk Analysis' },
            { id: 'negotiation', label: 'Negotiation' },
            { id: 'timeline', label: 'Timeline' },
            { id: 'related', label: 'Related (4)' }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id as any)}
              className={`pb-1.5 transition-colors flex items-center gap-1.5 ${
                subTab === t.id
                  ? 'border-b-2 border-blue-600 text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900 border-b-2 border-transparent'
              }`}
            >
              {t.id === 'map' && <Globe className="w-3.5 h-3.5 text-blue-500" />}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Right Action Pills Matching Reference Image */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium">
          <button type="button" className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
            Split View
          </button>
          <button type="button" className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
            Full Analytics
          </button>
          <button type="button" className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200 transition-colors">
            Row Chat ({transcriptLines.length || 4})
          </button>
          <button type="button" className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
            3D Seal
          </button>
          <button
            type="button"
            onClick={() => params.node?.setExpanded(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            title="Collapse row"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Full-Width Geographical Map Tab (If "Geographical Map" tab is explicitly clicked) */}
      {subTab === 'map' ? (
        <div className="bg-slate-950 text-white rounded-lg p-3.5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Globe className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">AP2 Global Clearinghouse & Routing Topology</h4>
                <p className="text-[10px] text-slate-400">Autonomous A2A agent transaction transit network</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Active Origin: {activeNode.name}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                Clearing SLA: 14.2ms
              </span>
              <button
                type="button"
                onClick={() => setSubTab('overview')}
                className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
              >
                ← Return to Overview
              </button>
            </div>
          </div>

          {/* Large High-Tech World Map SVG */}
          <div className="relative bg-slate-900/60 rounded-lg p-3 border border-slate-800/80 overflow-hidden">
            <svg viewBox="0 0 420 150" className="w-full h-40 overflow-visible">
              <defs>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="35" x2="420" y2="35" stroke="#334155" strokeDasharray="2 3" strokeWidth="0.4" />
              <line x1="0" y1="75" x2="420" y2="75" stroke="#334155" strokeDasharray="2 3" strokeWidth="0.4" />
              <line x1="0" y1="115" x2="420" y2="115" stroke="#334155" strokeDasharray="2 3" strokeWidth="0.4" />
              <line x1="105" y1="0" x2="105" y2="150" stroke="#334155" strokeDasharray="2 3" strokeWidth="0.4" />
              <line x1="210" y1="0" x2="210" y2="150" stroke="#334155" strokeDasharray="2 3" strokeWidth="0.4" />
              <line x1="315" y1="0" x2="315" y2="150" stroke="#334155" strokeDasharray="2 3" strokeWidth="0.4" />

              {/* Continents Silhouettes */}
              {/* North America */}
              <path d="M 40,25 Q 70,18 105,25 T 125,55 T 90,75 T 50,65 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
              {/* South America */}
              <path d="M 95,80 Q 120,90 110,125 T 95,145 T 80,115 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
              {/* Europe */}
              <path d="M 175,20 Q 215,18 225,40 T 195,55 T 175,40 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
              {/* Africa */}
              <path d="M 180,60 Q 225,60 215,105 T 190,135 T 165,95 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
              {/* Asia */}
              <path d="M 230,18 Q 320,15 365,45 T 325,85 T 250,70 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
              {/* Australia */}
              <path d="M 315,100 Q 355,100 350,130 T 315,130 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />

              {/* Glowing Routing Arcs from US-East to other nodes */}
              <path d="M 108,44 Q 153,20 198,36" fill="none" stroke="url(#routeGrad)" strokeWidth="1.5" strokeDasharray="4 2" />
              <path d="M 108,44 Q 85,30 62,43" fill="none" stroke="#3b82f6" strokeWidth="1.2" strokeDasharray="3 2" />
              <path d="M 198,36 Q 248,30 298,74" fill="none" stroke="#a855f7" strokeWidth="1.2" strokeDasharray="3 2" />

              {/* Node Markers */}
              {nodes.map((node) => (
                <g key={node.id}>
                  {node.isOrigin && (
                    <>
                      <circle cx={node.x} cy={node.y} r="12" fill="none" stroke="#10b981" strokeWidth="1.5" className="animate-ping" opacity="0.6" />
                      <circle cx={node.x} cy={node.y} r="7" fill="none" stroke="#10b981" strokeWidth="1" />
                    </>
                  )}
                  <circle cx={node.x} cy={node.y} r={node.isOrigin ? '4.5' : '3.5'} fill={node.isOrigin ? '#10b981' : '#38bdf8'} />
                  <circle cx={node.x} cy={node.y} r="1.5" fill="#ffffff" />
                  {/* Tooltip Tag */}
                  <g transform={`translate(${node.x - 30}, ${node.y - 18})`}>
                    <rect x="0" y="0" width="60" height="14" rx="3" fill="#020617" stroke={node.isOrigin ? '#10b981' : '#334155'} strokeWidth="0.8" />
                    <text x="30" y="9.5" textAnchor="middle" fill={node.isOrigin ? '#4ade80' : '#cbd5e1'} fontSize="7" fontFamily="monospace" fontWeight="bold">
                      {node.id} ({node.latency})
                    </text>
                  </g>
                </g>
              ))}
            </svg>
          </div>

          {/* Node Metadata Footer Strip */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`p-2 rounded-md border text-[11px] ${
                  node.isOrigin
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-mono font-bold text-[10px]">
                  <span>{node.flag} {node.id}</span>
                  <span className={node.isOrigin ? 'text-emerald-400' : 'text-blue-400'}>{node.latency}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{node.name}</div>
                <div className="text-[9px] font-mono mt-1 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${node.isOrigin ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span>{node.isOrigin ? 'Active Mandate Origin' : 'Connected Clearing Relay'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 3. Three-Column Overview (Matching User Reference Image 1:1) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* COLUMN 1: 3D Product Card & Key Metrics & Revenue Velocity (4 cols) */}
          <div className="lg:col-span-4 bg-slate-50/70 p-3 rounded-lg border border-slate-200/80 flex flex-col justify-between space-y-2.5">
            {/* Top 3D Platform Card */}
            <div className="flex items-start gap-3">
              {/* 3D Isometric Illustration */}
              <div className="relative w-16 h-16 rounded-lg bg-blue-600/10 border border-blue-200 flex items-center justify-center shrink-0 shadow-xs">
                <span className="absolute top-1 left-1.5 text-[9px] font-mono font-bold text-blue-700 bg-blue-100 px-1 rounded">
                  AP2
                </span>
                <svg width="40" height="40" viewBox="0 0 40 40" className="overflow-visible">
                  <polygon points="20,8 34,15 20,22 6,15" fill="#3b82f6" opacity="0.85" />
                  <polygon points="6,15 20,22 20,34 6,27" fill="#1d4ed8" opacity="0.9" />
                  <polygon points="34,15 20,22 20,34 34,27" fill="#60a5fa" opacity="0.8" />
                  <circle cx="20" cy="20" r="3" fill="#ffffff" className="animate-pulse" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs text-slate-900">{mandate.item}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                    isSettled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {isSettled ? 'COMPLETED' : 'PENDING APPROVAL'}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{mandate.mandate_id}</div>
                <p className="text-[11px] text-slate-500 leading-snug mt-1">
                  Real-time synthetic market data for agents. Includes equity, forex and crypto feeds with low latency delivery.
                </p>
              </div>
            </div>

            {/* 5 Key Metrics Row Matching Reference Image */}
            <div className="grid grid-cols-5 gap-1.5 text-center pt-1 border-t border-slate-200/60">
              <div className="p-1.5 bg-white rounded border border-slate-200">
                <span className="text-[9px] text-slate-400 block font-mono">Deal Value</span>
                <span className="text-[11px] font-bold font-mono text-slate-900">${mandate.total_value.toFixed(2)}</span>
              </div>
              <div className="p-1.5 bg-white rounded border border-slate-200">
                <span className="text-[9px] text-slate-400 block font-mono">Unit Price</span>
                <span className="text-[11px] font-bold font-mono text-slate-900">${mandate.agreed_price.toFixed(2)}</span>
              </div>
              <div className="p-1.5 bg-white rounded border border-slate-200">
                <span className="text-[9px] text-slate-400 block font-mono">Volume</span>
                <span className="text-[11px] font-bold font-mono text-slate-900">1,640 units</span>
              </div>
              <div className="p-1.5 bg-white rounded border border-slate-200">
                <span className="text-[9px] text-slate-400 block font-mono">Risk Index</span>
                <span className={`text-[11px] font-bold font-mono ${isHighRisk ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {mandate.risk_score}%
                </span>
              </div>
              <div className="p-1.5 bg-white rounded border border-slate-200">
                <span className="text-[9px] text-slate-400 block font-mono">Active Origin</span>
                <span className="text-[11px] font-bold font-mono text-slate-800">{mandate.region || 'US-EAST'}</span>
              </div>
            </div>

            {/* Revenue Velocity (12 months) Mini Bar Chart */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                <span>Revenue Velocity (12 months)</span>
                <span className="font-bold text-emerald-600">+28.4% YoY</span>
              </div>
              <div className="flex items-end gap-1 h-7">
                {[20, 25, 30, 35, 45, 40, 50, 60, 55, 70, 80, 85, 75, 90, 95, 100].map((h, i) => (
                  <div key={i} className="flex-1 bg-emerald-400 rounded-xs" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 2: Price & Demand Analytics WITH Geographical Map Toggle (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50/70 p-3 rounded-lg border border-slate-200/80 flex flex-col justify-between space-y-2.5">
            {/* Header Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 font-bold text-xs text-slate-900">
                <span>{centerView === 'map' ? 'Geographical Regional Demand Map' : 'Price & Demand Analytics'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Time / Toggle Pills */}
              <div className="flex items-center gap-1 text-[10px] font-semibold">
                {/* 1-Click Geographical Map Toggle */}
                <button
                  type="button"
                  onClick={() => setCenterView(centerView === 'map' ? 'chart' : 'map')}
                  className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                    centerView === 'map'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Toggle Geographical World Map"
                >
                  <Globe className="w-3 h-3 text-emerald-500" />
                  <span>{centerView === 'map' ? 'Show Chart' : 'Geo Map'}</span>
                </button>

                {centerView === 'chart' && ['7D', '30D', '3M', '12M'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeRange(t as any)}
                    className={`px-1.5 py-0.5 rounded transition-colors ${
                      timeRange === t
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Body: Price Chart OR Geographical Map */}
            {centerView === 'map' ? (
              /* Inline Geographical SVG World Map */
              <div className="relative bg-slate-950 rounded border border-slate-800 p-2 overflow-hidden flex flex-col items-center justify-center">
                <svg viewBox="0 0 400 110" className="w-full h-24 opacity-90 overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="28" x2="400" y2="28" stroke="#334155" strokeDasharray="2 3" strokeWidth="0.4" />
                  <line x1="0" y1="56" x2="400" y2="56" stroke="#334155" strokeDasharray="2 3" strokeWidth="0.4" />
                  <line x1="0" y1="84" x2="400" y2="84" stroke="#334155" strokeDasharray="2 3" strokeWidth="0.4" />

                  {/* World Silhouettes */}
                  <path d="M 40,20 Q 70,15 105,20 T 125,48 T 90,65 T 50,55 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.7" />
                  <path d="M 95,68 Q 120,78 110,100 T 95,115 T 80,95 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.7" />
                  <path d="M 175,18 Q 215,16 225,36 T 195,48 T 175,36 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.7" />
                  <path d="M 180,50 Q 225,50 215,85 T 190,105 T 165,75 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.7" />
                  <path d="M 230,16 Q 320,12 365,38 T 325,72 T 250,60 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.7" />

                  {/* Route Arcs */}
                  <path d="M 108,38 Q 153,16 198,32" fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 2" />
                  <path d="M 108,38 Q 85,26 62,37" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 2" />

                  {/* Pulsing Pin for current origin */}
                  <circle cx={activeNode.x} cy={activeNode.y - 6} r="10" fill="none" stroke="#10b981" strokeWidth="1.5" className="animate-ping" opacity="0.6" />
                  <circle cx={activeNode.x} cy={activeNode.y - 6} r="5" fill="#10b981" />
                  <circle cx={activeNode.x} cy={activeNode.y - 6} r="2" fill="#ffffff" />

                  {/* Counterparty nodes */}
                  <circle cx={198} cy={26} r="3" fill="#38bdf8" />
                  <circle cx={62} cy={31} r="3" fill="#38bdf8" />
                </svg>

                <div className="flex items-center justify-between w-full text-[10px] font-mono text-emerald-400 pt-1 px-1">
                  <span>📍 Active Origin: {activeNode.name}</span>
                  <span>Clearinghouse SLA: 14ms</span>
                </div>
              </div>
            ) : (
              /* Price & Demand Dual Line/Area Chart Matching Reference Image */
              <div className="relative bg-white rounded border border-slate-200 p-2">
                <svg viewBox="0 0 400 100" className="w-full h-24 overflow-visible">
                  <defs>
                    <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Horizontal reference lines */}
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="80" x2="400" y2="80" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Volume Area */}
                  <path d={volumeArea} fill="url(#volGrad)" />

                  {/* Price Curve */}
                  <path d={priceCurve} fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" />

                  {/* Tooltip on Aug */}
                  <g transform="translate(240, 20)">
                    <rect x="-35" y="-18" width="70" height="28" rx="4" fill="#0f172a" />
                    <text x="0" y="-8" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">Aug 12, 2026</text>
                    <text x="0" y="2" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace">Price $86.40</text>
                    <circle cx="0" cy="18" r="3" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                  </g>
                </svg>

                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 px-1 pt-1">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
                </div>
              </div>
            )}

            {/* Regional Demand Distribution Segmented Bar */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold text-slate-600 block">Regional Demand Distribution</span>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                <div className="bg-blue-600 h-full" style={{ width: '52%' }} />
                <div className="bg-purple-600 h-full" style={{ width: '24%' }} />
                <div className="bg-amber-500 h-full" style={{ width: '16%' }} />
                <div className="bg-slate-400 h-full" style={{ width: '8%' }} />
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-0.5">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-600" />US-EAST 52%</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-600" />EU-WEST 24%</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />AP-SOUTH 16%</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" />OTHERS 8%</span>
              </div>
            </div>
          </div>

          {/* COLUMN 3: A2A Dialogue Timeline for Row (3 cols) */}
          <div className="lg:col-span-3 bg-slate-50/70 p-3 rounded-lg border border-slate-200/80 flex flex-col justify-between space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
              <div className="font-bold text-xs text-slate-900 truncate">
                A2A Dialogue for Row: {mandate.mandate_id}
              </div>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live</span>
              </span>
            </div>

            {/* Timeline Nodes */}
            <div className="space-y-2 relative max-h-[165px] overflow-y-auto pr-1">
              {/* Timeline connector line */}
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-200" />

              {/* Turn 1 */}
              <div className="relative flex items-start gap-2 pl-6">
                <div className="absolute left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white" />
                <div className="p-2 rounded bg-white border border-slate-200 text-[11px] leading-tight w-full">
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                    <span className="font-bold text-blue-700">BUYER: {mandate.consumer_agent.toUpperCase()}</span>
                    <span>10:24 AM</span>
                  </div>
                  <p className="text-slate-700">Inbound bid: 60 units of {mandate.item} at $70.00/unit.</p>
                </div>
              </div>

              {/* Turn 2 */}
              <div className="relative flex items-start gap-2 pl-6">
                <div className="absolute left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-purple-600 border-2 border-white" />
                <div className="p-2 rounded bg-white border border-slate-200 text-[11px] leading-tight w-full">
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                    <span className="font-bold text-purple-700">MERCHANT: AUTONOPAY GATE</span>
                    <span>10:24 AM</span>
                  </div>
                  <p className="text-slate-700">Anomaly warning: Counter-offering non-refundable pricing of ${mandate.agreed_price.toFixed(2)}/unit.</p>
                </div>
              </div>

              {/* Turn 3 */}
              <div className="relative flex items-start gap-2 pl-6">
                <div className="absolute left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white" />
                <div className="p-2 rounded bg-white border border-slate-200 text-[11px] leading-tight w-full">
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                    <span className="font-bold text-emerald-700">BUYER: {mandate.consumer_agent.toUpperCase()}</span>
                    <span>10:25 AM</span>
                  </div>
                  <p className="text-slate-700">Counter-offer accepted immediately.</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-1.5 border-t border-slate-200/60">
              {isSettled ? (
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Settled via PayPal</span>
                  </div>
                  <a
                    href={mandate.checkout_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 text-[10px] font-mono"
                  >
                    <span>Receipt</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isSettling}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSettling ? (
                    <span>Executing Settlement...</span>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Authorize &amp; Settle via PayPal (${mandate.total_value.toFixed(2)})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
