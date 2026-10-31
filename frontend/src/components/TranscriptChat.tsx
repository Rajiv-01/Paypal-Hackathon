import React from 'react';
import { Bot, Store, ShieldAlert, ShieldCheck, DollarSign, Box } from 'lucide-react';
import { CartMandate } from '../types';

interface TranscriptChatProps {
  mandate: CartMandate;
}

interface ParsedMessage {
  timestamp: string;
  sender: 'consumer' | 'merchant' | 'system';
  speakerName: string;
  content: string;
}

function parseTranscript(raw: string, defaultConsumer: string): ParsedMessage[] {
  const lines = raw.split('\n').filter((l) => l.trim().length > 0);
  const messages: ParsedMessage[] = [];

  for (const line of lines) {
    const timestampMatch = line.match(/^\[(.*?)\]/);
    const timestamp = timestampMatch ? timestampMatch[1] : '';
    const cleanLine = timestampMatch ? line.replace(/^\[.*?\]\s*/, '') : line;

    const speakerMatch = cleanLine.match(/^<(Consumer|Merchant|System):\s*(.*?)>\s*(.*)$/i);

    if (speakerMatch) {
      const typeStr = speakerMatch[1].toLowerCase();
      const speakerName = speakerMatch[2];
      const content = speakerMatch[3];

      messages.push({
        timestamp,
        sender: typeStr.includes('consumer') ? 'consumer' : typeStr.includes('merchant') ? 'merchant' : 'system',
        speakerName,
        content
      });
    } else {
      messages.push({
        timestamp,
        sender: line.toLowerCase().includes('consumer') ? 'consumer' : 'merchant',
        speakerName: line.toLowerCase().includes('consumer') ? defaultConsumer : 'Autonopay Merchant',
        content: cleanLine
      });
    }
  }

  return messages;
}

export const TranscriptChat: React.FC<TranscriptChatProps> = ({ mandate }) => {
  const messages = parseTranscript(mandate.transcript, mandate.consumer_agent);

  return (
    <div className="p-4 bg-[#0d121f] border-t border-b border-slate-800 text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-semibold text-cyan-400">
              A2A NEGOTIATION TRANSCRIPT & MANDATE AUDIT
            </div>
            <div className="text-[11px] text-slate-400">
              Mandate ID: <span className="font-mono text-slate-200">{mandate.mandate_id}</span> • Consumer Agent: <span className="text-cyan-300 font-medium">{mandate.consumer_agent}</span>
            </div>
          </div>
        </div>

        {/* Quick summary pill stats */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <Box className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Item:</span>
            <span className="text-white font-medium">{mandate.item}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Agreed:</span>
            <span className="text-cyan-300 font-bold">${mandate.agreed_price.toFixed(2)} × {mandate.quantity} = ${mandate.total_value.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            {mandate.risk_score > 50 ? (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="text-slate-400">Risk:</span>
            <span className={mandate.risk_score > 50 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {mandate.risk_score}%
            </span>
          </div>
        </div>
      </div>

      {/* Chat messages viewport */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
        {messages.map((msg, idx) => {
          const isConsumer = msg.sender === 'consumer';
          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${isConsumer ? 'justify-start' : 'justify-end'}`}
            >
              {isConsumer && (
                <div className="w-7 h-7 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-xl px-4 py-2.5 text-xs transition-all ${
                  isConsumer
                    ? 'bg-[#131c31] border border-cyan-900/40 text-slate-200'
                    : 'bg-[#1e1735] border border-purple-900/40 text-purple-100'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span
                    className={`font-semibold text-[11px] ${
                      isConsumer ? 'text-cyan-400' : 'text-purple-300'
                    }`}
                  >
                    {isConsumer ? `Inbound Consumer: ${msg.speakerName}` : `Merchant Gate: ${msg.speakerName}`}
                  </span>
                  {msg.timestamp && (
                    <span className="text-[10px] font-mono text-slate-500">
                      {msg.timestamp}
                    </span>
                  )}
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
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
    </div>
  );
};
