// ─── Product Catalog Types ────────────────────────────────────────────────

export interface RegionData {
  region_code: string;   // 'US-WEST' | 'US-EAST' | 'EU-CENTRAL' | 'APAC' | 'LATAM'
  city: string;
  lat: number;
  lng: number;
  units_sold: number;
  revenue: number;
  avg_price: number;
  demand_index: number;  // 0-100
}

export interface ProductKPI {
  total_revenue: number;
  units_sold_30d: number;
  avg_deal_value: number;
  deals_count: number;
  top_buyer_region: string;
  revenue_trend: number[];     // Last 12 data points (months)
  demand_trend: number[];      // Last 12 data points
  price_variance: number[];    // Last 12 data points
  risk_distribution: {
    low: number;     // % of deals with risk_score < 30
    medium: number;  // % 30-60
    high: number;    // % > 60
  };
}

export interface Product {
  product_id: string;
  name: string;
  category: string;
  base_price: number;
  description: string;
  regions: RegionData[];
  kpis: ProductKPI;
}
