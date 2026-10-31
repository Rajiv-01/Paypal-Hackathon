import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { CartMandate } from '../types';

export const ImpactCellRenderer: React.FC<ICellRendererParams<CartMandate>> = (params) => {
  const mandate = params.data;
  if (!mandate) return null;

  const isHighRisk = (mandate.risk_score || 0) > 50;
  const isSettled = mandate.status === 'SETTLED';

  // 4 signal bars representing SLA / network throughput
  const bars = isHighRisk
    ? [true, true, false, false]
    : isSettled
    ? [true, true, true, true]
    : [true, true, true, false];

  const color = isHighRisk ? 'bg-rose-500' : isSettled ? 'bg-emerald-500' : 'bg-blue-500';
  const inactiveColor = 'bg-slate-200';

  return (
    <div className="flex items-end gap-1 h-full py-3.5" title={`Network SLA Signal: ${isHighRisk ? 'Degraded' : 'Optimal'}`}>
      <div className={`w-1 h-2 rounded-xs ${bars[0] ? color : inactiveColor}`} />
      <div className={`w-1 h-3 rounded-xs ${bars[1] ? color : inactiveColor}`} />
      <div className={`w-1 h-4 rounded-xs ${bars[2] ? color : inactiveColor}`} />
      <div className={`w-1 h-5 rounded-xs ${bars[3] ? color : inactiveColor}`} />
    </div>
  );
};
