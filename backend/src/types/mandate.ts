import type { A2ASession, ChatMessage, SwarmStats } from './session.js';

// ─── CartMandate ─────────────────────────────────────────────────────────────

export interface CartMandate {
  // --- Core AP2 Fields ---
  mandate_id: string;
  consumer_agent: string;
  item: string;
  agreed_price: number;
  quantity: number;
  total_value: number;
  risk_score: number;
  transcript: string;
  status: 'NEGOTIATING' | 'PENDING_APPROVAL' | 'PAYMENT_PENDING' | 'SETTLED' | 'REJECTED';
  created_at: string;
  checkout_url?: string;

  // --- v2 Fields ---
  session_id?: string;        // Ties mandate to a live A2ASession
  buyer_id?: string;          // Unique ID of the client/buyer (from Platform 1)
  product_id?: string;        // Links to ProductCatalog for analytics panel
  region?: string;            // e.g. 'US-WEST', 'EU-CENTRAL', 'APAC'
  city?: string;              // e.g. 'San Francisco', 'Berlin', 'Tokyo'
  lat?: number;
  lng?: number;
  budget_cap?: number;        // Max the buyer agent can spend
  price_buffer_pct?: number;  // % buffer above requested_price bot can accept
  paypal_order_id?: string;
  paypal_payer_id?: string;
}

// ─── Simulate Request (from old /api/simulate-agent) ─────────────────────────

export interface SimulateRequest {
  item?: string;
  requested_price?: number;
  quantity?: number;
  consumer_agent?: string;
}

// ─── Session Start Request (from /api/session/start) ─────────────────────────

export interface SessionStartRequest {
  buyer_id: string;
  bot_id: string;
  command: string;           // Free-text from the buyer
  item: string;              // Parsed or explicit item name
  budget_cap: number;
  price_buffer_pct: number;
  quantity: number;
  requested_price?: number;
  region?: string;
  city?: string;
}

// ─── WebSocket Protocol v2 ────────────────────────────────────────────────────

export type WebSocketMessage =
  | { type: 'CONNECTED';           message: string; timestamp: string }
  | { type: 'INITIAL_STATE';       payload: CartMandate[] }
  | { type: 'NEW_MANDATE';         payload: CartMandate }
  | { type: 'MANDATE_UPDATED';     payload: { mandate_id: string; status: string; checkout_url?: string } }
  | { type: 'SESSION_STARTED';     payload: A2ASession }
  | { type: 'SESSION_UPDATE';      payload: { session_id: string; status: A2ASession['status']; mandate_id?: string; updated_at: string } }
  | { type: 'NEGOTIATION_MESSAGE'; payload: { session_id: string; message: ChatMessage; buyer_id: string } }
  | { type: 'SWARM_STATS_UPDATE';  payload: SwarmStats };
