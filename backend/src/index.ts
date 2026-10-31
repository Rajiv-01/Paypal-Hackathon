import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { CartMandate, SimulateRequest, SessionStartRequest } from './types/mandate.js';
import { negotiateTransaction, isMockMode } from './services/merchantAgent.js';
import { createPayPalOrder } from './services/paypalService.js';
import {
  initWebSocketServer,
  broadcastMandate,
  broadcastMandateUpdate,
  broadcastSwarmStats,
  getClientCount,
} from './services/websocketServer.js';
import {
  startSession,
  getAllSessions,
  getSessionsByBuyer,
  getFailedSessions,
  getSwarmStats,
  markMandatePaid,
} from './services/sessionManager.js';
import { PRODUCT_CATALOG, BOT_CATALOG, getProductById } from './services/productCatalog.js';

dotenv.config();

const app  = express();
const port = process.env.PORT || 3001;
const server = http.createServer(app);

// Initialize WebSocket server
initWebSocketServer(server);

app.use(cors());
app.use(express.json());

// ─── In-Memory Mandate Store ──────────────────────────────────────────────────

const mandatesStore = new Map<string, CartMandate>();

const seedMandates: CartMandate[] = [
  {
    mandate_id:     'req_init_1001',
    consumer_agent: 'Meta Muse',
    item:           'NVIDIA H100 Tensor Core AI Accelerator (80GB SXM5)',
    agreed_price:   850.00,
    quantity:       10,
    total_value:    8500.00,
    risk_score:     14,
    transcript:     `[00:00:01] <Consumer: Meta Muse> Inbound request for 10 units of NVIDIA H100 Tensor Core AI Accelerator (80GB SXM5) at bid $780.00/unit.\n[00:00:02] <Merchant: Autonopay Agent> Minimum enterprise wholesale rule enforced ($850.00/unit minimum). Counter-offer transmitted.\n[00:00:03] <Consumer: Meta Muse> Evaluated SLA parameters and FIPS compliance. Counter accepted at $850.00/unit.\n[00:00:04] <Merchant: Autonopay Agent> AP2 Mandate synthesized. Total: $8,500.00. Awaiting merchant clearance.`,
    status:         'PENDING_APPROVAL',
    created_at:     new Date(Date.now() - 120000).toISOString(),
    product_id:     'prod_gpu',
    region:         'US-WEST',
    city:           'San Francisco',
    lat:             37.77,
    lng:           -122.42,
  },
  {
    mandate_id:     'req_init_1002',
    consumer_agent: 'AutoGPT Fleet',
    item:           'Industrial IoT Edge Gateway Server (Gen-5 Dual 10GbE)',
    agreed_price:   120.00,
    quantity:       50,
    total_value:    6000.00,
    risk_score:     8,
    transcript:     `[00:00:01] <Consumer: AutoGPT Fleet> Protocol Handshake: Requesting 50 Industrial IoT Edge Gateway Server units at bid $105.00.\n[00:00:02] <Merchant: Autonopay Agent> Factory reserve policy requires $120.00/unit minimum with 3-year enterprise warranty. Counter proposed.\n[00:00:03] <Consumer: AutoGPT Fleet> Autonomous treasury rules verified. Counter accepted at $120.00/unit.\n[00:00:04] <Merchant: Autonopay Agent> Mandate locked at $6,000.00. Routed to command center.`,
    status:         'SETTLED',
    created_at:     new Date(Date.now() - 360000).toISOString(),
    checkout_url:   'https://sandbox.paypal.com/checkout/mock',
    product_id:     'prod_api',
    region:         'EU-CENTRAL',
    city:           'Frankfurt',
    lat:             50.11,
    lng:              8.68,
  },
  {
    mandate_id:     'req_init_1003',
    consumer_agent: 'Synthetix Bot',
    item:           'Autonomous Neural Vision Sensor Array (Edge AI Station)',
    agreed_price:   245.00,
    quantity:       25,
    total_value:    6125.00,
    risk_score:     68,
    transcript:     `[00:00:01] <Consumer: Synthetix Bot> Inbound procurement bid: 25 units of Autonomous Neural Vision Sensor Array at $210.00/unit.\n[00:00:02] <Merchant: Autonopay Agent> Anomaly telemetry warning: Origin subnet untrusted. Counter-offering non-refundable pricing of $245.00/unit with air-gapped transit.\n[00:00:03] <Consumer: Synthetix Bot> Counter-offer accepted immediately.\n[00:00:04] <Merchant: Autonopay Agent> Risk score evaluated: 68% (ELEVATED). Mandatory human authorization required for PayPal release.`,
    status:         'PENDING_APPROVAL',
    created_at:     new Date(Date.now() - 60000).toISOString(),
    product_id:     'prod_feeds',
    region:         'US-EAST',
    city:           'New York',
    lat:             40.71,
    lng:            -74.01,
  },
];

seedMandates.forEach((m) => mandatesStore.set(m.mandate_id, m));

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status:            'ok',
    service:           'autonopay-backend-v2',
    mock_mode:         isMockMode(),
    paypal_configured: Boolean(process.env.PAYPAL_CLIENT_ID && !process.env.PAYPAL_CLIENT_ID.includes('your_paypal')),
    active_ws_clients: getClientCount(),
    mandates_count:    mandatesStore.size,
    sessions_count:    getAllSessions().length,
    timestamp:         new Date().toISOString(),
  });
});

// ─── Mandates ─────────────────────────────────────────────────────────────────

app.get('/api/mandates', (_req: Request, res: Response) => {
  const list = Array.from(mandatesStore.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  res.json(list);
});

// ─── Product Catalog ──────────────────────────────────────────────────────────

app.get('/api/products', (_req: Request, res: Response) => {
  res.json(PRODUCT_CATALOG);
});

app.get('/api/products/:product_id', (req: Request, res: Response) => {
  const product = getProductById(req.params.product_id as string);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// ─── Bot Catalog ──────────────────────────────────────────────────────────────

app.get('/api/bots', (_req: Request, res: Response) => {
  res.json(BOT_CATALOG);
});

// ─── Sessions ─────────────────────────────────────────────────────────────────

app.post('/api/session/start', async (req: Request, res: Response) => {
  try {
    const body = req.body as SessionStartRequest;
    if (!body.buyer_id || !body.bot_id || !body.item) {
      return res.status(400).json({ error: 'buyer_id, bot_id, and item are required.' });
    }
    // Defaults
    body.budget_cap       = body.budget_cap       ?? 10000;
    body.price_buffer_pct = body.price_buffer_pct ?? 15;
    body.quantity         = body.quantity         ?? 100;

    const session = await startSession(body, mandatesStore);
    res.status(201).json(session);
  } catch (err: any) {
    console.error('[api] /session/start error:', err);
    res.status(500).json({ error: 'Failed to start session', details: err.message });
  }
});

app.get('/api/sessions/buyer/:buyer_id', (req: Request, res: Response) => {
  res.json(getSessionsByBuyer(req.params.buyer_id as string));
});

app.get('/api/sessions', (_req: Request, res: Response) => {
  res.json(getAllSessions());
});

// ─── Agent Swarm ──────────────────────────────────────────────────────────────

app.get('/api/swarm/stats', (_req: Request, res: Response) => {
  res.json(getSwarmStats());
});

app.get('/api/swarm/leads', (_req: Request, res: Response) => {
  const failed = getFailedSessions();
  const itemCountMap = new Map<string, number>();
  failed.forEach((s) => itemCountMap.set(s.item_requested, (itemCountMap.get(s.item_requested) || 0) + 1));

  const leads = failed.map((s) => ({
    session_id:     s.session_id,
    bot_name:       s.bot_name,
    item_requested: s.item_requested,
    budget_cap:     s.budget_cap,
    quantity:       s.quantity,
    failure_reason: s.failure_reason || 'Unknown',
    started_at:     s.started_at,
    region:         s.region,
    similar_count:  (itemCountMap.get(s.item_requested) || 1) - 1,
  }));

  res.json(leads);
});

app.post('/api/swarm/follow-lead', (req: Request, res: Response) => {
  const { session_id, strategy_override, budget_adjustment } = req.body || {};
  res.json({
    success: true,
    message: `Lead ${session_id || 'active'} queued for autonomous follow-up. Dispatched agent swarm with ${budget_adjustment || '+12%'} revised ceiling.`,
    status: 'DISPATCHED',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/swarm/dispatch-similar', (req: Request, res: Response) => {
  const { item, target_region } = req.body || {};
  res.json({
    success: true,
    message: `Swarm cluster deployed to sweep similar leads for "${item || 'Hardware/Compute'}" in ${target_region || 'all active regions'}.`,
    dispatched_count: 3,
    status: 'ACTIVE_SWEEP',
    timestamp: new Date().toISOString()
  });
});

// ─── Commercial Invoices ──────────────────────────────────────────────────────

app.get('/api/invoices', (_req: Request, res: Response) => {
  const mandates = Array.from(mandatesStore.values());
  const invoices = mandates.map((m, idx) => {
    const isPaid = m.status === 'SETTLED';
    const subtotal = m.total_value;
    const protocolFee = +(subtotal * 0.029).toFixed(2);
    const total = +(subtotal + protocolFee).toFixed(2);
    const invoiceNum = `INV-2026-${(8840 + idx).toString()}`;
    const date = m.created_at;
    const dueDate = new Date(new Date(date).getTime() + 7 * 86400000).toISOString();

    return {
      invoice_id: invoiceNum,
      mandate_id: m.mandate_id,
      date,
      due_date: dueDate,
      buyer_agent: m.consumer_agent,
      target_item: m.item,
      quantity: m.quantity,
      unit_price: m.agreed_price,
      subtotal,
      protocol_fee: protocolFee,
      total,
      status: isPaid ? 'PAID' : 'PENDING',
      payment_method: 'PayPal Orders v2 / AP2 Net',
      paypal_order_id: m.paypal_order_id || `PAYPAL-ORD-${m.mandate_id.toUpperCase()}`,
      proof_hash: `0x${Math.abs(idx * 7919 + 48271).toString(16).padStart(8, '0')}7f4a21e${idx}b`,
      checkout_url: m.checkout_url || 'https://sandbox.paypal.com/checkout/mock'
    };
  });

  res.json(invoices);
});

app.post('/api/invoices/:invoice_id/pay', async (req: Request, res: Response) => {
  const { invoice_id } = req.params;
  res.json({
    success: true,
    invoice_id,
    status: 'PAID',
    settled_at: new Date().toISOString(),
    message: `Invoice ${invoice_id} successfully settled via Autonopay AP2 Clearinghouse.`
  });
});

// ─── Simulate Agent (Legacy) ──────────────────────────────────────────────────

app.post('/api/simulate-agent', async (req: Request, res: Response) => {
  try {
    const payload: SimulateRequest = req.body || {};
    const mandate = await negotiateTransaction(payload);
    mandatesStore.set(mandate.mandate_id, mandate);
    broadcastMandate(mandate);
    res.status(201).json(mandate);
  } catch (error: any) {
    res.status(500).json({ error: 'Simulation failed', details: error.message });
  }
});

app.post('/api/simulate-burst', async (_req: Request, res: Response) => {
  try {
    const scenarios = [
      { item: 'Quantum Cryptographic Keys',  requested_price: 120, quantity: 40,  consumer_agent: 'Claude BuyerBot'  },
      { item: 'Zero-Trust Mesh Relays',      requested_price:  35, quantity: 150, consumer_agent: 'AgentSmith'       },
      { item: 'Neural Inference Clusters',   requested_price: 210, quantity: 20,  consumer_agent: 'HyperAgent X'     },
      { item: 'H100 GPU Spot Slices',        requested_price:  48, quantity: 80,  consumer_agent: 'Meta Muse'        },
    ];
    const results: CartMandate[] = [];
    for (const s of scenarios) {
      const mandate = await negotiateTransaction(s);
      mandatesStore.set(mandate.mandate_id, mandate);
      broadcastMandate(mandate);
      results.push(mandate);
      await new Promise((r) => setTimeout(r, 120));
    }
    res.json({ success: true, count: results.length, mandates: results });
  } catch (error: any) {
    res.status(500).json({ error: 'Burst simulation failed', details: error.message });
  }
});

// ─── Execute Order (Business PayPal Settlement) ───────────────────────────────

app.post('/api/execute-order', async (req: Request, res: Response) => {
  try {
    const { mandate_id } = req.body || {};
    if (!mandate_id || !mandatesStore.has(mandate_id)) {
      return res.status(404).json({ error: 'Mandate not found', mandate_id });
    }
    const mandate = mandatesStore.get(mandate_id)!;
    const paypalResult = await createPayPalOrder(mandate);

    mandate.status      = 'SETTLED';
    mandate.checkout_url = paypalResult.checkout_url;
    mandatesStore.set(mandate_id, mandate);

    broadcastMandateUpdate(mandate_id, 'SETTLED', paypalResult.checkout_url);
    markMandatePaid(mandate_id);

    res.json({
      status:      'COMPLETED',
      order_id:    paypalResult.order_id,
      checkout_url: paypalResult.checkout_url,
      mode:        paypalResult.mode,
      mandate_id,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Order execution failed', details: error.message });
  }
});

// ─── PayPal Buyer Routes (Client Platform) ────────────────────────────────────

app.post('/api/paypal/buyer/create-order', async (req: Request, res: Response) => {
  const { mandate_id, total_value } = req.body || {};
  // For sandbox: generate a simulated order ID that the PayPal JS SDK can use
  const mockOrderId = `BUYER-ORD-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
  res.json({ order_id: mockOrderId, status: 'CREATED', mandate_id });
});

app.post('/api/paypal/buyer/capture-order', async (req: Request, res: Response) => {
  const { order_id, mandate_id } = req.body || {};
  if (mandate_id && mandatesStore.has(mandate_id)) {
    const mandate = mandatesStore.get(mandate_id)!;
    mandate.status         = 'SETTLED';
    mandate.paypal_order_id = order_id;
    mandate.checkout_url   = `https://www.sandbox.paypal.com/checkoutnow?token=${order_id}`;
    mandatesStore.set(mandate_id, mandate);

    broadcastMandateUpdate(mandate_id, 'SETTLED', mandate.checkout_url);
    markMandatePaid(mandate_id);
  }
  res.json({ status: 'COMPLETED', order_id, mandate_id });
});

// ─── Swarm Stats Broadcast (every 8s) ────────────────────────────────────────

setInterval(() => {
  broadcastSwarmStats(getSwarmStats());
}, 8000);

// ─── Start ────────────────────────────────────────────────────────────────────

server.listen(port, () => {
  console.log(`[autonopay v2] Server running on http://localhost:${port}`);
  console.log(`[autonopay v2] WebSocket on ws://localhost:${port}`);
  console.log(`[autonopay v2] Mode: ${isMockMode() ? 'MOCK AGENT' : 'OPENAI LIVE'}`);
  console.log(`[autonopay v2] Products: ${PRODUCT_CATALOG.length} | Bots: ${BOT_CATALOG.length}`);
});

export default app;
