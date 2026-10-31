import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { CartMandate } from '../types';

const STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  NEGOTIATING:      { label: 'Negotiating',     className: 'text-blue-700 bg-blue-50 border-blue-200',     dot: 'bg-blue-500 animate-pulse' },
  PENDING_APPROVAL: { label: 'Pending Approval', className: 'text-amber-700 bg-amber-50 border-amber-200',   dot: 'bg-amber-500' },
  PAYMENT_PENDING:  { label: 'Payment Pending',  className: 'text-cyan-700 bg-cyan-50 border-cyan-200',      dot: 'bg-cyan-500 animate-pulse' },
  AWAITING_PAYMENT: { label: 'Awaiting Payment', className: 'text-cyan-700 bg-cyan-50 border-cyan-200',      dot: 'bg-cyan-500 animate-pulse' },
  SETTLED:          { label: 'Settled',          className: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  REJECTED:         { label: 'Rejected',         className: 'text-rose-700 bg-rose-50 border-rose-200',     dot: 'bg-rose-500' },
};

export const StatusCellRenderer: React.FC<ICellRendererParams<CartMandate>> = (params) => {
  const status = params.value as string;
  const config = STATUS_CONFIG[status] || { label: status, className: 'text-slate-600 bg-slate-50 border-slate-200', dot: 'bg-slate-400' };

  return (
    <div className="flex items-center h-full">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${config.className}`}>
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
        {config.label}
      </span>
    </div>
  );
};
