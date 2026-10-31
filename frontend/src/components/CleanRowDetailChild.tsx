import React from 'react';
import { IDetailCellRendererParams } from 'ag-grid-community';
import { CartMandate } from '../types';
import {
  FileText, ShieldCheck, MapPin, CheckCircle2,
  DollarSign, Clock, Layers, ArrowUpRight, Cpu
} from 'lucide-react';

export const CleanRowDetailChild: React.FC<IDetailCellRendererParams<CartMandate>> = (params) => {
  const mandate = params.data;
  if (!mandate) return null;

  const isSettled = mandate.status === 'SETTLED';
  const isHighRisk = (mandate.risk_score || 0) > 50;

  const subtotal = mandate.total_value;
  const fee = +(subtotal * 0.029).toFixed(2);
  const net = +(subtotal - fee).toFixed(2);

  return (
    <div className="bg-slate-50/90 border-y border-slate-200 border-l-4 border-l-blue-600 p-4 font-sans text-xs text-slate-800 space-y-3 shadow-inner">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-900 tracking-tight">Full Mandate Line-Item Specifications &amp; Tariff Audit</span>
          <span className="font-mono text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {mandate.mandate_id}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
          <span>Counterparty: <strong className="text-slate-800 font-semibold">{mandate.consumer_agent}</strong></span>
          <span>•</span>
          <span className={isSettled ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
            Status: {isSettled ? 'SETTLED' : 'PENDING APPROVAL'}
          </span>
        </div>
      </div>

      {/* Grid of 3 Clean Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: SKU & Quantity Breakdown */}
        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
            Line Item Details
          </span>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Item Name:</span>
              <span className="font-semibold text-slate-900 truncate max-w-[150px]">{mandate.item}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Authorized Quantity:</span>
              <span className="font-mono font-semibold text-slate-900">{mandate.quantity} units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Agreed Unit Price:</span>
              <span className="font-mono font-semibold text-slate-900">${mandate.agreed_price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category Classification:</span>
              <span className="font-medium text-blue-700">Compute / AI Cloud</span>
            </div>
          </div>
        </div>

        {/* Card 2: Financial Settlement Ledger */}
        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
            Clearinghouse Tariff
          </span>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Gross Subtotal:</span>
              <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">AP2 Protocol Fee (2.9%):</span>
              <span className="text-slate-500">-${fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-100 font-bold">
              <span className="text-slate-800 font-sans">Net Merchant Settlement:</span>
              <span className="text-emerald-700">${net.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Clearing Latency:</span>
              <span className="text-purple-700">14 ms SLA</span>
            </div>
          </div>
        </div>

        {/* Card 3: Counterparty Policy & Delivery Node */}
        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
            Autonomous Policy &amp; Origin
          </span>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Buyer Budget Cap:</span>
              <span className="font-mono font-semibold text-slate-900">
                ${(mandate.budget_cap || mandate.total_value * 1.15).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Delivery Node:</span>
              <span className="font-medium text-slate-800 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span>{mandate.city || 'San Francisco'}, {mandate.region || 'US-WEST'}</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Risk Assessment:</span>
              <span className={`font-mono font-bold ${isHighRisk ? 'text-rose-600' : 'text-emerald-600'}`}>
                {mandate.risk_score}% ({isHighRisk ? 'High Variance' : 'Cleared'})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Proof Hash:</span>
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                0x{mandate.mandate_id.replace(/\D/g, '') || '8841'}7f4a21e09
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
