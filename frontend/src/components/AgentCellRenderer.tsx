import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { CartMandate } from '../types';


export const AgentCellRenderer: React.FC<ICellRendererParams<CartMandate>> = (params) => {
  const agentName = params.value || 'Autonomous Agent';

  const getAgentVisuals = (name: string) => {
    if (name.includes('Meta Muse')) {
      return {
        bg: 'bg-blue-600',
        textColor: 'text-white',
        letter: 'M',
        sub: 'Meta Muse AI',
        badge: 'Verified Peer'
      };
    }
    if (name.includes('AutoGPT')) {
      return {
        bg: 'bg-slate-900',
        textColor: 'text-white',
        letter: 'A',
        sub: 'AutoGPT Fleet',
        badge: 'Enterprise'
      };
    }
    if (name.includes('Synthetix')) {
      return {
        bg: 'bg-rose-600',
        textColor: 'text-white',
        letter: 'S',
        sub: 'Synthetix Bot',
        badge: 'Untrusted Net'
      };
    }
    return {
      bg: 'bg-purple-600',
      textColor: 'text-white',
      letter: 'C',
      sub: 'Claude Buyer',
      badge: 'AP2 Agent'
    };
  };

  const visuals = getAgentVisuals(agentName);

  return (
    <div className="flex items-center gap-2.5 h-full">
      <div
        className={`w-7 h-7 rounded-full ${visuals.bg} ${visuals.textColor} font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}
      >
        {visuals.letter}
      </div>
      <div className="flex flex-col leading-tight truncate">
        <span className="font-semibold text-xs text-slate-900 truncate">
          {agentName}
        </span>
        <span className="text-[11px] text-slate-400 truncate">
          {visuals.sub}
        </span>
      </div>
    </div>
  );
};
