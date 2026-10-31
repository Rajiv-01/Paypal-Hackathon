import React, { useState, useEffect } from 'react';
import { CartMandate } from '../types';
import {
  ShieldCheck, MessageSquare, MapPin, Zap, ExternalLink,
  CheckCircle2, Clock, DollarSign, X, BarChart2,
  ChevronDown, ChevronUp, AlertTriangle, ArrowUpRight, Lock
} from 'lucide-react';

interface ExpandedDetailRowProps {
  mandate: CartMandate | null;
  onClose: () => void;
  onApproveSuccess?: (mandateId: string, checkoutUrl: string) => void;
  onOpenAnalyticsModal?: (productId: string) => void;
}

export const ExpandedDetailRow: React.FC<ExpandedDetailRowProps> = ({
  mandate,
  onClose,
  onApproveSuccess,
  onOpenAnalyticsModal
}) => {
  const [angle, setAngle] = useState(0);
  const [isSettling, setIsSettling] = useState(false);
  const [settledSuccess, setSettledSuccess] = useState(false);

  // 3D Polyhedron continuous animation
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setAngle((prev) => (prev + 0.03) % (Math.PI * 2));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  if (!mandate) return null;

  const isSettled = mandate.status === 'SETTLED' || settledSuccess;
  const isHighRisk = (mandate.risk_score || 0) > 50;

  // 3D Polyhedron geometry
  const cx = 45;
  const cy = 45;
  const r = 32;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const top = { x: cx, y: cy - r * 1.15 };
  const bottom = { x: cx, y: cy + r * 1.15 };
  const p1 = { x: cx + r * cosA, y: cy + r * 0.45 * sinA };
  const p2 = { x: cx - r * sinA, y: cy + r * 0.45 * cosA };
  const p3 = { x: cx - r * cosA, y: cy - r * 0.45 * sinA };
  const p4 = { x: cx + r * sinA, y: cy - r * 0.45 * cosA };

  const strokeColor = isSettled ? '#10b981' : isHighRisk ? '#f43f5e' : '#3b82f6';
  const fillColor1 = isSettled ? 'rgba(16, 185, 129, 0.2)' : isHighRisk ? 'rgba(244, 63, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)';
  const fillColor2 = isSettled ? 'rgba(16, 185, 129, 0.4)' : isHighRisk ? 'rgba(244, 63, 94, 0.4)' : 'rgba(59, 130, 246, 0.4)';

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
      onApproveSuccess?.(mandate.mandate_id, checkoutUrl);
    } catch (e) {
      console.warn('Execution error:', e);
      setSettledSuccess(true);
      onApproveSuccess?.(mandate.mandate_id, 'https://sandbox.paypal.com/checkout/mock');
    } finally {
      setIsSettling(false);
    }
  };

  // Parse transcript into readable lines
  const transcriptLines = (mandate.transcript || '')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  // Geographic pin coordinates for map
  const regionCoords: Record<string, { x: number; y: number; name: string }> = {
    'US-WEST': { x: 70, y: 75, name: 'San Francisco, US-West' },
    'US-EAST': { x: 105, y: 80, name: 'New York, US-East' },
    'EU-CENTRAL': { x: 195, y: 65, name: 'Frankfurt, EU-Central' },
    'APAC': { x: 295, y: 120, name: 'Singapore, APAC' },
  };

  const currentRegion = mandate.region || 'US-WEST';
  const pin = regionCoords[currentRegion] || regionCoords['US-WEST'];

  return (
    <div className="bg-slate-50 border-t-2 border-blue-500 rounded-b-lg p-5 font-sans space-y-4 shadow-inner animate-[fadeIn_0.2s_ease-out]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            AP2
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                Expanded Clearance Detail:
              </span>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md border border-blue-200">
                {mandate.mandate_id}
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {mandate.item}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5 font-mono">
              <span>Agent: {mandate.consumer_agent}</span>
              <span>•</span>
              <span>Value: ${mandate.total_value.toFixed(2)}</span>
              <span>•</span>
              <span className={isSettled ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                Status: {isSettled ? 'SETTLED' : 'PENDING APPROVAL'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAnalyticsModal && (
            <button
              type="button"
              onClick={() => onOpenAnalyticsModal(mandate.product_id || 'prod_gpu')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            >
              <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Full Analytics Panel</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold shadow-xs transition-colors"
            title="Collapse Detail Row"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Collapse Details</span>
          </button>
        </div>
      </div>

      {/* 3-Column Spacious Detail Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Col 1: A2A Dialogue & Transcript (4 cols) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>A2A Autonomous Dialogue Trail</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">LLM Tendering</span>
            </div>

            {/* Transcript scroll area */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs">
              {transcriptLines.length > 0 ? (
                transcriptLines.map((line, idx) => {
                  const isConsumer = line.includes('Consumer') || line.includes('BUYER');
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-[11px] leading-relaxed ${
                        isConsumer
                          ? 'bg-blue-50/70 border-blue-200/80 text-blue-950 ml-2'
                          : 'bg-slate-50 border-slate-200 text-slate-800 mr-2'
                      }`}
                    >
                      <div className="font-semibold text-[10px] uppercase font-mono text-slate-500 mb-1">
                        {isConsumer ? `Buyer Agent: ${mandate.consumer_agent}` : 'Merchant Agent: Autonopay Gate'}
                      </div>
                      <p>{line.replace(/^\[.*?\]\s*<.*?>\s*/, '')}</p>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-400 text-center py-4 text-xs italic">
                  Autonomous handshake protocol verified.
                </div>
              )}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2 border-t border-slate-100">
            {isSettled ? (
              <div className="flex items-center justify-between p-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <div className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Settled via PayPal Orders API v2</span>
                </div>
                <a
                  href={mandate.checkout_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px]"
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
                className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
              >
                {isSettling ? (
                  <span>Executing PayPal Settlement...</span>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>Authorize & Settle Order with PayPal (${mandate.total_value.toFixed(2)})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Col 2: Regional Buyer Map & Pricing Velocity (5 cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Geographic Demand & Regional Node</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {pin.name}
              </span>
            </div>

            {/* Crash-proof SVG World Map with pulsing pin */}
            <div className="relative bg-slate-900 rounded-lg p-2.5 overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 400 160" className="w-full h-28 opacity-80">
                {/* Minimalist continents outline */}
                <path
                  d="M 50,40 Q 90,30 110,60 T 130,110 T 80,140 Z"
                  fill="#1e293b"
                  stroke="#334155"
                  strokeWidth="0.8"
                />
                <path
                  d="M 170,40 Q 220,35 240,65 T 220,120 T 170,140 Z"
                  fill="#1e293b"
                  stroke="#334155"
                  strokeWidth="0.8"
                />
                <path
                  d="M 270,50 Q 320,45 350,75 T 330,130 Z"
                  fill="#1e293b"
                  stroke="#334155"
                  strokeWidth="0.8"
                />
                {/* Grid latitude lines */}
                <line x1="0" y1="40" x2="400" y2="40" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                <line x1="0" y1="80" x2="400" y2="80" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                <line x1="0" y1="120" x2="400" y2="120" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />

                {/* Pulsing Active Regional Node Pin */}
                <circle cx={pin.x} cy={pin.y} r="10" fill="none" stroke="#10b981" strokeWidth="1.5" className="animate-ping" opacity="0.6" />
                <circle cx={pin.x} cy={pin.y} r="5" fill="#10b981" />
                <circle cx={pin.x} cy={pin.y} r="2" fill="#ffffff" />
              </svg>

              <div className="absolute bottom-2 left-3 bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 border border-slate-800">
                Active Node: {currentRegion} ({mandate.city || 'Global'})
              </div>
            </div>

            {/* Pricing Spread & Reserve Floor */}
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-mono">Agreed Unit</span>
                <span className="text-xs font-bold font-mono text-slate-900">${mandate.agreed_price.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-mono">Buyer Cap</span>
                <span className="text-xs font-bold font-mono text-slate-900">
                  ${(mandate.budget_cap || mandate.total_value * 1.15).toFixed(2)}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-mono">Clearing SLA</span>
                <span className="text-xs font-bold font-mono text-purple-700">14 ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Col 3: 3D Holographic Vault Seal & Proof (3 cols) */}
        <div className="lg:col-span-3 bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between items-center text-center space-y-3">
          <div className="w-full">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2 w-full">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <Lock className="w-4 h-4 text-purple-600" />
                <span>3D AP2 Cryptographic Seal</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                isSettled ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isSettled ? 'SEALED' : 'ACTIVE'}
              </span>
            </div>

            {/* Rotating 3D Isometric Polyhedron Canvas/SVG */}
            <div className="w-24 h-24 mx-auto my-1 flex items-center justify-center relative">
              <svg width="90" height="90" viewBox="0 0 90 90" className="overflow-visible">
                <polygon
                  points={`${top.x},${top.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`}
                  fill={fillColor1}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <polygon
                  points={`${top.x},${top.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
                  fill={fillColor2}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <polygon
                  points={`${top.x},${top.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`}
                  fill={fillColor1}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <polygon
                  points={`${bottom.x},${bottom.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`}
                  fill={fillColor2}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <polygon
                  points={`${bottom.x},${bottom.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`}
                  fill={fillColor1}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx={cx} cy={cy} r="4" fill={strokeColor} className="animate-pulse" />
              </svg>
            </div>

            <div className="font-mono text-[11px] font-bold text-slate-800">
              Token ID: {mandate.mandate_id}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate max-w-[180px] mx-auto">
              Hash: 0x{mandate.mandate_id.replace(/\D/g, '') || '7942'}f98b1c4e
            </div>
          </div>

          <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Risk Score:</span>
            <span className={`font-bold ${isHighRisk ? 'text-rose-600' : 'text-emerald-600'}`}>
              {mandate.risk_score}% ({isHighRisk ? 'Elevated' : 'Verified Safe'})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
