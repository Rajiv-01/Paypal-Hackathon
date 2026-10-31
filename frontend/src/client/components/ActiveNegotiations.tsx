import React, { useEffect, useRef, useState } from 'react';
import { A2ASession, ChatMessage, SessionStatus } from '../../types';
import {
  Bot, Building2, Info, Loader2, CheckCircle2,
  XCircle, Clock, CreditCard, ChevronDown, ChevronUp,
  MapPin, Check, ExternalLink, Zap
} from 'lucide-react';

interface ActiveNegotiationsProps {
  sessions: A2ASession[];
  onPaymentComplete: (mandateId: string) => void;
}

export const ActiveNegotiations: React.FC<ActiveNegotiationsProps> = ({
  sessions,
  onPaymentComplete,
}) => {
  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            3. Active A2A Dialogue & Multi-Turn Negotiation
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {sessions.filter((s) => s.status === 'NEGOTIATING' || s.status === 'CONNECTING').length} LIVE
          </span>
        </div>
        <span className="text-[11px] text-slate-400">Streaming real-time dialogue via ws://localhost:3001</span>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <NegotiationSessionCard
            key={session.session_id}
            session={session}
            onPaymentComplete={onPaymentComplete}
          />
        ))}
      </div>
    </div>
  );
};

const STATUS_CONFIG: Record<SessionStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  CONNECTING:       { label: 'Connecting',        color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200',  dot: 'bg-amber-500 animate-pulse' },
  NEGOTIATING:      { label: 'Negotiating',       color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',   dot: 'bg-blue-500 animate-pulse' },
  AWAITING_PAYMENT: { label: 'Awaiting Payment',  color: 'text-cyan-700',   bg: 'bg-cyan-50',   border: 'border-cyan-200',   dot: 'bg-cyan-500 animate-pulse' },
  COMPLETED:        { label: 'Settled ✓',         color: 'text-emerald-700',bg: 'bg-emerald-50',border: 'border-emerald-200',dot: 'bg-emerald-500' },
  FAILED:           { label: 'Failed',            color: 'text-rose-700',   bg: 'bg-rose-50',   border: 'border-rose-200',   dot: 'bg-rose-500' },
  REJECTED:         { label: 'Rejected',          color: 'text-rose-700',   bg: 'bg-rose-50',   border: 'border-rose-200',   dot: 'bg-rose-500' },
};

const NegotiationSessionCard: React.FC<{
  session: A2ASession;
  onPaymentComplete: (mandateId: string) => void;
}> = ({ session, onPaymentComplete }) => {
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [expanded,     setExpanded]     = useState(true);
  const [payLoading,   setPayLoading]   = useState(false);
  const [payDone,      setPayDone]      = useState(false);
  const statusConfig = STATUS_CONFIG[session.status];

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [session.transcript.length]);

  const handlePay = async () => {
    if (!session.mandate_id) return;
    setPayLoading(true);
    try {
      // 1. Create order
      const createRes = await fetch('/api/paypal/buyer/create-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mandate_id: session.mandate_id, total_value: session.budget_cap }),
      });
      const { order_id } = await createRes.json();

      // 2. Capture order
      const captureRes = await fetch('/api/paypal/buyer/capture-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ order_id, mandate_id: session.mandate_id }),
      });
      await captureRes.json();

      setPayDone(true);
      onPaymentComplete(session.mandate_id);
    } catch (err) {
      console.error('Payment failed:', err);
    } finally {
      setPayLoading(false);
    }
  };

  const isFailed = session.status === 'FAILED' || session.status === 'REJECTED';
  const isDone   = session.status === 'COMPLETED' || payDone;

  return (
    <div className={`rounded-lg border overflow-hidden transition-all duration-200 bg-white ${
      isFailed
        ? 'border-rose-200'
        : isDone
        ? 'border-emerald-200'
        : 'border-slate-200 shadow-xs'
    }`}>
      {/* Header */}
      <div
        className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{session.bot_name}</span>
              <span className="text-[10px] text-slate-400 font-mono">({session.session_id})</span>
            </div>
            <div className="text-xs text-slate-600 font-medium">{session.item_requested}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 text-xs font-mono font-semibold px-2 py-0.5 rounded-md border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            <span>{statusConfig.label}</span>
          </div>

          <div className="text-xs font-mono text-slate-500 hidden sm:block">
            Spend Cap: <strong className="text-slate-800">${session.budget_cap.toLocaleString()}</strong>
          </div>

          <div className="text-slate-400 hover:text-slate-700 transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <>
          {/* Transcript Dialogue */}
          <div
            ref={transcriptRef}
            className="p-4 max-h-56 overflow-y-auto space-y-2.5 bg-white"
          >
            {session.transcript.length === 0 ? (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-3 font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Handshake initialized... Negotiating with Autonopay Gate.</span>
              </div>
            ) : (
              session.transcript.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))
            )}
          </div>

          {/* Footer Bar with Parameters and PayPal Checkout */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
              <span>Qty: <strong className="text-slate-700">{session.quantity}</strong></span>
              <span>Buffer: <strong className="text-slate-700">+{session.price_buffer_pct}%</strong></span>
              {session.region && (
                <span className="flex items-center gap-1 text-slate-700">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{session.region}</span>
                </span>
              )}
            </div>

            {/* PayPal Pay Button */}
            {session.status === 'AWAITING_PAYMENT' && !payDone && (
              <button
                type="button"
                onClick={handlePay}
                disabled={payLoading}
                className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-[#0070ba] hover:bg-[#005ea6] text-white text-xs font-bold shadow-xs active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {payLoading ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Processing with PayPal...</span></>
                ) : (
                  <><CreditCard className="w-3.5 h-3.5" /><span>Pay with PayPal (Demo Client)</span></>
                )}
              </button>
            )}

            {(payDone || session.status === 'COMPLETED') && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Payment Captured via PayPal ✓</span>
              </div>
            )}

            {isFailed && (
              <div className="flex items-center gap-1.5 text-rose-600 text-xs font-medium">
                <XCircle className="w-3.5 h-3.5" />
                <span>Negotiation terminated: {session.failure_reason || 'Reserve price exceeded'}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isBuyer = message.sender === 'BUYER_BOT';
  const isSystem = message.sender === 'SYSTEM';

  if (isSystem) {
    return (
      <div className="text-center py-0.5">
        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isBuyer ? 'items-start' : 'items-end'}`}>
      <div className="flex items-center gap-1.5 mb-0.5 px-1">
        <span className="text-[10px] font-bold text-slate-600">{message.sender_name}</span>
        <span className="text-[9px] font-mono text-slate-400">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
      <div
        className={`max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed shadow-xs ${
          isBuyer
            ? 'bg-blue-600 text-white font-medium rounded-tl-xs'
            : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-tr-xs'
        }`}
      >
        {message.text}
      </div>
    </div>
  );
};
