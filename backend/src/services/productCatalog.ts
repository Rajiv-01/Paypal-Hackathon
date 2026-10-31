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
    name: 'H100 GPU Cluster Blocks',
    category: 'Compute',
    base_price: 50,
    description: 'High-performance NVIDIA H100 GPU compute units for ML workloads.',
    regions: [
      { ...REGIONS[0], units_sold: 940,  revenue: 47000,  avg_price: 50.0, demand_index: 88 },
      { ...REGIONS[1], units_sold: 610,  revenue: 30500,  avg_price: 50.0, demand_index: 72 },
      { ...REGIONS[2], units_sold: 480,  revenue: 24000,  avg_price: 50.0, demand_index: 65 },
      { ...REGIONS[3], units_sold: 720,  revenue: 36000,  avg_price: 50.0, demand_index: 80 },
      { ...REGIONS[4], units_sold: 210,  revenue: 10500,  avg_price: 50.0, demand_index: 42 },
    ],
    kpis: {
      total_revenue:    148000,
      units_sold_30d:   2960,
      avg_deal_value:   5104,
      deals_count:      29,
      top_buyer_region: 'US-WEST',
      revenue_trend:    makeTrend(12000, 3500),
      demand_trend:     makeTrend(74, 18),
      price_variance:   makeTrend(50, 4),
      risk_distribution: { low: 72, medium: 21, high: 7 },
    },
  },
  {
    product_id: 'prod_api',
    name: 'Enterprise API Tokens (Tier-1)',
    category: 'SaaS',
    base_price: 22,
    description: 'High-throughput enterprise API access tokens with guaranteed SLA.',
    regions: [
      { ...REGIONS[0], units_sold: 1800, revenue: 39600,  avg_price: 22.0, demand_index: 91 },
      { ...REGIONS[1], units_sold: 1200, revenue: 26400,  avg_price: 22.0, demand_index: 78 },
      { ...REGIONS[2], units_sold: 900,  revenue: 19800,  avg_price: 22.0, demand_index: 69 },
      { ...REGIONS[3], units_sold: 1500, revenue: 33000,  avg_price: 22.0, demand_index: 83 },
      { ...REGIONS[4], units_sold: 400,  revenue:  8800,  avg_price: 22.0, demand_index: 50 },
    ],
    kpis: {
      total_revenue:    127600,
      units_sold_30d:   5800,
      avg_deal_value:   2200,
      deals_count:      58,
      top_buyer_region: 'US-WEST',
      revenue_trend:    makeTrend(10000, 2000),
      demand_trend:     makeTrend(80, 12),
      price_variance:   makeTrend(22, 2),
      risk_distribution: { low: 82, medium: 14, high: 4 },
    },
  },
  {
    product_id: 'prod_keys',
    name: 'Zero-Knowledge Cryptographic Keys',
    category: 'Security',
    base_price: 120,
    description: 'Air-gapped ZK cryptographic key pairs for enterprise security protocols.',
    regions: [
      { ...REGIONS[0], units_sold: 290,  revenue: 34800,  avg_price: 120.0, demand_index: 75 },
      { ...REGIONS[1], units_sold: 240,  revenue: 28800,  avg_price: 120.0, demand_index: 68 },
      { ...REGIONS[2], units_sold: 380,  revenue: 45600,  avg_price: 120.0, demand_index: 85 },
      { ...REGIONS[3], units_sold: 150,  revenue: 18000,  avg_price: 120.0, demand_index: 55 },
      { ...REGIONS[4], units_sold:  80,  revenue:  9600,  avg_price: 120.0, demand_index: 38 },
    ],
    kpis: {
      total_revenue:    136800,
      units_sold_30d:   1140,
      avg_deal_value:   3600,
      deals_count:      38,
      top_buyer_region: 'EU-CENTRAL',
      revenue_trend:    makeTrend(11000, 2500),
      demand_trend:     makeTrend(68, 14),
      price_variance:   makeTrend(120, 8),
      risk_distribution: { low: 65, medium: 26, high: 9 },
    },
  },
  {
    product_id: 'prod_feeds',
    name: 'Synthetic Financial Market Feeds',
    category: 'Data',
    base_price: 85,
    description: 'Real-time synthetic financial instrument feeds for AI trading bots.',
    regions: [
      { ...REGIONS[0], units_sold: 420,  revenue: 35700,  avg_price: 85.0, demand_index: 79 },
      { ...REGIONS[1], units_sold: 580,  revenue: 49300,  avg_price: 85.0, demand_index: 88 },
      { ...REGIONS[2], units_sold: 310,  revenue: 26350,  avg_price: 85.0, demand_index: 66 },
      { ...REGIONS[3], units_sold: 190,  revenue: 16150,  avg_price: 85.0, demand_index: 58 },
      { ...REGIONS[4], units_sold: 140,  revenue: 11900,  avg_price: 85.0, demand_index: 47 },
    ],
    kpis: {
      total_revenue:    139400,
      units_sold_30d:   1640,
      avg_deal_value:   5100,
      deals_count:      27,
      top_buyer_region: 'US-EAST',
      revenue_trend:    makeTrend(11500, 3000),
      demand_trend:     makeTrend(70, 20),
      price_variance:   makeTrend(85, 10),
      risk_distribution: { low: 52, medium: 33, high: 15 },
    },
  },
  {
    product_id: 'prod_neural',
    name: 'Neural Inference Clusters',
    category: 'AI Infra',
    base_price: 220,
    description: 'Dedicated neural inference compute clusters for real-time AI serving.',
    regions: [
      { ...REGIONS[0], units_sold: 180,  revenue: 39600,  avg_price: 220.0, demand_index: 84 },
      { ...REGIONS[1], units_sold: 120,  revenue: 26400,  avg_price: 220.0, demand_index: 71 },
      { ...REGIONS[2], units_sold:  90,  revenue: 19800,  avg_price: 220.0, demand_index: 63 },
      { ...REGIONS[3], units_sold: 200,  revenue: 44000,  avg_price: 220.0, demand_index: 89 },
      { ...REGIONS[4], units_sold:  50,  revenue: 11000,  avg_price: 220.0, demand_index: 40 },
    ],
    kpis: {
      total_revenue:    140800,
      units_sold_30d:   640,
      avg_deal_value:   4400,
      deals_count:      32,
      top_buyer_region: 'APAC',
      revenue_trend:    makeTrend(11500, 3000),
      demand_trend:     makeTrend(70, 20),
      price_variance:   makeTrend(220, 15),
      risk_distribution: { low: 68, medium: 24, high: 8 },
    },
  },
  {
    product_id: 'prod_relay',
    name: 'Zero-Trust Mesh Relays',
    category: 'Network',
    base_price: 40,
    description: 'Software-defined Zero-Trust network relay nodes for secure agent communication.',
    regions: [
      { ...REGIONS[0], units_sold: 620,  revenue: 24800,  avg_price: 40.0, demand_index: 73 },
      { ...REGIONS[1], units_sold: 440,  revenue: 17600,  avg_price: 40.0, demand_index: 65 },
      { ...REGIONS[2], units_sold: 810,  revenue: 32400,  avg_price: 40.0, demand_index: 82 },
      { ...REGIONS[3], units_sold: 530,  revenue: 21200,  avg_price: 40.0, demand_index: 76 },
      { ...REGIONS[4], units_sold: 280,  revenue: 11200,  avg_price: 40.0, demand_index: 54 },
    ],
    kpis: {
      total_revenue:    107200,
      units_sold_30d:   2680,
      avg_deal_value:   1600,
      deals_count:      67,
      top_buyer_region: 'EU-CENTRAL',
      revenue_trend:    makeTrend(8800, 1800),
      demand_trend:     makeTrend(73, 14),
      price_variance:   makeTrend(40, 3),
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
