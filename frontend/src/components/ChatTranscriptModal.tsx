import { X, Bot, Store } from 'lucide-react';

import { CartMandate } from '../types';

interface ChatTranscriptModalProps {
  mandate: CartMandate | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedMsg {
  timestamp: string;
  sender: 'consumer' | 'merchant';
  speakerName: string;
  content: string;
}

function parseTranscript(raw: string, defaultConsumer: string): ParsedMsg[] {
  const lines = raw.split('\n').filter((l) => l.trim().length > 0);
  const result: ParsedMsg[] = [];

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
        speakerName: isConsumer ? defaultConsumer : 'Autonopay Merchant',
        content: cleanLine
      });
    }
  }

  return result;
}

export const ChatTranscriptModal: React.FC<ChatTranscriptModalProps> = ({
  mandate,
  isOpen,
  onClose
}) => {
  if (!isOpen || !mandate) return null;

  const messages = parseTranscript(mandate.transcript, mandate.consumer_agent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden text-slate-900">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              A2A Negotiation Log: {mandate.mandate_id}
            </h3>
            <p className="text-xs text-slate-500">
              Autonomous dialogue between <span className="font-semibold text-blue-600">{mandate.consumer_agent}</span> and Autonopay Merchant Gate.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Viewport */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5 bg-slate-50/30">
          {messages.map((msg, i) => {
            const isConsumer = msg.sender === 'consumer';
            return (
              <div
                key={i}
                className={`flex items-start gap-2.5 ${isConsumer ? 'justify-start' : 'justify-end'}`}
              >
                {isConsumer && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                    isConsumer
                      ? 'bg-white border border-slate-200 text-slate-800'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between gap-3 mb-1 text-[11px] ${
                      isConsumer ? 'text-slate-400' : 'text-blue-100'
                    }`}
                  >
                    <span className="font-semibold">
                      {isConsumer ? msg.speakerName : 'Autonopay Merchant'}
                    </span>
                    {msg.timestamp && <span className="font-mono">{msg.timestamp}</span>}
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>

                {!isConsumer && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Store className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <div>
            Agreed Rate: <strong className="text-slate-900">${mandate.agreed_price.toFixed(2)}</strong> • Total: <strong className="text-slate-900">${mandate.total_value.toFixed(2)}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
