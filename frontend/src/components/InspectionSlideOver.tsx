import React, { useState } from 'react';
import {
  X,
  Bot,
  Store,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Activity,
  CreditCard
} from 'lucide-react';

import { CartMandate } from '../types';

interface InspectionSlideOverProps {
  mandate: CartMandate | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (mandateId: string) => void;
}

interface ParsedLine {
  timestamp: string;
  sender: 'consumer' | 'merchant';
  speakerName: string;
  content: string;
}

function parseTranscript(raw: string, defaultConsumer: string): ParsedLine[] {
  const lines = raw.split('\n').filter((l) => l.trim().length > 0);
  const result: ParsedLine[] = [];

  for (const line of lines) {
    const timestampMatch = line.match(/^\[(.*?)\]/);
    const timestamp = timestampMatch ? timestampMatch[1] : '';
    const cleanLine = timestampMatch ? line.replace(/^\[.*?\]\s*/, '') : line;

    const speakerMatch = cleanLine.match(/^<(Consumer|Merchant|System):\s*(.*?)>\s*(.*)$/i);

    if (speakerMatch) {
      const typeStr = speakerMatch[1].toLowerCase();
      result.push({
        timestamp,
        sender: typeStr.includes('consumer') ? 'consumer' : 'merchant',
        speakerName: speakerMatch[2],
        content: speakerMatch[3]
      });
    } else {
      const isConsumer = line.toLowerCase().includes('consumer');
      result.push({
        timestamp,
        sender: isConsumer ? 'consumer' : 'merchant',
        speakerName: isConsumer ? defaultConsumer : 'Autonopay Gate',
        content: cleanLine
      });
    }
  }

  return result;
}

export const InspectionSlideOver: React.FC<InspectionSlideOverProps> = ({
  mandate,
  isOpen,
  onClose,
  onApprove
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'json' | 'paypal'>('chat');
  const [copied, setCopied] = useState(false);

  if (!mandate) return null;

  const messages = parseTranscript(mandate.transcript, mandate.consumer_agent);
  const isHighRisk = mandate.risk_score > 50;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(mandate, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Slide-over panel */}
      <div
        className={`absolute inset-y-0 right-0 max-w-xl w-full bg-[#0a0e17] border-l border-slate-800/90 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel Header */}
        <div className="p-5 border-b border-slate-800 bg-[#0d121f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono tracking-wider">
                  MANDATE AUDIT: {mandate.mandate_id}
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    mandate.status === 'SETTLED'
                      ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                  }`}
                >
                  {mandate.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Agent Protocol: <span className="text-cyan-300">{mandate.consumer_agent}</span> • Contract: {mandate.item}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Stat Bar */}
        <div className="grid grid-cols-3 gap-2 px-5 py-3 bg-[#080b12] border-b border-slate-800/80 text-xs font-mono">
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Agreed Rate</span>
            <span className="text-white font-bold">${mandate.agreed_price.toFixed(2)}/unit</span>
          </div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Total Valuation</span>
            <span className="text-cyan-300 font-bold">${mandate.total_value.toFixed(2)}</span>
          </div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Risk Factor</span>
            <span
              className={`font-bold flex items-center gap-1 ${
                isHighRisk ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isHighRisk ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
              {mandate.risk_score}%
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-5 border-b border-slate-800 bg-[#0d121f] text-xs">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-3 px-3 font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>A2A Negotiation Log</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`py-3 px-3 font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>AP2 Mandate (JSON)</span>
          </button>
          <button
            onClick={() => setActiveTab('paypal')}
            className={`py-3 px-3 font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'paypal'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>PayPal Settlement</span>
          </button>
        </div>

        {/* Tab Body Viewport */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'chat' && (
            <div className="space-y-3">
              {messages.map((msg, i) => {
                const isConsumer = msg.sender === 'consumer';
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 ${
                      isConsumer ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {isConsumer && (
                      <div className="w-7 h-7 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                    )}

                    <div
                      className={`max-w-md rounded-xl px-4 py-3 text-xs leading-relaxed transition-all ${
                        isConsumer
                          ? 'bg-[#121829] border border-cyan-900/40 text-slate-200'
                          : 'bg-[#1c1533] border border-purple-900/40 text-purple-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1.5 text-[11px] font-mono">
                        <span className={isConsumer ? 'text-cyan-400 font-semibold' : 'text-purple-300 font-semibold'}>
                          {isConsumer ? `Inbound: ${msg.speakerName}` : `Merchant: ${msg.speakerName}`}
                        </span>
                        {msg.timestamp && <span className="text-slate-500">{msg.timestamp}</span>}
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {!isConsumer && (
                      <div className="w-7 h-7 rounded-full bg-purple-950/80 border border-purple-500/40 flex items-center justify-center shrink-0 mt-0.5">
                        <Store className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'json' && (
            <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-cyan-300 overflow-x-auto">
              <button
                onClick={handleCopyJson}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Copy JSON"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <pre>{JSON.stringify(mandate, null, 2)}</pre>
            </div>
          )}

          {activeTab === 'paypal' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Endpoint</span>
                  <span className="font-mono text-cyan-300">POST /v2/checkout/orders</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Capture Intent</span>
                  <span className="font-mono text-white">CAPTURE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Purchase Units</span>
                  <span className="font-mono text-emerald-400 font-bold">${mandate.total_value.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Category</span>
                  <span className="font-mono text-slate-300">DIGITAL_GOODS</span>
                </div>
                {mandate.checkout_url && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Checkout Link</span>
                    <a
                      href={mandate.checkout_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>sandbox.paypal.com</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0d121f] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            Close Audit
          </button>

          {mandate.status !== 'SETTLED' ? (
            <button
              onClick={() => {
                onApprove(mandate.mandate_id);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Authorize & Settle via PayPal</span>
            </button>
          ) : (
            <a
              href={mandate.checkout_url || 'https://sandbox.paypal.com/checkout/mock'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>View Settled PayPal Receipt</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
