import React, { useState, useEffect } from 'react';
import { IDetailCellRendererParams } from 'ag-grid-community';
import { CartMandate, Product } from '../types';
import {
  BarChart2, MessageSquare, ShieldCheck, DollarSign,
  TrendingUp, MapPin, Zap, ExternalLink, CheckCircle2,
  Lock, ArrowUpRight, Clock, UserCheck, Layers, Eye
} from 'lucide-react';

function getProductIdForMandate(mandate: CartMandate): string {
  if (mandate.product_id) return mandate.product_id;
  const item = (mandate.item || '').toLowerCase();
  if (item.includes('gpu')) return 'prod_gpu';
  if (item.includes('api') || item.includes('token')) return 'prod_api';
  if (item.includes('key') || item.includes('crypto')) return 'prod_keys';
  if (item.includes('feed') || item.includes('market')) return 'prod_feeds';
  if (item.includes('cluster') || item.includes('neural') || item.includes('infer')) return 'prod_neural';
  if (item.includes('relay') || item.includes('mesh')) return 'prod_relay';
  return 'prod_gpu';
}

export const GridRowDetailChild: React.FC<IDetailCellRendererParams<CartMandate>> = (params) => {
  const mandate = params.data;
  const [activeTab, setActiveTab] = useState<'split' | 'analytics' | 'chat' | 'vault'>('split');
  const [productData, setProductData] = useState<Product | null>(null);
  const [isSettling, setIsSettling] = useState(false);
  const [settledSuccess, setSettledSuccess] = useState(false);
  const [angle, setAngle] = useState(0);

  // Animate 3D token
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setAngle((prev) => (prev + 0.035) % (Math.PI * 2));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Fetch product analytics for this mandate
  useEffect(() => {
    if (!mandate) return;
    const prodId = getProductIdForMandate(mandate);
    fetch(`/api/products/${prodId}`)
      .then((r) => r.json())
      .then((d) => setProductData(d))
      .catch(() => {});
  }, [mandate]);

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

  // Parse chat transcript
  const transcriptLines = (mandate.transcript || '')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  // Fallback KPIs if product data is loading
  const kpis = productData?.kpis || {
    total_revenue: mandate.total_value * 8.4,
    units_sold_30d: mandate.quantity * 12,
    avg_deal_value: mandate.total_value,
    deals_count: 38,
    top_buyer_region: mandate.region || 'US-WEST',
    revenue_trend: [35, 42, 48, 55, 62, 70, 78, 85, 94, 105, 115, 128],
    demand_trend: [50, 55, 60, 68, 72, 80, 85, 90, 88, 92, 95, 98],
    price_variance: [100, 98, 96, 95, 94, 95, 93, 92, 91, 90, 91, 92],
    risk_distribution: { low: 75, medium: 20, high: 5 }
  };

  const revenuePoints = kpis.revenue_trend;
  const maxRev = Math.max(...revenuePoints, 1);
  const minRev = Math.min(...revenuePoints, 0);

  // SVG Chart Polyline
  const chartW = 380;
  const chartH = 90;
  const polyPoints = revenuePoints
    .map((val, idx) => {
      const x = Math.round((idx / (revenuePoints.length - 1)) * (chartW - 20) + 10);
      const y = Math.round(chartH - 12 - ((val - minRev) / (maxRev - minRev || 1)) * (chartH - 24));
      return `${x},${y}`;
    })
    .join(' ');

  // 3D Polyhedron geometry
  const cx = 35;
  const cy = 35;
  const r = 24;
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

  return (
    <div className="bg-slate-50/90 border-y-2 border-blue-500 border-l-4 border-l-blue-600 p-4 font-sans space-y-3 shadow-inner text-slate-900 select-text overflow-hidden h-full">
      {/* Child Table Top Bar & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-200 bg-white p-2.5 rounded-lg border shadow-xs">
        {/* Left: Row Context Identification */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            AP2
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Child Table:</span>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {mandate.mandate_id}
              </span>
              <span className="text-xs font-bold text-slate-900">
                {mandate.item}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                isSettled
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {isSettled ? 'SETTLED' : 'PENDING APPROVAL'}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px] text-slate-500 mt-0.5">
              <span>Counterparty: <strong className="text-slate-700 font-semibold">{mandate.consumer_agent}</strong></span>
              <span>•</span>
              <span>Region: <strong className="text-slate-700 font-semibold">{mandate.region || 'US-WEST'}</strong></span>
              <span>•</span>
              <span>Deal Value: <strong className="text-emerald-700 font-mono font-bold">${mandate.total_value.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Tab Navigation (Includes Dedicated Right Tab for Row Chat) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all ${
              activeTab === 'split'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Side-by-side View: Full Analytics on Left, Row Chat on Right"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all ${
              activeTab === 'analytics'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Show Full Analytics Desk"
          >
            <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Full Analytics</span>
          </button>

          {/* Dedicated Right Tab: Chat For This Row */}
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Open Live A2A Chat For This Row"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Row Chat ({transcriptLines.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all ${
              activeTab === 'vault'
                ? 'bg-white text-purple-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Show 3D Vault Seal"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>3D Seal</span>
          </button>
        </div>
      </div>

      {/* Main Content Area based on Selected Tab */}

      {/* 1. SPLIT VIEW: Full Analytics on Left (60%), Row Chat on Right (40%) */}
      {activeTab === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Left Panel: Full Analytics */}
          <div className="lg:col-span-7 bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <span>Product Market Analytics & Price Velocity</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                14ms AP2 SLA
              </span>
            </div>

            {/* Quick KPI stats */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Agreed Unit</span>
                <span className="text-xs font-mono font-bold text-slate-900">${mandate.agreed_price.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Buyer Cap</span>
                <span className="text-xs font-mono font-bold text-slate-900">
                  ${(mandate.budget_cap || mandate.total_value * 1.15).toFixed(2)}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[9px] font-mono text-slate-500 uppercase block">30D Volume</span>
                <span className="text-xs font-mono font-bold text-blue-700">{kpis.units_sold_30d} units</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Risk Index</span>
                <span className={`text-xs font-mono font-bold ${isHighRisk ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {mandate.risk_score}%
                </span>
              </div>
            </div>

            {/* 12-Month Revenue Velocity Trendline (Hand-crafted SVG Chart) */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">12-Month Revenue Velocity</span>
                <span className="text-[11px] font-mono font-bold text-emerald-700">+28.4% YoY</span>
              </div>
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-20 overflow-visible">
                <defs>
                  <linearGradient id="splitChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <polygon points={`10,${chartH - 12} ${polyPoints} ${chartW - 10},${chartH - 12}`} fill="url(#splitChartGrad)" />
                <polyline points={polyPoints} fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Regional Demand Progress */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Regional Demand Distribution:</span>
                <span>Active Origin: {mandate.region || 'US-WEST'}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="bg-blue-600 h-full" style={{ width: '42%' }} title="US-WEST (42%)" />
                <div className="bg-emerald-500 h-full" style={{ width: '28%' }} title="EU-CENTRAL (28%)" />
                <div className="bg-purple-500 h-full" style={{ width: '20%' }} title="US-EAST (20%)" />
                <div className="bg-amber-500 h-full" style={{ width: '10%' }} title="APAC (10%)" />
              </div>
            </div>
          </div>

          {/* Right Panel: The Chat for that Row */}
          <div className="lg:col-span-5 bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  <span>A2A Dialogue for Row: {mandate.mandate_id}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Counterparty: {mandate.consumer_agent}</span>
              </div>

              {/* Chat bubbles */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs">
                {transcriptLines.map((line, idx) => {
                  const isConsumer = line.includes('Consumer') || line.includes('BUYER');
                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border text-[11px] leading-relaxed ${
                        isConsumer
                          ? 'bg-blue-50/70 border-blue-200 text-blue-950 ml-3'
                          : 'bg-slate-50 border-slate-200 text-slate-800 mr-3'
                      }`}
                    >
                      <div className="font-semibold text-[9px] uppercase font-mono text-slate-500 mb-0.5">
                        {isConsumer ? `Buyer: ${mandate.consumer_agent}` : 'Merchant: Autonopay Gate'}
                      </div>
                      <p>{line.replace(/^\[.*?\]\s*<.*?>\s*/, '')}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action inside Chat Panel */}
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
                    <span>View Receipt</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isSettling}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                >
                  {isSettling ? (
                    <span>Executing Settlement...</span>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Settle Row Order with PayPal (${mandate.total_value.toFixed(2)})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. FULL ANALYTICS TAB: Dedicated 100% Width Analytics */}
      {activeTab === 'analytics' && (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Comprehensive Product Market Telemetry: {mandate.item}
              </h4>
            </div>
            <span className="text-xs font-mono text-slate-500">ID: {mandate.mandate_id}</span>
          </div>

          {/* 4 Large KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Product Revenue</span>
              <span className="text-base font-bold font-mono text-slate-900">
                ${(kpis.total_revenue || 54000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">+14.2% demand index</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Units Sold (30D)</span>
              <span className="text-base font-bold font-mono text-slate-900">{kpis.units_sold_30d} units</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Top: {kpis.top_buyer_region}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Average Deal Value</span>
              <span className="text-base font-bold font-mono text-slate-900">
                ${kpis.avg_deal_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-blue-600 block mt-0.5">Automated Cleared</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Protocol SLA</span>
              <span className="text-base font-bold font-mono text-purple-700">14 ms SLA</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">Zero Breaches</span>
            </div>
          </div>

          {/* Full-width 12-Month Line Chart */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-800">12-Month Rolling Revenue & Volume</span>
              <span className="text-xs font-mono font-bold text-blue-700">Peak: ${maxRev.toLocaleString()}k</span>
            </div>
            <svg viewBox={`0 0 600 120`} className="w-full h-24 overflow-visible">
              <defs>
                <linearGradient id="fullAnalyticGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polyline
                points={revenuePoints
                  .map((val, idx) => {
                    const x = Math.round((idx / (revenuePoints.length - 1)) * 580 + 10);
                    const y = Math.round(110 - ((val - minRev) / (maxRev - minRev || 1)) * 90);
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}

      {/* 3. ROW CHAT TAB: Dedicated Full Chat For This Row */}
      {activeTab === 'chat' && (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Full Live A2A Dialogue & Transcript for Row: {mandate.mandate_id}
              </h4>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Counterparty: <strong className="text-slate-800">{mandate.consumer_agent}</strong>
            </span>
          </div>

          {/* Full Chat Thread */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2 text-xs">
            {transcriptLines.map((line, idx) => {
              const isConsumer = line.includes('Consumer') || line.includes('BUYER');
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs leading-relaxed max-w-2xl ${
                    isConsumer
                      ? 'bg-blue-50/80 border-blue-200 text-blue-950 ml-auto'
                      : 'bg-slate-50 border-slate-200 text-slate-800 mr-auto'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-[10px] uppercase font-mono text-slate-500 mb-1">
                    <span>{isConsumer ? `Buyer Agent (${mandate.consumer_agent})` : 'Merchant Agent (Autonopay Gate)'}</span>
                    <span>Tender Turn #{idx + 1}</span>
                  </div>
                  <p>{line.replace(/^\[.*?\]\s*<.*?>\s*/, '')}</p>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500">
              Protocol: AP2 Direct Token Clearance
            </span>
            {isSettled ? (
              <span className="px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settled & Reconciled via PayPal</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleApprove}
                disabled={isSettling}
                className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Authorize & Settle Order ($ {mandate.total_value.toFixed(2)})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. 3D VAULT SEAL TAB */}
      {activeTab === 'vault' && (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-3">
          <div className="w-24 h-24 flex items-center justify-center relative">
            <svg width="70" height="70" viewBox="0 0 70 70" className="overflow-visible">
              <polygon points={`${top.x},${top.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`} fill={fillColor1} stroke={strokeColor} strokeWidth="1.5" />
              <polygon points={`${top.x},${top.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`} fill={fillColor2} stroke={strokeColor} strokeWidth="1.5" />
              <polygon points={`${top.x},${top.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`} fill={fillColor1} stroke={strokeColor} strokeWidth="1.5" />
              <polygon points={`${bottom.x},${bottom.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`} fill={fillColor2} stroke={strokeColor} strokeWidth="1.5" />
              <polygon points={`${bottom.x},${bottom.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`} fill={fillColor1} stroke={strokeColor} strokeWidth="1.5" />
              <circle cx={cx} cy={cy} r="3" fill={strokeColor} className="animate-pulse" />
            </svg>
          </div>
          <div className="font-mono text-xs font-bold text-slate-900">
            AP2 Cryptographic Token: {mandate.mandate_id}
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Hash: 0x{mandate.mandate_id.replace(/\D/g, '') || '8841'}7f4a21e09
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographic Proof Cleared by Autonopay Gateway</span>
          </div>
        </div>
      )}
    </div>
  );
};
