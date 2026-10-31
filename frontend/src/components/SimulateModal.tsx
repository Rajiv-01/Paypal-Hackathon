import React, { useState } from 'react';
import { X, Play, Zap, Flame, Loader2 } from 'lucide-react';
import { SimulateRequest } from '../types';

interface SimulateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateSuccess?: () => void;
}

const PRESETS = [
  {
    title: 'Meta Muse (Standard A2A)',
    consumer_agent: 'Meta Muse',
    item: 'H100 GPU Cluster Blocks',
    quantity: 100,
    requested_price: 45,
    tag: 'Institutional'
  },
  {
    title: 'AutoGPT Fleet (High Volume)',
    consumer_agent: 'AutoGPT Fleet',
    item: 'Enterprise API Tokens (Tier-1)',
    quantity: 250,
    requested_price: 18,
    tag: 'Volume Deal'
  },
  {
    title: 'Synthetix Bot (High Risk > 50%)',
    consumer_agent: 'Synthetix Bot',
    item: 'Synthetic Financial Market Feeds',
    quantity: 60,
    requested_price: 70,
    tag: 'Hazard Alert'
  },
  {
    title: 'Claude BuyerBot (Cryptographic)',
    consumer_agent: 'Claude BuyerBot',
    item: 'Zero-Knowledge Security Relays',
    quantity: 30,
    requested_price: 110,
    tag: 'Enterprise'
  }
];

export const SimulateModal: React.FC<SimulateModalProps> = ({
  isOpen,
  onClose,
  onSimulateSuccess
}) => {
  const [consumerAgent, setConsumerAgent] = useState('Meta Muse');
  const [item, setItem] = useState('H100 GPU Cluster Blocks');
  const [quantity, setQuantity] = useState(100);
  const [requestedPrice, setRequestedPrice] = useState(45);
  const [loading, setLoading] = useState(false);
  const [burstLoading, setBurstLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (p: typeof PRESETS[0]) => {
    setConsumerAgent(p.consumer_agent);
    setItem(p.item);
    setQuantity(p.quantity);
    setRequestedPrice(p.requested_price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: SimulateRequest = {
      consumer_agent: consumerAgent,
      item,
      quantity: Number(quantity),
      requested_price: Number(requestedPrice)
    };

    try {
      const response = await fetch('/api/simulate-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Simulation failed: ${response.statusText}`);
      }

      onSimulateSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Simulation error');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerBurst = async () => {
    setBurstLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/simulate-burst', {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Burst simulation request failed');
      }
      onSimulateSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Burst simulation failed');
    } finally {
      setBurstLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight font-sans">
              Inbound Agent Simulator
            </h2>
            <p className="text-xs text-slate-500">
              Trigger autonomous LLM agent negotiation and stream to AG Grid
            </p>
          </div>
        </div>

        {/* Burst Stream Banner */}
        <div className="my-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              High-Frequency Burst: 4 Agents
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Tests AG Grid transaction batching & real-time cell flashing
            </span>
          </div>
          <button
            type="button"
            onClick={handleTriggerBurst}
            disabled={burstLoading}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 text-xs font-semibold text-white shadow-sm disabled:opacity-50 transition-all font-sans"
          >
            {burstLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Launch Burst'}
          </button>
        </div>

        {/* Quick Presets */}
        <div className="my-3">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Preset Agent Profiles
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                  consumerAgent === preset.consumer_agent
                    ? 'bg-blue-50/70 border-blue-400 text-slate-900 ring-1 ring-blue-400/30'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-semibold text-slate-900 mb-1 flex items-center justify-between">
                  <span>{preset.consumer_agent}</span>
                  {preset.tag.includes('Hazard') ? (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 font-mono font-medium">
                      High Risk
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono font-medium">
                      ${preset.requested_price}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 truncate">{preset.item}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Consumer Agent
              </label>
              <input
                type="text"
                value={consumerAgent}
                onChange={(e) => setConsumerAgent(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs text-slate-900 outline-none transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Catalog Contract
              </label>
              <input
                type="text"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs text-slate-900 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Volume Units
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs text-slate-900 outline-none transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Initial Bid ($)
              </label>
              <input
                type="number"
                min="1"
                value={requestedPrice}
                onChange={(e) => setRequestedPrice(Number(e.target.value))}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs text-slate-900 outline-none transition-all font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-white font-semibold shadow-sm disabled:opacity-50 transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{loading ? 'Negotiating...' : 'Transmit Single Deal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
