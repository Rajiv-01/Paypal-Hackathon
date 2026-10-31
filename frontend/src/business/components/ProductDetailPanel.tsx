import React, { useEffect, useState } from 'react';
import { Product, RegionData } from '../../types';
import {
  TrendingUp, Package, DollarSign, BarChart2,
  AlertTriangle, Globe, X, MapPin, CheckCircle2, Shield
} from 'lucide-react';

interface ProductDetailPanelProps {
  productId: string;
  onClose?: () => void;
  compact?: boolean;
}

// ─── World Map SVG Projection (Mercator-like 700×360) ──────────────────────────
const MAP_W = 700;
const MAP_H = 360;

function latLngToXY(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * MAP_W;
  const y = ((90 - lat) / 180) * MAP_H;
  return { x: Math.round(x), y: Math.round(y) };
}

const DEMAND_COLOR = (d: number) => {
  if (d >= 80) return '#10b981'; // emerald
  if (d >= 60) return '#3b82f6'; // blue
  if (d >= 40) return '#f59e0b'; // amber
  return '#f43f5e';              // rose
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
const KPICard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}> = ({ icon, label, value, sub, color = 'blue' }) => {
  const colorMap: Record<string, string> = {
    blue:    'bg-blue-50 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber:   'bg-amber-50 text-amber-600 border-amber-200',
    rose:    'bg-rose-50 text-rose-600 border-rose-200',
  };
  return (
    <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{label}</span>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center border ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-lg font-bold text-slate-900 tracking-tight">{value}</div>
      {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
};

export const ProductDetailPanel: React.FC<ProductDetailPanelProps> = ({
  productId,
  onClose,
  compact = false
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRegion, setActiveRegion] = useState<RegionData | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((data: Product) => {
        setProduct(data);
        if (data.regions && data.regions.length > 0) setActiveRegion(data.regions[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-xs font-mono gap-2">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span>Loading product market intelligence...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-xs font-mono">
        Product telemetry unavailable for {productId}.
      </div>
    );
  }

  const { kpis, regions } = product;

  // Max revenue in trend for line chart scaling
  const maxRev = Math.max(...kpis.revenue_trend, 1);
  const revPoints = kpis.revenue_trend.map((v, i) => {
    const x = (i / (kpis.revenue_trend.length - 1)) * 340 + 20;
    const y = 140 - (v / maxRev) * 110;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${20},140 ${revPoints} ${360},140`;

  // Max units in regions for bar chart
  const maxUnits = Math.max(...regions.map((r) => r.units_sold), 1);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 shadow-xs overflow-hidden flex flex-col font-sans">
      {/* Panel Header */}
      <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{product.name}</span>
              <span className="px-2 py-0.2 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold border border-slate-200">
                {product.category}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Base Reserve: <strong className="font-mono text-slate-800">${product.base_price}.00/unit</strong> · SLA Grade A+ · Cross-Region Active
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard
            icon={<DollarSign className="w-4 h-4" />}
            label="30-Day Volume"
            value={`$${(kpis.total_revenue / 1000).toFixed(1)}K`}
            sub={`${kpis.deals_count} transactions cleared`}
            color="emerald"
          />
          <KPICard
            icon={<Package className="w-4 h-4" />}
            label="Units Deployed"
            value={kpis.units_sold_30d.toLocaleString()}
            sub={`Top region: ${kpis.top_buyer_region}`}
            color="blue"
          />
          <KPICard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Avg Deal Size"
            value={`$${kpis.avg_deal_value.toLocaleString()}`}
            sub="Across all A2A sessions"
            color="amber"
          />
          <KPICard
            icon={<Shield className="w-4 h-4" />}
            label="Risk Profile"
            value={`${kpis.risk_distribution.low}% Low`}
            sub={`${kpis.risk_distribution.high}% elevated risk`}
            color="rose"
          />
        </div>

        {/* 2-Column: SVG World Map + Revenue & Region Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Interactive World Map */}
          <div className="rounded-lg bg-white border border-slate-200 p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wide">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Regional Demand Map</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Click node to inspect</span>
            </div>

            <div className="relative rounded-md bg-slate-950 p-2 overflow-hidden border border-slate-800">
              {/* World Map SVG */}
              <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full h-48 select-none">
                {/* Lat/Long Reference Lines */}
                <line x1="0" y1="180" x2="700" y2="180" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="350" y1="0" x2="350" y2="360" stroke="#1e293b" strokeDasharray="3 3" />

                {/* Continental silhouettes */}
                <path d="M 120 70 Q 180 50 240 80 T 260 160 T 170 180 Z" fill="#1e293b" opacity="0.6" />
                <path d="M 180 200 Q 230 220 220 300 T 170 320 Z" fill="#1e293b" opacity="0.6" />
                <path d="M 330 60 Q 420 50 430 110 T 360 140 Z" fill="#1e293b" opacity="0.6" />
                <path d="M 340 150 Q 420 180 400 270 T 350 270 Z" fill="#1e293b" opacity="0.6" />
                <path d="M 440 60 Q 620 40 600 160 T 480 180 Z" fill="#1e293b" opacity="0.6" />
                <path d="M 520 220 Q 600 230 580 300 T 510 280 Z" fill="#1e293b" opacity="0.6" />

                {/* Regional Nodes */}
                {regions.map((r) => {
                  const { x, y } = latLngToXY(r.lat, r.lng);
                  const isSel = activeRegion?.region_code === r.region_code;
                  const color = DEMAND_COLOR(r.demand_index);
                  return (
                    <g
                      key={r.region_code}
                      onClick={() => setActiveRegion(r)}
                      className="cursor-pointer"
                    >
                      {/* Pulse */}
                      <circle cx={x} cy={y} r={isSel ? 16 : 10} fill={color} opacity="0.25" className="animate-ping" />
                      {/* Outer Ring */}
                      <circle cx={x} cy={y} r={isSel ? 9 : 7} fill="#0f172a" stroke={color} strokeWidth={isSel ? 3 : 2} />
                      {/* Core Dot */}
                      <circle cx={x} cy={y} r={isSel ? 4 : 3} fill={color} />
                      {/* Label */}
                      <text
                        x={x}
                        y={y - 12}
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {r.region_code}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Active Region Hover Banner */}
              {activeRegion && (
                <div className="absolute bottom-2 left-2 right-2 p-2 rounded-md bg-slate-900/90 border border-slate-700/80 backdrop-blur text-[11px] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-bold">{activeRegion.city}</span>
                    <span className="text-slate-400">({activeRegion.region_code})</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span>Units: <strong className="text-emerald-400">{activeRegion.units_sold}</strong></span>
                    <span>Rev: <strong className="text-blue-400">${(activeRegion.revenue / 1000).toFixed(1)}K</strong></span>
                    <span>Demand: <strong style={{ color: DEMAND_COLOR(activeRegion.demand_index) }}>{activeRegion.demand_index}%</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Revenue Trend SVG Line Chart & Regional Volume */}
          <div className="rounded-lg bg-white border border-slate-200 p-4 flex flex-col justify-between shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">12-Month Revenue Momentum</span>
                <span className="text-[10px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">+18.4% YoY</span>
              </div>

              {/* SVG Line Chart */}
              <div className="h-32 w-full pt-2">
                <svg viewBox="0 0 380 150" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id={`revGrad-${productId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="20" y1="30" x2="360" y2="30" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="20" y1="85" x2="360" y2="85" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="20" y1="140" x2="360" y2="140" stroke="#e2e8f0" />

                  {/* Gradient Area */}
                  <polygon points={areaPoints} fill={`url(#revGrad-${productId})`} />

                  {/* Trend Line */}
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={revPoints}
                  />

                  {/* Data Points */}
                  {kpis.revenue_trend.map((v, i) => {
                    const x = (i / (kpis.revenue_trend.length - 1)) * 340 + 20;
                    const y = 140 - (v / maxRev) * 110;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill="#ffffff"
                        stroke="#2563eb"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Regional Volume Bar Distribution */}
            <div>
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide block mb-2">Units Sold by Geography</span>
              <div className="space-y-1.5">
                {regions.map((r) => {
                  const pct = Math.round((r.units_sold / maxUnits) * 100);
                  return (
                    <div key={r.region_code} className="flex items-center gap-2 text-xs">
                      <span className="w-20 font-mono text-slate-600 truncate">{r.region_code}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: DEMAND_COLOR(r.demand_index) }}
                        />
                      </div>
                      <span className="w-12 text-right font-mono font-semibold text-slate-700">{r.units_sold}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Regional Demand Index Heatmap Strip */}
        <div className="rounded-lg bg-white border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">Autonomous Demand Index (Live Feed)</span>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> &gt;80% High</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> 60-80% Moderate</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> &lt;60% Soft</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {regions.map((r) => (
              <div key={r.region_code} className="p-2.5 rounded-md border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-slate-800">{r.region_code}</span>
                  <span className="text-[10px] font-bold" style={{ color: DEMAND_COLOR(r.demand_index) }}>
                    {r.demand_index}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${r.demand_index}%`, background: DEMAND_COLOR(r.demand_index) }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1.5 flex justify-between">
                  <span>{r.city}</span>
                  <span>${(r.revenue / 1000).toFixed(0)}k</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
