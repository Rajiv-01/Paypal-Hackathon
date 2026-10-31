import React, { useCallback, useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, Zap, Bot, ShieldCheck, Building2 } from 'lucide-react';
import { A2ASession, BotProfile, CartMandate, WebSocketMessage } from '../types';
import { BotRoster } from './components/BotRoster';
import { BotCommandInput } from './components/BotCommandInput';
import { ActiveNegotiations } from './components/ActiveNegotiations';
import { TransactionHistory } from './components/TransactionHistory';

// Stable buyer ID for this browser session
const BUYER_ID = `buyer_${Math.random().toString(36).slice(2, 9)}`;

export const ClientApp: React.FC = () => {
  const [bots, setBots] = useState<BotProfile[]>([]);
  const [selectedBot, setSelectedBot] = useState<BotProfile | null>(null);
  const [sessions, setSessions] = useState<A2ASession[]>([]);
  const [completedMandates, setCompletedMandates] = useState<CartMandate[]>([]);
  const [wsStatus, setWsStatus] = useState<'CONNECTING' | 'ONLINE' | 'OFFLINE'>('CONNECTING');

  // WebSocket connection
  const { lastJsonMessage } = useWebSocket<WebSocketMessage>('ws://localhost:3001', {
    shouldReconnect: () => true,
    reconnectInterval: 2500,
    reconnectAttempts: 25,
    onOpen:  () => setWsStatus('ONLINE'),
    onClose: () => setWsStatus('OFFLINE'),
    onError: () => setWsStatus('OFFLINE'),
  });

  // Fetch bot catalog on mount
  useEffect(() => {
    fetch('/api/bots')
      .then((r) => r.json())
      .then((data: BotProfile[]) => {
        setBots(data);
        if (data.length > 0) setSelectedBot(data[0]);
      })
      .catch(console.warn);

    // Fetch existing sessions if any
    fetch('/api/sessions')
      .then((r) => r.json())
      .then((data: A2ASession[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSessions(data);
        }
      })
      .catch(console.warn);
  }, []);

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastJsonMessage) return;

    if (lastJsonMessage.type === 'SESSION_STARTED') {
      const sess = lastJsonMessage.payload;
      setSessions((prev) => [sess, ...prev.filter((s) => s.session_id !== sess.session_id)]);
    }

    if (lastJsonMessage.type === 'SESSION_UPDATE') {
      const { session_id, status, mandate_id } = lastJsonMessage.payload;
      setSessions((prev) =>
        prev.map((s) =>
          s.session_id === session_id
            ? { ...s, status, mandate_id: mandate_id || s.mandate_id }
            : s
        )
      );
    }

    if (lastJsonMessage.type === 'NEGOTIATION_MESSAGE') {
      const { session_id, message } = lastJsonMessage.payload;
      setSessions((prev) =>
        prev.map((s) =>
          s.session_id === session_id
            ? { ...s, transcript: [...s.transcript, message] }
            : s
        )
      );
    }

    if (lastJsonMessage.type === 'NEW_MANDATE') {
      const m = lastJsonMessage.payload;
      setCompletedMandates((prev) => [m, ...prev]);
    }

    if (lastJsonMessage.type === 'MANDATE_UPDATED') {
      const { mandate_id, status } = lastJsonMessage.payload;
      setCompletedMandates((prev) =>
        prev.map((m) => m.mandate_id === mandate_id ? { ...m, status: status as any } : m)
      );
    }
  }, [lastJsonMessage]);

  const handleDeploy = useCallback(async (params: {
    bot_id: string;
    item: string;
    budget_cap: number;
    price_buffer_pct: number;
    quantity: number;
    requested_price: number;
    command: string;
  }) => {
    try {
      const res = await fetch('/api/session/start', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyer_id: BUYER_ID, ...params }),
      });
      const session: A2ASession = await res.json();
      setSessions((prev) => [session, ...prev.filter((s) => s.session_id !== session.session_id)]);
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  }, []);

  const handlePaymentComplete = useCallback((mandateId: string) => {
    setCompletedMandates((prev) =>
      prev.map((m) => m.mandate_id === mandateId ? { ...m, status: 'SETTLED' } : m)
    );
    setSessions((prev) =>
      prev.map((s) => s.mandate_id === mandateId ? { ...s, status: 'COMPLETED' } : s)
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-xs font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Hub</span>
            </Link>

            <div className="w-px h-4 bg-slate-200" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center shadow-xs">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-slate-900 text-sm tracking-tight">autonopay</span>
              <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                BUYER / CLIENT PORTAL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/business"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Switch to Business Center</span>
            </Link>

            <div className={`flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded-md border ${
              wsStatus === 'ONLINE'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : wsStatus === 'OFFLINE'
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                wsStatus === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : wsStatus === 'OFFLINE' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
              }`} />
              <span>{wsStatus}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-5 py-6 space-y-6">
        {/* Page Header Banner */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-mono font-semibold text-blue-700 uppercase">
                Autonomous Procurement Terminal
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              AI Shopping Bots & Negotiation Engine
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an agent, configure hard spend ceilings and buffer tolerance, and command autonomous purchases with built-in PayPal payment clearing.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <div className="px-3 py-2 rounded-md bg-slate-50 border border-slate-200 text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Active Sessions</div>
              <div className="text-base font-bold text-slate-900 font-mono">{sessions.length}</div>
            </div>
            <div className="px-3 py-2 rounded-md bg-slate-50 border border-slate-200 text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Completed Deals</div>
              <div className="text-base font-bold text-emerald-600 font-mono">{completedMandates.length}</div>
            </div>
          </div>
        </div>

        {/* 1. Bot Roster */}
        <BotRoster bots={bots} selectedBot={selectedBot} onSelect={setSelectedBot} />

        {/* 2. Command & Budget Input */}
        <BotCommandInput selectedBot={selectedBot} onDeploy={handleDeploy} />

        {/* 3. Active Negotiations */}
        {sessions.length > 0 && (
          <ActiveNegotiations sessions={sessions} onPaymentComplete={handlePaymentComplete} />
        )}

        {/* 4. Transaction History */}
        {completedMandates.length > 0 && (
          <TransactionHistory mandates={completedMandates} />
        )}
      </div>
    </div>
  );
};

export default ClientApp;
