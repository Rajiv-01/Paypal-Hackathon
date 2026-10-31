import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { CartMandate, WebSocketMessage } from '../types/mandate.js';
import { A2ASession, ChatMessage, SessionStatus, SwarmStats } from '../types/session.js';

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initWebSocketServer(server: HttpServer): WebSocketServer {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);
    console.log(`[autonopay:ws] Client connected. Total: ${clients.size}`);

    const welcomeMsg: WebSocketMessage = {
      type:      'CONNECTED',
      message:   'Connected to autonopay Telemetry Stream v2',
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(welcomeMsg));

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`[autonopay:ws] Client disconnected. Total: ${clients.size}`);
    });

    ws.on('error', (err) => {
      console.error('[autonopay:ws] Socket error:', err);
      clients.delete(ws);
    });

    // Heartbeat ping
    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.ping();
      else clearInterval(ping);
    }, 25000);
  });

  return wss;
}

// ─── Generic Broadcast ────────────────────────────────────────────────────────

export function broadcast(msg: WebSocketMessage): void {
  const payload = JSON.stringify(msg);
  let sent = 0;
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
      sent++;
    }
  }
  console.log(`[autonopay:ws] Broadcast ${msg.type} → ${sent} client(s)`);
}

// ─── Mandate Broadcasts ───────────────────────────────────────────────────────

export function broadcastMandate(mandate: CartMandate): void {
  broadcast({ type: 'NEW_MANDATE', payload: mandate });
}

export function broadcastMandateUpdate(
  mandate_id: string,
  status: string,
  checkout_url?: string
): void {
  broadcast({ type: 'MANDATE_UPDATED', payload: { mandate_id, status, checkout_url } });
}

// ─── Session Broadcasts (v2) ──────────────────────────────────────────────────

export function broadcastSessionStarted(session: A2ASession): void {
  broadcast({ type: 'SESSION_STARTED', payload: session });
}

export function broadcastSessionUpdate(
  session_id: string,
  status: SessionStatus,
  mandate_id?: string
): void {
  broadcast({
    type: 'SESSION_UPDATE',
    payload: { session_id, status, mandate_id, updated_at: new Date().toISOString() },
  });
}

export function broadcastNegotiationMessage(
  session_id: string,
  buyer_id: string,
  message: ChatMessage
): void {
  broadcast({ type: 'NEGOTIATION_MESSAGE', payload: { session_id, buyer_id, message } });
}

export function broadcastSwarmStats(stats: SwarmStats): void {
  broadcast({ type: 'SWARM_STATS_UPDATE', payload: stats });
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export function getClientCount(): number {
  return clients.size;
}
