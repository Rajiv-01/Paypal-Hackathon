import { Product } from '../types/product.js';

// ─── Region Map ───────────────────────────────────────────────────────────────

const REGIONS = [
  { region_code: 'US-WEST',    city: 'San Francisco', lat: 37.77,  lng: -122.42 },
  { region_code: 'US-EAST',    city: 'New York',      lat: 40.71,  lng: -74.01  },
  { region_code: 'EU-CENTRAL', city: 'Frankfurt',     lat: 50.11,  lng:   8.68  },
  { region_code: 'APAC',       city: 'Singapore',     lat:  1.35,  lng: 103.82  },
  { region_code: 'LATAM',      city: 'São Paulo',     lat: -23.55, lng: -46.63  },
];

function makeTrend(base: number, variance: number): number[] {
  return Array.from({ length: 12 }, (_, i) =>
    Math.round(base + Math.sin(i * 0.8) * variance + (Math.random() * variance * 0.4))
  );
}

// ─── Product Catalog ──────────────────────────────────────────────────────────

export const PRODUCT_CATALOG: Product[] = [
  {
    product_id: 'prod_gpu',
    name: 'NVIDIA H100 Tensor Core AI Accelerator (80GB SXM5)',
    category: 'Hardware',
    base_price: 850,
    description: 'High-density enterprise server accelerator with 80GB HBM3 memory, liquid cooling, and 3.2 Tbps InfiniBand.',
    regions: [
      { ...REGIONS[0], units_sold: 940,  revenue: 799000, avg_price: 850.0, demand_index: 88 },
      { ...REGIONS[1], units_sold: 610,  revenue: 518500, avg_price: 850.0, demand_index: 72 },
      { ...REGIONS[2], units_sold: 480,  revenue: 408000, avg_price: 850.0, demand_index: 65 },
      { ...REGIONS[3], units_sold: 720,  revenue: 612000, avg_price: 850.0, demand_index: 80 },
      { ...REGIONS[4], units_sold: 210,  revenue: 178500, avg_price: 850.0, demand_index: 42 },
    ],
    kpis: {
      total_revenue:    2516000,
      units_sold_30d:   2960,
      avg_deal_value:   8500,
      deals_count:      29,
      top_buyer_region: 'US-WEST',
      revenue_trend:    makeTrend(120000, 35000),
      demand_trend:     makeTrend(74, 18),
      price_variance:   makeTrend(850, 40),
      risk_distribution: { low: 72, medium: 21, high: 7 },
    },
  },
  {
    product_id: 'prod_api',
    name: 'Industrial IoT Edge Gateway Server (Gen-5 Dual 10GbE)',
    category: 'Hardware',
    base_price: 120,
    description: 'Ruggedized DIN-rail compute gateway with NPU, dual 10GbE SFP+ ports, and wide temp range (-40°C to 85°C).',
    regions: [
      { ...REGIONS[0], units_sold: 1800, revenue: 216000, avg_price: 120.0, demand_index: 91 },
      { ...REGIONS[1], units_sold: 1200, revenue: 144000, avg_price: 120.0, demand_index: 78 },
      { ...REGIONS[2], units_sold: 900,  revenue: 108000, avg_price: 120.0, demand_index: 69 },
      { ...REGIONS[3], units_sold: 1500, revenue: 180000, avg_price: 120.0, demand_index: 83 },
      { ...REGIONS[4], units_sold: 400,  revenue:  48000, avg_price: 120.0, demand_index: 50 },
    ],
    kpis: {
      total_revenue:    696000,
      units_sold_30d:   5800,
      avg_deal_value:   6000,
      deals_count:      58,
      top_buyer_region: 'US-WEST',
      revenue_trend:    makeTrend(60000, 15000),
      demand_trend:     makeTrend(80, 12),
      price_variance:   makeTrend(120, 10),
      risk_distribution: { low: 82, medium: 14, high: 4 },
    },
  },
  {
    product_id: 'prod_keys',
    name: 'PCIe Quantum-Secure HSM Accelerator Card',
    category: 'Hardware',
    base_price: 320,
    description: 'FIPS 140-3 Level 4 hardware security module with physical tamper-detection mesh and post-quantum cryptography.',
    regions: [
      { ...REGIONS[0], units_sold: 290,  revenue: 92800,  avg_price: 320.0, demand_index: 75 },
      { ...REGIONS[1], units_sold: 240,  revenue: 76800,  avg_price: 320.0, demand_index: 68 },
      { ...REGIONS[2], units_sold: 380,  revenue: 121600, avg_price: 320.0, demand_index: 85 },
      { ...REGIONS[3], units_sold: 150,  revenue: 48000,  avg_price: 320.0, demand_index: 55 },
      { ...REGIONS[4], units_sold:  80,  revenue: 25600,  avg_price: 320.0, demand_index: 38 },
    ],
    kpis: {
      total_revenue:    364800,
      units_sold_30d:   1140,
      avg_deal_value:   9600,
      deals_count:      38,
      top_buyer_region: 'EU-CENTRAL',
      revenue_trend:    makeTrend(30000, 7000),
      demand_trend:     makeTrend(70, 15),
      price_variance:   makeTrend(320, 20),
      risk_distribution: { low: 88, medium: 10, high: 2 },
    },
  },
  {
    product_id: 'prod_feeds',
    name: 'Autonomous Neural Vision Sensor Array (Edge AI Station)',
    category: 'Hardware',
    base_price: 245,
    description: '4K stereoscopic camera array with on-board inference NPU, IP67 ruggedized enclosure, and sub-ms latency tracking.',
    regions: [
      { ...REGIONS[0], units_sold: 520,  revenue: 127400, avg_price: 245.0, demand_index: 84 },
      { ...REGIONS[1], units_sold: 710,  revenue: 173950, avg_price: 245.0, demand_index: 89 },
      { ...REGIONS[2], units_sold: 430,  revenue: 105350, avg_price: 245.0, demand_index: 71 },
      { ...REGIONS[3], units_sold: 620,  revenue: 151900, avg_price: 245.0, demand_index: 81 },
      { ...REGIONS[4], units_sold: 190,  revenue:  46550, avg_price: 245.0, demand_index: 45 },
    ],
    kpis: {
      total_revenue:    605150,
      units_sold_30d:   2470,
      avg_deal_value:   6125,
      deals_count:      42,
      top_buyer_region: 'US-EAST',
      revenue_trend:    makeTrend(50000, 12000),
      demand_trend:     makeTrend(82, 14),
      price_variance:   makeTrend(245, 15),
      risk_distribution: { low: 68, medium: 24, high: 8 },
    },
  },
  {
    product_id: 'prod_neural',
    name: 'High-Density Neural Processing Blade (8x NPU)',
    category: 'Hardware',
    base_price: 520,
    description: 'Hot-swappable 1U blade accelerator housing 8x edge neural processing units for ultra-low latency vision inference.',
    regions: [
      { ...REGIONS[0], units_sold: 180,  revenue: 93600,  avg_price: 520.0, demand_index: 84 },
      { ...REGIONS[1], units_sold: 120,  revenue: 62400,  avg_price: 520.0, demand_index: 71 },
      { ...REGIONS[2], units_sold:  90,  revenue: 46800,  avg_price: 520.0, demand_index: 63 },
      { ...REGIONS[3], units_sold: 200,  revenue: 104000, avg_price: 520.0, demand_index: 89 },
      { ...REGIONS[4], units_sold:  50,  revenue: 26000,  avg_price: 520.0, demand_index: 40 },
    ],
    kpis: {
      total_revenue:    332800,
      units_sold_30d:   640,
      avg_deal_value:   10400,
      deals_count:      32,
      top_buyer_region: 'APAC',
      revenue_trend:    makeTrend(25000, 5000),
      demand_trend:     makeTrend(70, 20),
      price_variance:   makeTrend(520, 25),
      risk_distribution: { low: 68, medium: 24, high: 8 },
    },
  },
  {
    product_id: 'prod_relay',
    name: 'Enterprise Zero-Trust Optical Switch (32x 100GbE)',
    category: 'Hardware',
    base_price: 340,
    description: 'Hardware-encrypted top-of-rack optical routing switch with line-rate MACsec encryption.',
    regions: [
      { ...REGIONS[0], units_sold: 620,  revenue: 210800, avg_price: 340.0, demand_index: 73 },
      { ...REGIONS[1], units_sold: 440,  revenue: 149600, avg_price: 340.0, demand_index: 65 },
      { ...REGIONS[2], units_sold: 810,  revenue: 275400, avg_price: 340.0, demand_index: 82 },
      { ...REGIONS[3], units_sold: 530,  revenue: 180200, avg_price: 340.0, demand_index: 76 },
      { ...REGIONS[4], units_sold: 280,  revenue:  95200, avg_price: 340.0, demand_index: 54 },
    ],
    kpis: {
      total_revenue:    911200,
      units_sold_30d:   2680,
      avg_deal_value:   13600,
      deals_count:      67,
      top_buyer_region: 'EU-CENTRAL',
      revenue_trend:    makeTrend(75000, 15000),
      demand_trend:     makeTrend(73, 14),
      price_variance:   makeTrend(340, 18),
      risk_distribution: { low: 78, medium: 18, high: 4 },
    },
  },
];

// ─── Bot Catalog ──────────────────────────────────────────────────────────────

export const BOT_CATALOG = [
  {
    bot_id: 'bot_alpha',
    name: 'ShopBot Alpha',
    specialty: 'Tech & Hardware',
    description: 'Balanced negotiator for compute and hardware deals. Reliable and SLA-aware.',
    strategy: 'BALANCED' as const,
    avatar_icon: 'Bot',
    color: 'blue',
    success_rate: 89,
    deals_closed: 1247,
    avg_savings_pct: 8,
  },
  {
    bot_id: 'bot_negoti',
    name: 'NegotiBot-X',
    specialty: 'Enterprise APIs',
    description: 'Aggressive negotiator. Pushes to the floor price and accepts counter only when necessary.',
    strategy: 'AGGRESSIVE' as const,
    avatar_icon: 'Zap',
    color: 'amber',
    success_rate: 76,
    deals_closed: 892,
    avg_savings_pct: 14,
  },
  {
    bot_id: 'bot_budget',
    name: 'BudgetBot',
    specialty: 'SaaS & Tokens',
    description: 'Conservative buyer. Only accepts deals within 5% of initial bid. High success rate on soft targets.',
    strategy: 'CONSERVATIVE' as const,
    avatar_icon: 'PiggyBank',
    color: 'emerald',
    success_rate: 94,
    deals_closed: 2104,
    avg_savings_pct: 4,
  },
  {
    bot_id: 'bot_risk',
    name: 'RiskArb',
    specialty: 'High-Volume Bulk',
    description: 'Aggressive bulk buyer. Accepts elevated risk scores to secure volume deals.',
    strategy: 'AGGRESSIVE' as const,
    avatar_icon: 'TrendingUp',
    color: 'rose',
    success_rate: 68,
    deals_closed: 543,
    avg_savings_pct: 18,
  },
  {
    bot_id: 'bot_stealth',
    name: 'StealthBuyer',
    specialty: 'Cryptographic Assets',
    description: 'Balanced and privacy-first. Targets security and cryptographic products with care.',
    strategy: 'BALANCED' as const,
    avatar_icon: 'Shield',
    color: 'purple',
    success_rate: 91,
    deals_closed: 678,
    avg_savings_pct: 9,
  },
  {
    bot_id: 'bot_swift',
    name: 'SwiftBot',
    specialty: 'AI Credits & Compute',
    description: 'Conservative and fast. Closes deals quickly without long negotiation cycles.',
    strategy: 'CONSERVATIVE' as const,
    avatar_icon: 'Flame',
    color: 'cyan',
    success_rate: 87,
    deals_closed: 1589,
    avg_savings_pct: 5,
  },
];

// ─── Lookup Helpers ───────────────────────────────────────────────────────────

export function getProductById(product_id: string): Product | undefined {
  return PRODUCT_CATALOG.find((p) => p.product_id === product_id);
}

/** Pick a product that best matches the item name string */
export function matchProductByItem(item: string): Product {
  const lower = item.toLowerCase();
  if (lower.includes('gpu') || lower.includes('cluster') || lower.includes('compute'))
    return PRODUCT_CATALOG[0];
  if (lower.includes('api') || lower.includes('token'))
    return PRODUCT_CATALOG[1];
  if (lower.includes('key') || lower.includes('crypto') || lower.includes('zk'))
    return PRODUCT_CATALOG[2];
  if (lower.includes('feed') || lower.includes('market') || lower.includes('synthetic'))
    return PRODUCT_CATALOG[3];
  if (lower.includes('neural') || lower.includes('inference'))
    return PRODUCT_CATALOG[4];
  if (lower.includes('relay') || lower.includes('mesh') || lower.includes('network'))
    return PRODUCT_CATALOG[5];
  // Default
  return PRODUCT_CATALOG[0];
}

/** Get a random region for simulation */
export function getRandomRegion(): { region_code: string; city: string; lat: number; lng: number } {
  return REGIONS[Math.floor(Math.random() * REGIONS.length)];
}
