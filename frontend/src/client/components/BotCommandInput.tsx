import React, { useState } from 'react';
import { BotProfile } from '../../types';
import { Loader2, Rocket, AlertCircle, DollarSign, Sliders, Hash, ShieldCheck, Tag } from 'lucide-react';

interface BotCommandInputProps {
  selectedBot: BotProfile | null;
  onDeploy: (params: {
    bot_id: string;
    item: string;
    budget_cap: number;
    price_buffer_pct: number;
    quantity: number;
    requested_price: number;
    command: string;
  }) => Promise<void>;
}

const QUICK_ITEMS = [
  { label: 'H100 GPU Clusters',     value: 'H100 GPU Cluster Blocks',          price: 50,  qty: 100 },
  { label: 'Enterprise API Tokens', value: 'Enterprise API Tokens (Tier-1)',    price: 22,  qty: 250 },
  { label: 'ZK Crypto Keys',        value: 'Zero-Knowledge Cryptographic Keys', price: 120, qty: 30  },
  { label: 'Neural Clusters',       value: 'Neural Inference Clusters',         price: 220, qty: 20  },
  { label: 'Market Feeds',          value: 'Synthetic Financial Market Feeds',  price: 85,  qty: 60  },
  { label: 'Mesh Relays',           value: 'Zero-Trust Mesh Relays',            price: 40,  qty: 150 },
];

export const BotCommandInput: React.FC<BotCommandInputProps> = ({ selectedBot, onDeploy }) => {
  const [command,      setCommand]      = useState('Procure compute blocks within our approved pricing envelope.');
  const [item,         setItem]         = useState('H100 GPU Cluster Blocks');
  const [budgetCap,    setBudgetCap]    = useState(6000);
  const [priceBuffer,  setPriceBuffer]  = useState(15);
  const [quantity,     setQuantity]     = useState(100);
  const [reqPrice,     setReqPrice]     = useState(50);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const maxPerUnit    = reqPrice * (1 + priceBuffer / 100);
  const totalAtMax    = maxPerUnit * quantity;
  const overBudget    = totalAtMax > budgetCap;

  const handleQuickFill = (qi: typeof QUICK_ITEMS[0]) => {
    setItem(qi.value);
    setReqPrice(qi.price);
    setQuantity(qi.qty);
    setBudgetCap(Math.ceil(qi.price * qi.qty * 1.25));
    setCommand(`Procure ${qi.qty} units of ${qi.value} with up to ${priceBuffer}% negotiation buffer.`);
  };

  const handleDeploy = async () => {
    if (!selectedBot) { setError('Please select an agent from the roster first.'); return; }
    if (!item.trim())  { setError('Please specify an item to buy.');    return; }
    if (overBudget)    { setError('Total exposure at maximum buffer exceeds your budget cap. Increase budget or reduce buffer.'); return; }
    setError(null);
    setLoading(true);
    try {
      await onDeploy({
        bot_id:           selectedBot.bot_id,
        item:             item.trim(),
        budget_cap:       budgetCap,
        price_buffer_pct: priceBuffer,
        quantity,
        requested_price:  reqPrice,
        command:          command || `Buy ${quantity} units of ${item}.`,
      });
    } catch {
      setError('Failed to deploy agent. Verify connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white">
            <Rocket className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            2. Configure Procurement Instructions & Budget
          </span>
        </div>

        {selectedBot && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Active Bot:</span>
            <span className="font-bold text-slate-900">{selectedBot.name}</span>
            <span className="px-2 py-0.2 rounded-md bg-blue-50 text-blue-700 font-mono text-[10px] font-semibold border border-blue-200">
              {selectedBot.strategy}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Product Chips */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Quick Fill Catalog Preset</span>
            <span className="text-[10px] text-slate-400">Click to autofill procurement params</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ITEMS.map((qi) => {
              const active = item === qi.value;
              return (
                <button
                  key={qi.value}
                  type="button"
                  onClick={() => handleQuickFill(qi)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {qi.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Prompt Instructions */}
        <div>
          <label className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
            Prompt / Shopping Mandate
          </label>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Tell your bot what to buy and constraints to follow..."
            className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 shadow-xs"
          />
        </div>

        {/* 4 Financial & Quantity Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Target Product */}
          <div>
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              Line Item
            </label>
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium text-slate-900 shadow-xs"
            />
          </div>

          {/* Spend Amount / Budget Cap */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Spend Cap ($)
              </label>
              <span className="text-[10px] text-slate-400">Hard limit</span>
            </div>
            <div className="relative">
              <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                value={budgetCap}
                onChange={(e) => setBudgetCap(Math.max(10, Number(e.target.value)))}
                className="w-full pl-7 pr-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold text-slate-900 shadow-xs"
              />
            </div>
          </div>

          {/* Buffer % */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Buffer Tolerance
              </label>
              <span className="text-[10px] font-mono font-bold text-blue-600">+{priceBuffer}%</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={priceBuffer}
                onChange={(e) => setPriceBuffer(Number(e.target.value))}
                className="flex-1 accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <span className="w-12 text-center text-xs font-mono font-semibold py-1 px-1.5 rounded-md border border-slate-200 bg-slate-50">
                {priceBuffer}%
              </span>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Quantity (Units)
              </label>
              <span className="text-[10px] text-slate-400">@ ${reqPrice}/unit</span>
            </div>
            <input
              type="number"
              min="1"
              max="5000"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-semibold text-slate-900 shadow-xs"
            />
          </div>
        </div>

        {/* Calculated Exposure Summary Bar */}
        <div className={`p-3 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
          overBudget
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Bid: <strong>${reqPrice.toFixed(2)}/unit</strong></span>
            <span>Max Authorized: <strong>${maxPerUnit.toFixed(2)}/unit</strong></span>
            <span>Max Exposure: <strong>${totalAtMax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
            <span>Budget Cap: <strong>${budgetCap.toLocaleString()}</strong></span>
          </div>

          {overBudget ? (
            <span className="text-rose-600 font-semibold flex items-center gap-1 shrink-0">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Exposure exceeds budget cap</span>
            </span>
          ) : (
            <span className="text-emerald-700 font-medium flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Within authorized treasury envelope</span>
            </span>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Deploy Action */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400">
            Deploying dispatches your autonomous agent to establish an A2A WebSocket handshake with the merchant.
          </span>
          <button
            type="button"
            onClick={handleDeploy}
            disabled={loading || overBudget}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Deploying Agent...</span></>
            ) : (
              <><Rocket className="w-4 h-4" /><span>Deploy Shopping Bot</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
