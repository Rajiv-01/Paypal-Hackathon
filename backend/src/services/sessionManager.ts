/**
 * sessionManager.ts
 * Manages live A2A negotiation sessions end-to-end.
 * Orchestrates buyer bot ↔ merchant agent dialogue,
 * broadcasts via WebSocket, and generates CartMandates on completion.
 */

import { v4 as uuidv4 } from 'uuid';
import { A2ASession, ChatMessage, SessionStatus, SwarmStats } from '../types/session.js';
import { CartMandate, SessionStartRequest } from '../types/mandate.js';
import { generateOpeningBid, evaluateMerchantCounter } from './buyerAgent.js';
import { negotiateTransaction } from './merchantAgent.js';
import { matchProductByItem, getRandomRegion, BOT_CATALOG } from './productCatalog.js';
import {
  broadcastSessionStarted,
  broadcastSessionUpdate,
  broadcastNegotiationMessage,
  broadcastMandate,
} from './websocketServer.js';

// ─── In-Memory Stores ─────────────────────────────────────────────────────────

const sessions = new Map<string, A2ASession>();
let completedSessionCount = 2;

// Seed realistic initial sessions so Swarm Dashboard has live data immediately
const seedSessions: A2ASession[] = [
  {
    session_id:       'sess_live_101',
    buyer_id:         'buyer_corp_88',
    bot_id:           'bot_alpha',
    bot_name:         'ShopBot Alpha',
    status:           'NEGOTIATING',
    item_requested:   'H100 GPU Cluster Blocks',
    budget_cap:       6000,
    price_buffer_pct: 15,
    quantity:         100,
    transcript: [
      { id: 'm1', sender: 'BUYER_BOT', sender_name: 'ShopBot Alpha', text: 'Inbound tender: Seeking 100 H100 GPU units at bid $46.00/unit.', timestamp: new Date(Date.now() - 45000).toISOString() },
      { id: 'm2', sender: 'MERCHANT_AGENT', sender_name: 'Autonopay Gate', text: 'Minimum floor price enforced at $50.00/unit with 99.99% SLA.', timestamp: new Date(Date.now() - 30000).toISOString() },
      { id: 'm3', sender: 'BUYER_BOT', sender_name: 'ShopBot Alpha', text: 'Evaluating buffer tolerance (+15%). Counter accepted at $50.00/unit.', timestamp: new Date(Date.now() - 15000).toISOString() }
    ],
    started_at:       new Date(Date.now() - 50000).toISOString(),
    updated_at:       new Date(Date.now() - 15000).toISOString(),
    region:           'US-WEST',
    city:             'San Francisco',
    lat:              37.77,
    lng:              -122.42
  },
  {
    session_id:       'sess_live_102',
    buyer_id:         'buyer_dev_12',
    bot_id:           'bot_negoti',
    bot_name:         'NegotiBot-X',
    status:           'AWAITING_PAYMENT',
    item_requested:   'Enterprise API Tokens (Tier-1)',
    budget_cap:       5500,
    price_buffer_pct: 20,
    quantity:         250,
    mandate_id:       'req_init_1002',
    transcript: [
      { id: 'm4', sender: 'BUYER_BOT', sender_name: 'NegotiBot-X', text: 'Transmitting aggressive bid for 250 API tokens at $19.00/token.', timestamp: new Date(Date.now() - 120000).toISOString() },
      { id: 'm5', sender: 'MERCHANT_AGENT', sender_name: 'Autonopay Gate', text: 'Countering at $22.00/token based on dynamic network capacity.', timestamp: new Date(Date.now() - 90000).toISOString() },
      { id: 'm6', sender: 'BUYER_BOT', sender_name: 'NegotiBot-X', text: 'Agreement reached at $22.00/token. AP2 mandate synthesized.', timestamp: new Date(Date.now() - 60000).toISOString() }
    ],
    started_at:       new Date(Date.now() - 130000).toISOString(),
    updated_at:       new Date(Date.now() - 60000).toISOString(),
    region:           'EU-CENTRAL',
    city:             'Frankfurt',
    lat:              50.11,
    lng:              8.68
  },
  {
    session_id:       'sess_failed_201',
    buyer_id:         'buyer_ hedge_44',
    bot_id:           'bot_budget',
    bot_name:         'BudgetBot',
    status:           'FAILED',
    item_requested:   'Quantum Cryptographic Keys',
    budget_cap:       3200,
    price_buffer_pct: 5,
    quantity:         40,
    failure_reason:   'Merchant counter-offer ($120/key) exceeded strict 5% budget ceiling',
    transcript: [
      { id: 'm7', sender: 'BUYER_BOT', sender_name: 'BudgetBot', text: 'Conservative bid: 40 Cryptographic Keys at $80.00/key.', timestamp: new Date(Date.now() - 300000).toISOString() },
      { id: 'm8', sender: 'MERCHANT_AGENT', sender_name: 'Autonopay Gate', text: 'Base price is $120.00/key. Counter transmitted.', timestamp: new Date(Date.now() - 270000).toISOString() },
      { id: 'm9', sender: 'BUYER_BOT', sender_name: 'BudgetBot', text: 'Counter exceeds budget cap. Deal rejected by policy.', timestamp: new Date(Date.now() - 250000).toISOString() }
    ],
    started_at:       new Date(Date.now() - 320000).toISOString(),
    updated_at:       new Date(Date.now() - 250000).toISOString(),
    region:           'US-EAST',
    city:             'New York',
    lat:              40.71,
    lng:              -74.01
  },
  {
    session_id:       'sess_failed_202',
    buyer_id:         'buyer_infra_09',
    bot_id:           'bot_risk',
    bot_name:         'RiskArb',
    status:           'REJECTED',
    item_requested:   'Quantum Cryptographic Keys',
    budget_cap:       3600,
    price_buffer_pct: 10,
    quantity:         30,
    failure_reason:   'Floor price of $120.00/key not met within authorized variance',
    transcript: [
      { id: 'm10', sender: 'BUYER_BOT', sender_name: 'RiskArb', text: 'Bulk tender: 30 Keys at $95.00/key.', timestamp: new Date(Date.now() - 400000).toISOString() },
      { id: 'm11', sender: 'MERCHANT_AGENT', sender_name: 'Autonopay Gate', text: 'Non-negotiable floor is $120.00/key.', timestamp: new Date(Date.now() - 380000).toISOString() }
    ],
    started_at:       new Date(Date.now() - 420000).toISOString(),
    updated_at:       new Date(Date.now() - 370000).toISOString(),
    region:           'EU-CENTRAL',
    city:             'Frankfurt',
    lat:              50.11,
    lng:              8.68
  },
  {
    session_id:       'sess_failed_203',
    buyer_id:         'buyer_ai_77',
    bot_id:           'bot_swift',
    bot_name:         'SwiftBot',
    status:           'FAILED',
    item_requested:   'Neural Inference Clusters',
    budget_cap:       3500,
    price_buffer_pct: 8,
    quantity:         20,
    failure_reason:   'Unit bid ($150) below merchant minimum reserve ($220)',
    transcript: [
      { id: 'm12', sender: 'BUYER_BOT', sender_name: 'SwiftBot', text: 'Quick quote for 20 Neural Clusters at $150.00.', timestamp: new Date(Date.now() - 500000).toISOString() }
    ],
    started_at:       new Date(Date.now() - 520000).toISOString(),
    updated_at:       new Date(Date.now() - 490000).toISOString(),
    region:           'APAC',
    city:             'Singapore',
    lat:              1.35,
    lng:              103.82
  }
];

seedSessions.forEach((s) => sessions.set(s.session_id, s));

// ─── Session Start ────────────────────────────────────────────────────────────

export async function startSession(
  req: SessionStartRequest,
  mandatesStore: Map<string, CartMandate>
): Promise<A2ASession> {
  const session_id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const bot = BOT_CATALOG.find((b) => b.bot_id === req.bot_id) || BOT_CATALOG[0];
  const regionInfo = getRandomRegion();

  const session: A2ASession = {
    session_id,
    buyer_id:         req.buyer_id,
    bot_id:           req.bot_id,
    bot_name:         bot.name,
    status:           'CONNECTING',
    item_requested:   req.item,
    budget_cap:       req.budget_cap,
    price_buffer_pct: req.price_buffer_pct,
    quantity:         req.quantity,
    transcript:       [],
    started_at:       new Date().toISOString(),
    updated_at:       new Date().toISOString(),
    region:           req.region || regionInfo.region_code,
    city:             req.city   || regionInfo.city,
    lat:              regionInfo.lat,
    lng:              regionInfo.lng,
  };

  sessions.set(session_id, session);

  // Broadcast session started to all clients
  broadcastSessionStarted(session);

  // Run the negotiation loop asynchronously (non-blocking)
  runNegotiationLoop(session, req, mandatesStore).catch((err) => {
    console.error(`[sessionManager] Negotiation loop failed for ${session_id}:`, err);
    updateSessionStatus(session_id, 'FAILED', 'Internal negotiation error.');
  });

  return session;
}

// ─── Negotiation Loop ─────────────────────────────────────────────────────────

async function runNegotiationLoop(
  session: A2ASession,
  req: SessionStartRequest,
  mandatesStore: Map<string, CartMandate>
): Promise<void> {
  const { session_id, buyer_id, bot_id } = session;
  const bot = BOT_CATALOG.find((b) => b.bot_id === bot_id) || BOT_CATALOG[0];
  const product = matchProductByItem(req.item);
  const requestedPrice = req.requested_price || product.base_price;

  await delay(600); // Simulate connection handshake

  updateSessionStatus(session_id, 'NEGOTIATING');

  // ── System Message ─────────────────────────────────────────────────────────
  emitMessage(session_id, buyer_id, {
    sender: 'SYSTEM',
    sender_name: 'System',
    text: `A2A session established. ${bot.name} (${bot.strategy}) is negotiating for ${req.quantity}× "${req.item}". Budget cap: $${req.budget_cap.toFixed(2)}.`,
  });

  await delay(400);

  // ── Opening Bid from Buyer Bot ─────────────────────────────────────────────
  const opening = generateOpeningBid({
    bot_name:        bot.name,
    item:            req.item,
    requested_price: requestedPrice,
    quantity:        req.quantity,
    strategy:        bot.strategy,
  });

  emitMessage(session_id, buyer_id, {
    sender:      'BUYER_BOT',
    sender_name: bot.name,
    text:        opening.message,
  });

  await delay(900 + Math.random() * 600);

  // ── Merchant Agent Counter ─────────────────────────────────────────────────
  const merchantResult = await negotiateTransaction({
    item:            req.item,
    requested_price: opening.offer_price,
    quantity:        req.quantity,
    consumer_agent:  bot.name,
  });

  emitMessage(session_id, buyer_id, {
    sender:      'MERCHANT_AGENT',
    sender_name: 'Autonopay Merchant Agent',
    text:        extractMerchantMessage(merchantResult.transcript),
  });

  await delay(700 + Math.random() * 500);

  // ── Buyer Evaluates Counter ────────────────────────────────────────────────
  const evaluation = evaluateMerchantCounter({
    bot_name:         bot.name,
    item:             req.item,
    strategy:         bot.strategy,
    original_ask:     requestedPrice,
    counter_price:    merchantResult.agreed_price,
    budget_cap:       req.budget_cap,
    price_buffer_pct: req.price_buffer_pct,
    quantity:         req.quantity,
    round:            0,
  });

  emitMessage(session_id, buyer_id, {
    sender:      'BUYER_BOT',
    sender_name: bot.name,
    text:        evaluation.message,
  });

  await delay(400);

  if (!evaluation.accepted || evaluation.final === false) {
    // ── Round 2: Final merchant confirmation ───────────────────────────────
    await delay(700);

    emitMessage(session_id, buyer_id, {
      sender:      'MERCHANT_AGENT',
      sender_name: 'Autonopay Merchant Agent',
      text:        `Confirmed. Locking in at $${merchantResult.agreed_price.toFixed(2)}/unit for ${req.quantity} units. Total: $${merchantResult.total_value.toFixed(2)}. Generating AP2 Cart Mandate...`,
    });

    await delay(500);
  }

  // ── Session Result ─────────────────────────────────────────────────────────
  if (evaluation.final && !evaluation.accepted) {
    // Deal fell through
    const currentSession = sessions.get(session_id)!;
    currentSession.failure_reason = evaluation.message;
    sessions.set(session_id, currentSession);
    updateSessionStatus(session_id, 'FAILED', evaluation.message);
    emitMessage(session_id, buyer_id, {
      sender:      'SYSTEM',
      sender_name: 'System',
      text:        `Session ended: No deal reached. Reason: ${evaluation.message}`,
    });
    return;
  }

  // ── Generate Mandate ───────────────────────────────────────────────────────
  const regionInfo = getRandomRegion();
  const mandate: CartMandate = {
    ...merchantResult,
    session_id,
    buyer_id,
    product_id:       product.product_id,
    region:           session.region || regionInfo.region_code,
    city:             session.city   || regionInfo.city,
    lat:              session.lat    || regionInfo.lat,
    lng:              session.lng    || regionInfo.lng,
    budget_cap:       req.budget_cap,
    price_buffer_pct: req.price_buffer_pct,
    status:           'AWAITING_PAYMENT' as any,
  };

  mandatesStore.set(mandate.mandate_id, mandate);
  broadcastMandate(mandate);

  // Update session with mandate reference
  updateSessionStatus(session_id, 'AWAITING_PAYMENT', mandate.mandate_id);

  emitMessage(session_id, buyer_id, {
    sender:      'SYSTEM',
    sender_name: 'System',
    text:        `AP2 Mandate created (${mandate.mandate_id}). Total: $${mandate.total_value.toFixed(2)}. Awaiting buyer payment authorization.`,
  });

  completedSessionCount++;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emitMessage(
  session_id: string,
  buyer_id: string,
  partial: Omit<ChatMessage, 'id' | 'timestamp'>
): void {
  const message: ChatMessage = {
    id:        uuidv4(),
    timestamp: new Date().toISOString(),
    ...partial,
  };

  const session = sessions.get(session_id);
  if (session) {
    session.transcript.push(message);
    session.updated_at = message.timestamp;
    sessions.set(session_id, session);
  }

  broadcastNegotiationMessage(session_id, buyer_id, message);
}

function updateSessionStatus(
  session_id: string,
  status: SessionStatus,
  mandate_id?: string
): void {
  const session = sessions.get(session_id);
  if (!session) return;

  session.status     = status;
  session.updated_at = new Date().toISOString();
  if (mandate_id && status === 'AWAITING_PAYMENT') {
    session.mandate_id = mandate_id;
  }
  sessions.set(session_id, session);

  broadcastSessionUpdate(session_id, status, mandate_id);
}

function extractMerchantMessage(transcript: string): string {
  const lines = transcript.split('\n').filter((l) => l.trim());
  // Find the last merchant line
  const merchantLines = lines.filter((l) =>
    l.toLowerCase().includes('merchant') || l.toLowerCase().includes('autonopay')
  );
  if (merchantLines.length > 0) {
    const last = merchantLines[merchantLines.length - 1];
    return last.replace(/^\[.*?\]\s*<.*?>\s*/, '').trim();
  }
  return transcript.split('\n').pop()?.replace(/^\[.*?\]\s*<.*?>\s*/, '').trim() || transcript;
}

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

// ─── Public Getters ───────────────────────────────────────────────────────────

export function getAllSessions(): A2ASession[] {
  return Array.from(sessions.values()).sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );
}

export function getSessionsByBuyer(buyer_id: string): A2ASession[] {
  return getAllSessions().filter((s) => s.buyer_id === buyer_id);
}

export function getFailedSessions(): A2ASession[] {
  return getAllSessions().filter((s) => s.status === 'FAILED' || s.status === 'REJECTED');
}

export function getSwarmStats(): SwarmStats {
  const all = getAllSessions();
  const active    = all.filter((s) => s.status === 'NEGOTIATING' || s.status === 'CONNECTING').length;
  const completed = all.filter((s) => s.status === 'COMPLETED' || s.status === 'AWAITING_PAYMENT').length;
  const failed    = all.filter((s) => s.status === 'FAILED' || s.status === 'REJECTED').length;

  const topBotMap = new Map<string, number>();
  all.forEach((s) => topBotMap.set(s.bot_name, (topBotMap.get(s.bot_name) || 0) + 1));
  const topBot = [...topBotMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'ShopBot Alpha';

  return {
    active_sessions:       active,
    total_sessions_today:  all.length,
    completed_sessions:    completed,
    failed_sessions:       failed,
    deals_per_hour:        Math.max(1, Math.round(completed * 3.2)),
    total_volume_today:    completed * 4200,
    top_bot:               topBot,
    timestamp:             new Date().toISOString(),
  };
}

export function markMandatePaid(mandate_id: string): void {
  // Find session associated with this mandate and mark completed
  for (const [, session] of sessions) {
    if (session.mandate_id === mandate_id) {
      session.status     = 'COMPLETED';
      session.updated_at = new Date().toISOString();
      broadcastSessionUpdate(session.session_id, 'COMPLETED');
      break;
    }
  }
}
