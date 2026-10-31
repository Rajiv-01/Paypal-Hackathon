import React from 'react';
import { BotProfile, BotStrategy } from '../../types';
import { Bot, Zap, TrendingUp, Shield, Flame, CheckCircle2 } from 'lucide-react';

interface BotRosterProps {
  bots: BotProfile[];
  selectedBot: BotProfile | null;
  onSelect: (bot: BotProfile) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Bot:        Bot,
  Zap:        Zap,
  PiggyBank:  Bot,
  TrendingUp: TrendingUp,
  Shield:     Shield,
  Flame:      Flame,
};

const STRATEGY_STYLES: Record<BotStrategy, { badge: string; dot: string }> = {
  AGGRESSIVE:   { badge: 'bg-rose-50 text-rose-700 border-rose-200',       dot: 'bg-rose-500' },
  BALANCED:     { badge: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  CONSERVATIVE: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
};

const ICON_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-200' },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-200' },
  cyan:    { bg: 'bg-cyan-50',    text: 'text-cyan-600',    border: 'border-cyan-200' },
};

export const BotRoster: React.FC<BotRosterProps> = ({ bots, selectedBot, onSelect }) => {
  if (bots.length === 0) {
    return (
      <div className="h-32 rounded-lg border border-slate-200 bg-white flex items-center justify-center">
        <div className="text-slate-400 text-xs font-mono animate-pulse">Loading shopping bot roster...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">1. Select Shopping Agent</span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {bots.length} BOTS AVAILABLE
          </span>
        </div>
        <span className="text-[11px] text-slate-400">Click a bot to configure spend mandate</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {bots.map((bot) => {
          const isSelected = selectedBot?.bot_id === bot.bot_id;
          const IconComp   = ICON_MAP[bot.avatar_icon] || Bot;
          const strategy   = STRATEGY_STYLES[bot.strategy];
          const colorCfg   = ICON_COLORS[bot.color] || ICON_COLORS.blue;

          return (
            <button
              key={bot.bot_id}
              type="button"
              onClick={() => onSelect(bot)}
              className={`relative p-3 rounded-lg border text-left transition-all duration-150 ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              )}

              {/* Icon & Strategy */}
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center border ${colorCfg.bg} ${colorCfg.border} ${colorCfg.text}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${strategy.badge}`}>
                  <span className={`w-1 h-1 rounded-full ${strategy.dot}`} />
                  {bot.strategy}
                </span>
              </div>

              {/* Bot Name & Specialty */}
              <div className="text-xs font-bold text-slate-900 leading-snug truncate">{bot.name}</div>
              <div className="text-[10px] text-slate-500 truncate mb-2">{bot.specialty}</div>

              {/* Metrics */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-1 text-[10px]">
                <div>
                  <span className="text-slate-400 block font-mono text-[9px]">WIN RATE</span>
                  <span className="font-bold text-slate-800">{bot.success_rate}%</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-mono text-[9px]">DEALS</span>
                  <span className="font-mono font-semibold text-slate-700">{bot.deals_closed}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
