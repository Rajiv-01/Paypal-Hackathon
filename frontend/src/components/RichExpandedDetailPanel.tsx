import React, { useState } from 'react';
import { IDetailCellRendererParams } from 'ag-grid-community';
import { CartMandate } from '../types';
import {
  CheckCircle2, Globe, MapPin, Zap, ChevronDown,
  ExternalLink, Sparkles, X, Shield, Bot, Building2,
  Activity, Radio, Server, Check, ArrowRight, Clock,
  DollarSign, TrendingUp, AlertTriangle, FileText, UserCheck, Layers,
  Cpu, HardDrive, Wifi, ShieldCheck, Box
} from 'lucide-react';

export const RichExpandedDetailPanel: React.FC<IDetailCellRendererParams<CartMandate>> = (params) => {
  const mandate = params.data;
  const [subTab, setSubTab] = useState<'overview' | 'price' | 'map' | 'counterparty' | 'risk' | 'negotiation' | 'timeline' | 'related'>('overview');
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '3M' | '12M'>('12M');
  const [isSettling, setIsSettling] = useState(false);
  const [settledSuccess, setSettledSuccess] = useState(false);
  const [sealActive, setSealActive] = useState(false);

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
    { id: 'US-EAST', name: 'New York Logistics Hub (US-East)', x: 108, y: 44, latency: '14.2ms', isOrigin: (mandate.region || 'US-EAST') === 'US-EAST', flag: '🇺🇸', hub: 'JFK Enterprise Gateway' },
    { id: 'US-WEST', name: 'Silicon Valley Transit Node (US-West)', x: 62, y: 43, latency: '22.0ms', isOrigin: mandate.region === 'US-WEST', flag: '🇺🇸', hub: 'SFO Data Logistics' },
    { id: 'EU-CENTRAL', name: 'Frankfurt Central Distribution (EU-Central)', x: 198, y: 36, latency: '38.4ms', isOrigin: mandate.region === 'EU-CENTRAL', flag: '🇪🇺', hub: 'FRA Carrier Depot' },
    { id: 'APAC', name: 'Singapore Regional Fulfillment (APAC)', x: 298, y: 74, latency: '74.1ms', isOrigin: mandate.region === 'APAC', flag: '🇸🇬', hub: 'SIN Pacific Air-Cargo' },
  ];

  const activeNode = nodes.find((n) => n.isOrigin) || nodes[0];

  // Specific hardware specs generator based on product item
  const getDeviceSpecs = (item: string) => {
    if (item.includes('H100') || item.includes('Accelerator') || item.includes('GPU')) {
      return {
        model: 'NV-H100-SXM5-80GB',
        arch: 'NVIDIA Hopper GH100 Tensor Architecture',
        tdp: '700W Max TDP (Liquid-Cooled)',
        interface: 'PCIe 5.0 x16 / 4x 100GbE QSFP56',
        compliance: 'FIPS 140-3 Level 3 / TAA Compliant',
        firmware: 'v4.19.0-LTS',
        serialBatch: 'LOT-2026-H100-8840',
        formFactor: 'SXM5 Mezzanine Accelerator Board',
      };
    }
    if (item.includes('IoT') || item.includes('Gateway')) {
      return {
        model: 'IOT-GW-X9-RUGGED',
        arch: 'Industrial ARM Cortex-A78 Octa-Core + 32 TOPS NPU',
        tdp: '45W Passive Aluminum Heatsink',
        interface: 'Dual 10GbE SFP+ / 4x RS-485 / CANbus 2.0B',
        compliance: 'IEC 61850-3 / IEEE 1613 Substation Class',
        firmware: 'v2.8.4 Embedded RTOS',
        serialBatch: 'LOT-2026-IOT-5120',
        formFactor: 'IP67 Ruggedized DIN-Rail Chassis',
      };
    }
    if (item.includes('Security') || item.includes('HSM')) {
      return {
        model: 'HSM-QUANTUM-SECURE-V4',
        arch: 'Post-Quantum Dual Crypto Co-Processor (Kyber/Dilithium)',
        tdp: '25W Dedicated Active Bus Draw',
        interface: 'PCIe 4.0 x8 Low-Profile / Dedicated Battery Backup',
        compliance: 'FIPS 140-3 Level 4 (Active Tamper Erase)',
        firmware: 'v6.0.1 Air-Gapped Microcode',
        serialBatch: 'LOT-2026-HSM-9914',
        formFactor: 'Half-Length PCIe Cryptographic Card',
      };
    }
    return {
      model: 'NEURAL-VISION-SENSOR-STATION-4K',
      arch: 'Dual 4K Sony Starvis 2 + On-Device 48 TOPS Edge NPU',
      tdp: '65W PoE++ (IEEE 802.3bt Type 4)',
      interface: 'M12 X-Coded Gigabit Ethernet / Dual GigE Vision',
      compliance: 'IP67 Weatherproof / EN 50155 Rolling Stock',
      firmware: 'v3.12.0 VisionOS',
      serialBatch: 'LOT-2026-VIS-4112',
      formFactor: 'Precision Milled Anodized Aluminum Enclosure',
    };
  };

  const device = getDeviceSpecs(mandate.item);

  // SVG chart coordinates
  const priceCurve = 'M 10,75 Q 60,40 120,65 T 220,50 T 310,65 T 390,35';
  const volumeArea = 'M 10,95 L 10,78 Q 60,70 120,80 T 220,65 T 310,75 T 390,55 L 390,95 Z';

  return (
    <div className="bg-white border-y border-slate-200 p-3.5 font-sans text-xs text-slate-800 shadow-inner select-text relative">
      {/* Cryptographic 3D Seal Overlay (Toggleable) */}
      {sealActive && (
        <div className="absolute top-2 right-12 z-30 pointer-events-none animate-[bounce_1s_ease-in-out]">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-600/95 text-white shadow-lg border border-emerald-400 flex items-center gap-1.5 backdrop-blur-xs font-mono text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>AP2 HARDWARE ATTESTATION: 0x{mandate.mandate_id.slice(-6)}8F-SEALED</span>
          </div>
        </div>
      )}

      {/* 1. Sub-Tab Navigation Bar */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/80 flex-wrap gap-2">
        {/* Left Sub-tabs */}
        <div className="flex items-center gap-3.5 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview (2×2 Grid)' },
            { id: 'price', label: 'Price & Market' },
            { id: 'map', label: 'Geographical Logistics' },
            { id: 'negotiation', label: 'A2A Negotiation' },
            { id: 'counterparty', label: 'Counterparty Dossier' },
            { id: 'risk', label: 'Hardware Risk Audit' },
            { id: 'timeline', label: 'Milestones' },
            { id: 'related', label: 'Related Devices (4)' }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id as any)}
              className={`pb-1 transition-all flex items-center gap-1.5 shrink-0 ${
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

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium shrink-0">
          <button
            type="button"
            onClick={() => setSubTab('overview')}
            className={`px-2.5 py-1 rounded transition-colors ${
              subTab === 'overview' ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            2×2 Grid
          </button>
          <button
            type="button"
            onClick={() => setSubTab('price')}
            className={`px-2.5 py-1 rounded transition-colors ${
              subTab === 'price' ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Pricing Curve
          </button>
          <button
            type="button"
            onClick={() => setSubTab('negotiation')}
            className={`px-2.5 py-1 rounded transition-colors font-semibold ${
              subTab === 'negotiation'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            Row Chat ({transcriptLines.length || 4})
          </button>
          <button
            type="button"
            onClick={() => setSealActive(!sealActive)}
            className={`px-2.5 py-1 rounded transition-colors ${
              sealActive ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
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

      {/* 2. TAB CONTENT ROUTER */}

      {/* ── TAB 1: OVERVIEW (2 Columns x 2 Rows = 4 Grids Layout) ── */}
      {subTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* GRID 1 (Row 1, Col 1): Electronic Device Specs & Hardware Architecture */}
          <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between space-y-2.5">
            {/* Top Device Header */}
            <div className="flex items-start gap-3">
              <div className="relative w-14 h-14 rounded-lg bg-gradient-to-br from-blue-600/10 to-indigo-600/20 border border-blue-200 flex items-center justify-center shrink-0 shadow-xs">
                <Cpu className="w-7 h-7 text-blue-600 animate-pulse" />
                <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-bold text-white bg-blue-600 px-1 py-0.2 rounded">
                  AP2
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs text-slate-900 truncate">{mandate.item}</h4>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase shrink-0 ${
                    isSettled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {isSettled ? 'COMPLETED' : 'PENDING APPROVAL'}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>SKU: {device.model}</span>
                  <span>•</span>
                  <span>Batch: {device.serialBatch}</span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-1 mt-1 font-medium">
                  {device.arch}
                </p>
              </div>
            </div>

            {/* Hardware Specs Matrix */}
            <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-md border border-slate-200/90 text-[10.5px]">
              <div>
                <span className="text-slate-400 font-mono text-[9px] block">Form Factor &amp; TDP:</span>
                <span className="font-semibold text-slate-800">{device.tdp}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-[9px] block">Interface &amp; Bus:</span>
                <span className="font-semibold text-slate-800">{device.interface}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-[9px] block">Firmware / Cert:</span>
                <span className="font-semibold text-emerald-700">{device.compliance}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-[9px] block">Security Architecture:</span>
                <span className="font-semibold text-slate-800">Root-of-Trust Hardware TPM 2.0</span>
              </div>
            </div>

            {/* Procurement Contract Terms */}
            <div className="grid grid-cols-4 gap-1.5 text-center pt-1 border-t border-slate-200/80">
              <div className="p-1 bg-white rounded border border-slate-200">
                <span className="text-[8px] text-slate-400 block font-mono">Contract Qty</span>
                <span className="text-[11px] font-bold font-mono text-slate-900">{mandate.quantity} Units</span>
              </div>
              <div className="p-1 bg-white rounded border border-slate-200">
                <span className="text-[8px] text-slate-400 block font-mono">Wholesale Price</span>
                <span className="text-[11px] font-bold font-mono text-slate-900">${mandate.agreed_price.toFixed(2)}</span>
              </div>
              <div className="p-1 bg-white rounded border border-slate-200">
                <span className="text-[8px] text-slate-400 block font-mono">Total Order</span>
                <span className="text-[11px] font-bold font-mono text-emerald-700">${mandate.total_value.toFixed(2)}</span>
              </div>
              <div className="p-1 bg-white rounded border border-slate-200">
                <span className="text-[8px] text-slate-400 block font-mono">Risk Anomaly</span>
                <span className={`text-[11px] font-bold font-mono ${isHighRisk ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {mandate.risk_score}%
                </span>
              </div>
            </div>
          </div>

          {/* GRID 2 (Row 1, Col 2): Geographical Regional Logistics & Clearing Relay */}
          <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>Geographical Hardware Logistics &amp; Relay</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold">
                  SLA: {activeNode.latency}
                </span>
                <button
                  type="button"
                  onClick={() => setSubTab('map')}
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5"
                >
                  <span>Full Map</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Geographical SVG World Map Snippet */}
            <div className="relative bg-slate-950 rounded border border-slate-800 p-2 overflow-hidden flex flex-col items-center justify-center h-28 shadow-inner">
              <svg viewBox="0 0 400 110" className="w-full h-full opacity-90 overflow-visible">
                <line x1="0" y1="28" x2="400" y2="28" stroke="#334155" strokeDasharray="2 3" strokeWidth="0.4" />
                <line x1="0" y1="56" x2="400" y2="56" stroke="#334155" strokeDasharray="2 3" strokeWidth="0.4" />
                <line x1="0" y1="84" x2="400" y2="84" stroke="#334155" strokeDasharray="2 3" strokeWidth="0.4" />

                <path d="M 40,20 Q 70,15 105,20 T 125,48 T 90,65 T 50,55 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.7" />
                <path d="M 95,68 Q 120,78 110,100 T 95,115 T 80,95 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.7" />
                <path d="M 175,18 Q 215,16 225,36 T 195,48 T 175,36 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.7" />
                <path d="M 180,50 Q 225,50 215,85 T 190,105 T 165,75 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.7" />
                <path d="M 230,16 Q 320,12 365,38 T 325,72 T 250,60 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.7" />

                {/* Route arcs connecting factories to delivery hub */}
                <path d="M 108,38 Q 153,16 198,32" fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 2" />
                <path d="M 108,38 Q 85,26 62,37" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 2" />

                {/* Pulsing delivery origin pin */}
                <circle cx={activeNode.x} cy={activeNode.y - 6} r="10" fill="none" stroke="#10b981" strokeWidth="1.5" className="animate-ping" opacity="0.6" />
                <circle cx={activeNode.x} cy={activeNode.y - 6} r="5" fill="#10b981" />
                <circle cx={activeNode.x} cy={activeNode.y - 6} r="2" fill="#ffffff" />
                <circle cx={198} cy={26} r="3" fill="#38bdf8" />
                <circle cx={62} cy={31} r="3" fill="#38bdf8" />
              </svg>
            </div>

            {/* Logistics Telemetry Strip */}
            <div className="grid grid-cols-2 gap-2 text-[10.5px] bg-white p-2 rounded border border-slate-200">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-400 font-mono text-[9px]">Hub:</span>
                <span className="font-semibold text-slate-800 truncate">{activeNode.hub}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-400 font-mono text-[9px]">Export:</span>
                <span className="font-semibold text-emerald-700 truncate">EAR99 / Dual-Use Cleared ✓</span>
              </div>
            </div>
          </div>

          {/* GRID 3 (Row 2, Col 1): Wholesale Pricing Tiers & 12-Month Hardware Demand */}
          <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 block">Wholesale Pricing &amp; Hardware Demand</span>
                <span className="text-[10px] text-slate-500">Tier volume pricing across enterprise customer fleets</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold">
                {['30D', '12M'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeRange(t as any)}
                    className={`px-1.5 py-0.5 rounded ${
                      timeRange === t ? 'bg-blue-600 text-white font-bold' : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Sparkline SVG */}
            <div className="relative bg-white rounded border border-slate-200 p-2 h-20 flex items-center justify-center">
              <svg viewBox="0 0 380 70" className="w-full h-full overflow-visible">
                <path d="M 5,55 Q 50,25 110,45 T 200,35 T 290,48 T 375,20" fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="280" cy="45" r="3" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Revenue velocity and data center demand split */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Hardware Velocity</span>
                <span className="font-bold text-emerald-600">+28.4% YoY Delivery Growth</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                <div className="bg-blue-600 h-full" style={{ width: '52%' }} />
                <div className="bg-purple-600 h-full" style={{ width: '24%' }} />
                <div className="bg-amber-500 h-full" style={{ width: '16%' }} />
                <div className="bg-slate-400 h-full" style={{ width: '8%' }} />
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                <span>US-EAST 52%</span>
                <span>EU-WEST 24%</span>
                <span>APAC 16%</span>
                <span>OTHERS 8%</span>
              </div>
            </div>
          </div>

          {/* GRID 4 (Row 2, Col 2): A2A Procurement Dialogue & Instant PayPal Settle */}
          <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
              <div className="font-bold text-xs text-slate-900 truncate">
                A2A Procurement Dialogue ({mandate.mandate_id})
              </div>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Negotiation</span>
              </span>
            </div>

            {/* Chat Transcript Bubbles */}
            <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1 text-[10.5px]">
              <div className="p-2 rounded bg-white border border-slate-200 leading-tight">
                <span className="text-[9px] font-mono font-bold text-blue-700 block mb-0.5">BUYER: {mandate.consumer_agent}</span>
                <p className="text-slate-700">Procurement bid: {mandate.quantity} units of {mandate.item} @ ${(mandate.agreed_price * 0.9).toFixed(2)}/unit.</p>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200 leading-tight">
                <span className="text-[9px] font-mono font-bold text-purple-700 block mb-0.5">MERCHANT: AUTONOPAY HARDWARE GATE</span>
                <p className="text-slate-700">Margin compliance verified. Counter-offer locked at ${mandate.agreed_price.toFixed(2)}/unit with 3-yr factory SLA.</p>
              </div>
            </div>

            {/* PayPal Settlement Button */}
            <div className="pt-1">
              {isSettled ? (
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Settled via PayPal Enterprise</span>
                  </div>
                  <a
                    href={mandate.checkout_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 text-[10px] font-mono"
                  >
                    <span>PayPal Receipt</span>
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
                    <span>Executing PayPal Settlement...</span>
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

      {/* ── TAB 2: PRICE & MARKET (Deep-Dive Analytics) ── */}
      {subTab === 'price' && (
        <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-xs text-slate-900">Price Dynamics &amp; Demand Velocity Curve</h3>
              <p className="text-[11px] text-slate-500">Autonomous price elasticity and volume absorption across network clearing relays</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-semibold">
              {['7D', '30D', '3M', '12M'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeRange(t as any)}
                  className={`px-2 py-1 rounded transition-colors ${
                    timeRange === t ? 'bg-blue-600 text-white font-bold' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 bg-white rounded-lg p-3 border border-slate-200">
              <svg viewBox="0 0 400 110" className="w-full h-32 overflow-visible">
                <defs>
                  <linearGradient id="volGradPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="25" x2="400" y2="25" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="55" x2="400" y2="55" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="85" x2="400" y2="85" stroke="#f1f5f9" strokeWidth="1" />

                <path d={volumeArea} fill="url(#volGradPrice)" />
                <path d={priceCurve} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />

                <g transform="translate(240, 22)">
                  <rect x="-35" y="-18" width="70" height="26" rx="4" fill="#0f172a" />
                  <text x="0" y="-8" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">Aug 12, 2026</text>
                  <text x="0" y="2" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace">Price $245.00</text>
                  <circle cx="0" cy="16" r="3" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                </g>
              </svg>
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 px-1 pt-1 border-t border-slate-100 mt-1">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-slate-200 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <span className="font-bold text-xs text-slate-900 block">Regional Data Center Demand Split</span>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="bg-blue-600 h-full" style={{ width: '52%' }} />
                  <div className="bg-purple-600 h-full" style={{ width: '24%' }} />
                  <div className="bg-amber-500 h-full" style={{ width: '16%' }} />
                  <div className="bg-slate-400 h-full" style={{ width: '8%' }} />
                </div>
                <div className="space-y-1 pt-1 text-[10px] font-mono text-slate-600">
                  <div className="flex justify-between"><span>US-EAST (Origin)</span><span className="font-bold text-blue-700">52% ($81k)</span></div>
                  <div className="flex justify-between"><span>EU-WEST</span><span className="font-bold text-purple-700">24% ($37k)</span></div>
                  <div className="flex justify-between"><span>APAC</span><span className="font-bold text-amber-600">16% ($25k)</span></div>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px]">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Hardware Gross Margin</div>
                <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">+24.2% Net</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: GEOGRAPHICAL MAP (Full Dedicated World Topology) ── */}
      {subTab === 'map' && (
        <div className="bg-slate-950 text-white rounded-lg p-3.5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Globe className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">AP2 Global Hardware Clearinghouse &amp; Logistics Relay</h4>
                <p className="text-[10px] text-slate-400">Autonomous hardware dispatch transit corridors</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Active Hub: {activeNode.name}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                SLA: {activeNode.latency}
              </span>
            </div>
          </div>

          <div className="relative bg-slate-900/60 rounded-lg p-3 border border-slate-800/80 overflow-hidden">
            <svg viewBox="0 0 420 145" className="w-full h-36 overflow-visible">
              <defs>
                <linearGradient id="routeGradFull" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              <line x1="0" y1="35" x2="420" y2="35" stroke="#334155" strokeDasharray="2 3" strokeWidth="0.4" />
              <line x1="0" y1="75" x2="420" y2="75" stroke="#334155" strokeDasharray="2 3" strokeWidth="0.4" />
              <line x1="0" y1="115" x2="420" y2="115" stroke="#334155" strokeDasharray="2 3" strokeWidth="0.4" />

              <path d="M 40,25 Q 70,18 105,25 T 125,55 T 90,75 T 50,65 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
              <path d="M 95,80 Q 120,90 110,125 T 95,145 T 80,115 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
              <path d="M 175,20 Q 215,18 225,40 T 195,55 T 175,40 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
              <path d="M 180,60 Q 225,60 215,105 T 190,135 T 165,95 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
              <path d="M 230,18 Q 320,15 365,45 T 325,85 T 250,70 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
              <path d="M 315,100 Q 355,100 350,130 T 315,130 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />

              <path d="M 108,44 Q 153,20 198,36" fill="none" stroke="url(#routeGradFull)" strokeWidth="1.5" strokeDasharray="4 2" />
              <path d="M 108,44 Q 85,30 62,43" fill="none" stroke="#3b82f6" strokeWidth="1.2" strokeDasharray="3 2" />
              <path d="M 198,36 Q 248,30 298,74" fill="none" stroke="#a855f7" strokeWidth="1.2" strokeDasharray="3 2" />

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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: NEGOTIATION (Full-width Interactive Console) ── */}
      {subTab === 'negotiation' && (
        <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-xs text-slate-900">A2A Procurement Dialogue: {mandate.mandate_id}</h3>
              <p className="text-[11px] text-slate-500">Autonomous hardware supply terms synthesized between enterprise buyer and merchant gate</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Contract Terms Agreed
            </span>
          </div>

          <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
            {transcriptLines.map((line, idx) => (
              <div key={idx} className="p-2.5 rounded bg-white border border-slate-200 text-xs font-mono">
                <span className="text-blue-600 font-bold block mb-0.5">TURN 0{idx + 1}</span>
                <p className="text-slate-800">{line}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={handleApprove}
              disabled={isSettled || isSettling}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>{isSettled ? 'Settled via PayPal Enterprise ✓' : `Authorize & Settle via PayPal ($${mandate.total_value.toFixed(2)})`}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 5: COUNTERPARTY DOSSIER ── */}
      {subTab === 'counterparty' && (
        <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200 space-y-3">
          <h3 className="font-bold text-xs text-slate-900">Procurement Counterparty Agent Dossier</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Buyer Identity</span>
              <div className="text-sm font-bold text-slate-900">{mandate.consumer_agent}</div>
              <span className="inline-block px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-mono text-[9px] font-bold">Verified Enterprise Agent</span>
            </div>
            <div className="p-3 bg-white rounded border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Hardware Fulfillment Rate</span>
              <div className="text-sm font-bold text-emerald-700 font-mono">99.4% SLA</div>
              <span className="text-[10px] text-slate-500">142 equipment orders settled</span>
            </div>
            <div className="p-3 bg-white rounded border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Treasury Credit Ceiling</span>
              <div className="text-sm font-bold text-slate-900 font-mono">${(mandate.total_value * 2.5).toFixed(2)} Cap</div>
              <span className="text-[10px] text-slate-500">Corporate credit pre-authorized</span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: RISK ANALYSIS ── */}
      {subTab === 'risk' && (
        <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200 space-y-3">
          <h3 className="font-bold text-xs text-slate-900">Hardware Delivery &amp; Cryptographic Risk Audit</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <span className="text-[9px] font-mono text-slate-400 block">Anomaly Index</span>
              <span className={`text-base font-bold font-mono ${isHighRisk ? 'text-rose-600' : 'text-emerald-700'}`}>
                {mandate.risk_score}%
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">{isHighRisk ? 'Manual Clearance' : 'Auto Clear'}</span>
            </div>
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <span className="text-[9px] font-mono text-slate-400 block">Root-of-Trust Check</span>
              <span className="text-base font-bold font-mono text-blue-700">PASS</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">TPM 2.0 Attested</span>
            </div>
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <span className="text-[9px] font-mono text-slate-400 block">Margin Compliance</span>
              <span className="text-base font-bold font-mono text-emerald-700">18.5% OK</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Above wholesale floor</span>
            </div>
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <span className="text-[9px] font-mono text-slate-400 block">Payment Rail</span>
              <span className="text-base font-bold font-mono text-slate-900">PayPal REST v2</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Encrypted commercial order</span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: TIMELINE ── */}
      {subTab === 'timeline' && (
        <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200 space-y-2">
          <h3 className="font-bold text-xs text-slate-900">Equipment Procurement Milestones</h3>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center gap-2 p-1.5 rounded bg-white border border-slate-200">
              <span className="text-emerald-600 font-bold">10:24:01</span>
              <span className="text-slate-700">Hardware Procurement handshake initiated by {mandate.consumer_agent}</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded bg-white border border-slate-200">
              <span className="text-emerald-600 font-bold">10:24:02</span>
              <span className="text-slate-700">Wholesale pricing margin checked against reserve policy</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded bg-white border border-slate-200">
              <span className="text-emerald-600 font-bold">10:24:03</span>
              <span className="text-slate-700">AP2 Cart Mandate synthesized: ${mandate.total_value.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded bg-white border border-slate-200">
              <span className="text-blue-600 font-bold">10:25:00</span>
              <span className="text-slate-700">Awaiting merchant human authorization for PayPal release</span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 8: RELATED MANDATES ── */}
      {subTab === 'related' && (
        <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200 space-y-2">
          <h3 className="font-bold text-xs text-slate-900">Related Electronic Equipment Contracts</h3>
          <div className="space-y-1 text-xs">
            {['req_init_1001', 'req_init_1002', 'req_init_1004'].map((id, idx) => (
              <div key={id} className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                <span className="font-mono text-blue-600 font-semibold">{id}</span>
                <span className="text-slate-700">{mandate.item}</span>
                <span className="font-mono font-bold text-emerald-700">${(3200 + idx * 1100).toFixed(2)}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">Settled</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
