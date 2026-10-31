// ─── A2A Session Types ─────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  sender: 'BUYER_BOT' | 'MERCHANT_AGENT' | 'SYSTEM';
  sender_name: string;
  text: string;
  timestamp: string;
}

export type SessionStatus =
  | 'CONNECTING'
  | 'NEGOTIATING'
  | 'AWAITING_PAYMENT'
  | 'COMPLETED'
  | 'FAILED'
  | 'REJECTED';

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
  mandate_id?: string;     // Populated once negotiation completes
  started_at: string;
  updated_at: string;
  failure_reason?: string; // Why session failed (for leads table)
  region?: string;
  city?: string;
  lat?: number;
  lng?: number;
}

// ─── Bot Profile Types ────────────────────────────────────────────────────

export type BotStrategy = 'AGGRESSIVE' | 'BALANCED' | 'CONSERVATIVE';

export interface BotProfile {
  bot_id: string;
  name: string;
  specialty: string;
  description: string;
  strategy: BotStrategy;
  avatar_icon: string;     // lucide-react icon name
  color: string;           // e.g. 'blue', 'purple', 'emerald'
  success_rate: number;    // 0-100
  deals_closed: number;
  avg_savings_pct: number;
}

// ─── Swarm Stats Types ────────────────────────────────────────────────────

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
  similar_count: number; // How many other sessions failed for same item
}
