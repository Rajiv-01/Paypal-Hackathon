import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { CartMandate } from '../types';

export const RiskCellRenderer: React.FC<ICellRendererParams<CartMandate>> = (params) => {
  const score = Number(params.value) || 0;
  const isHighRisk = score > 50;

  return (
    <div className="flex items-center gap-2 h-full">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          isHighRisk
            ? 'bg-rose-50 text-rose-700 border-rose-200 font-semibold animate-pulse'
            : 'bg-slate-100 text-slate-700 border-slate-200'
        }`}
      >
        {isHighRisk ? (
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
        ) : (
          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
        )}
        <span>{score}%</span>
      </span>
      {isHighRisk && (
        <span className="text-[10px] uppercase font-bold text-rose-600">
          High
        </span>
      )}
    </div>
  );
};
