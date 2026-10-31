import React, { useState } from 'react';
import {
  MessageSquare,
  ShieldCheck,
  Activity,
  X,
  CreditCard,
  Send,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Bot,
  BarChart2,
  MapPin,
  TrendingUp,
  Maximize2
} from 'lucide-react';
import { CartMandate } from '../types';
import { ThreeSecurityBadge } from './ThreeSecurityBadge';
import { ProductDetailPanel } from '../business/components/ProductDetailPanel';

export type SidebarTab = 'analytics' | 'chat' | 'clearance3d' | 'telemetry';

function getProductIdForMandate(mandate: CartMandate): string {
  if (mandate.product_id) return mandate.product_id;
  const item = (mandate.item || '').toLowerCase();
  if (item.includes('gpu')) return 'prod_gpu';
  if (item.includes('api') || item.includes('token')) return 'prod_api';
  if (item.includes('key') || item.includes('crypto')) return 'prod_keys';
  if (item.includes('feed') || item.includes('market')) return 'prod_feeds';
  if (item.includes('cluster') || item.includes('neural') || item.includes('infer')) return 'prod_neural';
  if (item.includes('relay') || item.includes('mesh')) return 'prod_relay';
  return 'prod_gpu';
}

interface GridSidebarDeckProps {
  mandate: CartMandate | null;
  isOpen: boolean;
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onClose: () => void;
  onApproveSuccess?: (mandateId: string, checkoutUrl: string) => void;
}

export const GridSidebarDeck: React.FC<GridSidebarDeckProps> = ({
  mandate,
  isOpen,
  activeTab,
  onTabChange,
  onClose,
  onApproveSuccess
}) => {
  const [userReply, setUserReply] = useState('');
  const [isSettling, setIsSettling] = useState(false);
  const [localChatList, setLocalChatList] = useState<{
    sender: string;
    text: string;
    time: string;
    isMerchant: boolean;
  }[]>([]);

  // Parse mandate.transcript into conversational messages
  React.useEffect(() => {
    if (mandate) {
      let dialogue: { sender: string; text: string; time: string; isMerchant: boolean }[] = [];

      if (mandate.transcript) {
        const lines = mandate.transcript.split('\n').filter((l) => l.trim().length > 0);
        dialogue = lines.map((line) => {
          const timeMatch = line.match(/^\[(.*?)\]/);
          const speakerMatch = line.match(/<(.*?)>/);
          const time = timeMatch ? timeMatch[1] : '00:00';
          const rawSpeaker = speakerMatch ? speakerMatch[1] : mandate.consumer_agent;
          const text = line.replace(/^\[.*?\]\s*/, '').replace(/<.*?>\s*/, '');
          const isMerchant =
            rawSpeaker.toLowerCase().includes('merchant') ||
            rawSpeaker.toLowerCase().includes('gate') ||
            rawSpeaker.toLowerCase().includes('autonopay');
          return {
            sender: rawSpeaker,
            text,
            time,
            isMerchant
          };
        });
      }

      if (dialogue.length === 0) {
        dialogue = [
          {
            sender: mandate.consumer_agent,
            text: `Inbound A2A request: Seeking ${mandate.quantity} units of ${mandate.item} at $${(
              mandate.total_value / (mandate.quantity || 1)
            ).toFixed(2)}/unit.`,
            time: '00:00:01',
            isMerchant: false
          },
          {
            sender: 'Autonopay Gate',
            text: `Mandate validated against business pricing policy. AP2 cryptographically secured.`,
            time: '00:00:02',
            isMerchant: true
          }
        ];
      }

      setLocalChatList(dialogue);
    }
  }, [mandate]);

  if (!isOpen) return null;

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userReply.trim() || !mandate) return;

    const newMsg = {
      sender: 'Autonopay Human Desk',
      text: userReply.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMerchant: true
    };

    setLocalChatList((prev) => [...prev, newMsg]);
    setUserReply('');
  };

  const handleExecutePayPal = async () => {
    if (!mandate || isSettling) return;
    setIsSettling(true);
    try {
      const response = await fetch('/api/execute-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mandate_id: mandate.mandate_id })
      });
      if (!response.ok) throw new Error('Settlement failed');
      const data = await response.json();
      onApproveSuccess?.(mandate.mandate_id, data.checkout_url || '#');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSettling(false);
    }
  };

  const isSettled = mandate?.status === 'SETTLED';
  const isHighRisk = (mandate?.risk_score || 0) > 50;

  return (
    <div className="w-[420px] xl:w-[470px] shrink-0 border-l border-slate-200 bg-white flex flex-col h-full z-10 transition-all shadow-xs">
      {/* Widget Deck Header */}
      <div className="p-2.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onTabChange('analytics')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'analytics'
                ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Product Intel</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('chat')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'chat'
                ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>A2A Chat</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('clearance3d')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'clearance3d'
                ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>3D Vault</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('telemetry')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'telemetry'
                ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-purple-600" />
            <span>Telemetry</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          title="Close Sidebar Deck"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!mandate ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
          <Bot className="w-9 h-9 text-slate-300 mb-2 stroke-1" />
          <p className="text-xs font-medium text-slate-600">Select any AG Grid row</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            to inspect regional market behavior, live A2A chat & clearance
          </p>
        </div>
      ) : (
        <>
          {/* Active Mandate Sub-Header */}
          <div className="p-3 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 truncate">
                  {mandate.item}
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                    isSettled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {isSettled ? 'SETTLED' : 'PROCESSING'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                <span>{mandate.mandate_id}</span>
                {mandate.region && (
                  <span className="text-slate-600 font-semibold flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{mandate.region}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-sm font-bold text-slate-900 font-mono">
                ${mandate.total_value.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {mandate.quantity} units @ ${mandate.agreed_price.toFixed(2)}
              </div>
            </div>
          </div>

          {/* TAB 0: Product Intelligence (Market Behavior, Region, KPIs) */}
          {activeTab === 'analytics' && (
            <div className="flex-1 overflow-y-auto p-3 bg-slate-50/50">
              <ProductDetailPanel
                productId={getProductIdForMandate(mandate)}
                compact={true}
              />
            </div>
          )}

          {/* TAB 1: A2A Agent Chat */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/40">
              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                <div className="text-center my-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    A2A Autonomous Channel Established
                  </span>
                </div>

                {localChatList.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.isMerchant ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5 px-1">
                      <span className="text-[10px] font-semibold text-slate-500">
                        {msg.sender}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">{msg.time}</span>
                    </div>

                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed shadow-xs ${
                        msg.isMerchant
                          ? 'bg-blue-600 text-white font-medium rounded-tr-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Dock */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  value={userReply}
                  onChange={(e) => setUserReply(e.target.value)}
                  placeholder="Inject merchant message into live transcript..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/60"
                />
                <button
                  type="submit"
                  disabled={!userReply.trim()}
                  className="p-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: 3D Clearance Seal */}
          {activeTab === 'clearance3d' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
              <div className="flex flex-col items-center">
                <ThreeSecurityBadge status={mandate.status} />
                <div className="mt-2 text-center">
                  <span className="text-xs font-bold text-slate-800 block">
                    AP2 Cryptographic Token
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    WebGL Real-Time Shader Evaluation
                  </span>
                </div>
              </div>

              {/* Settlement Card */}
              <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">PayPal Gateway Clearance</span>
                  <span className="text-[10px] font-mono text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Live Settlement
                  </span>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed">
                  Authorize this AP2 transaction and transmit verified checkout units to the buyer agent.
                </div>

                {isSettled ? (
                  <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Settled via PayPal</span>
                    </div>
                    {mandate.checkout_url && (
                      <a
                        href={mandate.checkout_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        Receipt <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleExecutePayPal}
                    disabled={isSettling}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                  >
                    {isSettling ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Clearing Order...</span></>
                    ) : (
                      <><CreditCard className="w-3.5 h-3.5" /><span>Authorize & Accept Payment</span></>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Telemetry */}
          {activeTab === 'telemetry' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Risk Assessment Score</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    isHighRisk ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {mandate.risk_score}% {isHighRisk ? 'ELEVATED RISK' : 'PASS'}
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHighRisk ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(mandate.risk_score, 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">Performance Telemetry</span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Negotiation Turnaround</span>
                  <span className="font-mono font-bold text-slate-800">12.4 ms</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">AP2 Cart Construction</span>
                  <span className="font-mono font-bold text-slate-800">2.8 ms</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Audit Trail Integrity</span>
                  <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% SHA-256
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Status Pill */}
          <div className="p-2 px-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>A2A Gateway Live</span>
            </div>
            <span>AP2 Protocol v2.1</span>
          </div>
        </>
      )}
    </div>
  );
};
