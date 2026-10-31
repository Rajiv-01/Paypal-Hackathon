// ─── Shared Frontend Types (v2) ───────────────────────────────────────────────

// ── CartMandate ───────────────────────────────────────────────────────────────

export interface CartMandate {
  mandate_id: string;
  consumer_agent: string;
  item: string;
  agreed_price: number;
  quantity: number;
  total_value: number;
  risk_score: number;
  transcript: string;
  status: 'NEGOTIATING' | 'PENDING_APPROVAL' | 'PAYMENT_PENDING' | 'AWAITING_PAYMENT' | 'SETTLED' | 'REJECTED';
  created_at: string;
  checkout_url?: string;
  // v2
  session_id?: string;
  buyer_id?: string;
  product_id?: string;
  region?: string;
  city?: string;
  lat?: number;
  lng?: number;
  budget_cap?: number;
  price_buffer_pct?: number;
  paypal_order_id?: string;
}

export interface SimulateRequest {
  item?: string;
  requested_price?: number;
  quantity?: number;
  consumer_agent?: string;
}

// ── Session Types ─────────────────────────────────────────────────────────────

export type SessionStatus =
  | 'CONNECTING'
  | 'NEGOTIATING'
  | 'AWAITING_PAYMENT'
  | 'COMPLETED'
  | 'FAILED'
  | 'REJECTED';

export interface ChatMessage {
  id: string;
  sender: 'BUYER_BOT' | 'MERCHANT_AGENT' | 'SYSTEM';
  sender_name: string;
  text: string;
  timestamp: string;
}

export interface A2ASession {
  session_id: string;
  buyer_id: string;
  bot_id: string;
  bot_name: string;
  status: SessionStatus;
  item_requested: string;
  budget_cap: number;
  price_buffer_pct: number;
  quantity: number;
  transcript: ChatMessage[];
  mandate_id?: string;
  started_at: string;
  updated_at: string;
  failure_reason?: string;
  region?: string;
  city?: string;
  lat?: number;
  lng?: number;
}

// ── Bot Profiles ──────────────────────────────────────────────────────────────

export type BotStrategy = 'AGGRESSIVE' | 'BALANCED' | 'CONSERVATIVE';

export interface BotProfile {
  bot_id: string;
  name: string;
  specialty: string;
  description: string;
  strategy: BotStrategy;
  avatar_icon: string;
  color: string;
  success_rate: number;
  deals_closed: number;
  avg_savings_pct: number;
}

// ── Products ──────────────────────────────────────────────────────────────────

export interface RegionData {
  region_code: string;
  city: string;
  lat: number;
  lng: number;
  units_sold: number;
  revenue: number;
  avg_price: number;
  demand_index: number;
}

export interface ProductKPI {
  total_revenue: number;
  units_sold_30d: number;
  avg_deal_value: number;
  deals_count: number;
  top_buyer_region: string;
  revenue_trend: number[];
  demand_trend: number[];
  price_variance: number[];
  risk_distribution: { low: number; medium: number; high: number };
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

// ── Swarm Types ───────────────────────────────────────────────────────────────

export interface SwarmStats {
  active_sessions: number;
  total_sessions_today: number;
  completed_sessions: number;
  failed_sessions: number;
  deals_per_hour: number;
  total_volume_today: number;
  top_bot: string;
  timestamp: string;
}

export interface SwarmLead {
  session_id: string;
  bot_name: string;
  item_requested: string;
  budget_cap: number;
  quantity: number;
  failure_reason: string;
  started_at: string;
  region?: string;
  similar_count: number;
}

// ── Invoices ──────────────────────────────────────────────────────────────────

export interface InvoiceRecord {
  invoice_id: string;
  mandate_id: string;
  date: string;
  due_date: string;
  buyer_agent: string;
  target_item: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  protocol_fee: number;
  total: number;
  status: 'PAID' | 'PENDING';
  payment_method: string;
  paypal_order_id: string;
  proof_hash: string;
  checkout_url: string;
}

// ── WebSocket Protocol v2 ─────────────────────────────────────────────────────

export type WebSocketMessage =
  | { type: 'CONNECTED';           message: string; timestamp: string }
  | { type: 'INITIAL_STATE';       payload: CartMandate[] }
  | { type: 'NEW_MANDATE';         payload: CartMandate }
  | { type: 'MANDATE_UPDATED';     payload: { mandate_id: string; status: string; checkout_url?: string } }
  | { type: 'SESSION_STARTED';     payload: A2ASession }
  | { type: 'SESSION_UPDATE';      payload: { session_id: string; status: SessionStatus; mandate_id?: string; updated_at: string } }
  | { type: 'NEGOTIATION_MESSAGE'; payload: { session_id: string; message: ChatMessage; buyer_id: string } }
  | { type: 'SWARM_STATS_UPDATE';  payload: SwarmStats };
