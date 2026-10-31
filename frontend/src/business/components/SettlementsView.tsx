import React, { useState } from 'react';
import { CartMandate } from '../../types';
import {
  DollarSign, CheckCircle2, Clock, Download, ExternalLink,
  ShieldCheck, RefreshCw, Filter, CreditCard, ArrowUpRight, Zap
} from 'lucide-react';

interface SettlementsViewProps {
  mandates: CartMandate[];
}

export const SettlementsView: React.FC<SettlementsViewProps> = ({ mandates }) => {
  const [filter, setFilter] = useState<'ALL' | 'SETTLED' | 'IN_TRANSIT'>('ALL');

  // Filter settled mandates or create simulated settlement records from mandates
  const settledMandates = mandates.filter((m) => m.status === 'SETTLED');
  const allRecords = mandates.map((m, idx) => {
    const isSettled = m.status === 'SETTLED';
    const gross = m.total_value;
    const fee = gross * 0.029 + 0.30;
    const net = gross - fee;
    const settlementId = `STL-2026-${(1000 + idx).toString()}`;
    const paypalOrderId = m.paypal_order_id || `PAYPAL-ORD-${m.mandate_id.toUpperCase()}`;

    return {
      settlementId,
      mandateId: m.mandate_id,
      item: m.item,
      agent: m.consumer_agent,
      date: m.created_at,
      gross,
      fee,
      net,
      status: isSettled ? 'CLEARED' : 'PENDING_AUTHORIZATION',
      paypalOrderId,
      checkoutUrl: m.checkout_url || 'https://sandbox.paypal.com/checkout/mock',
      region: m.region || 'US-WEST',
    };
  });

  const displayed = allRecords.filter((r) => {
    if (filter === 'SETTLED') return r.status === 'CLEARED';
    if (filter === 'IN_TRANSIT') return r.status !== 'CLEARED';
    return true;
  });

  const totalGross = allRecords.filter((r) => r.status === 'CLEARED').reduce((sum, r) => sum + r.gross, 0);
  const totalFees = allRecords.filter((r) => r.status === 'CLEARED').reduce((sum, r) => sum + r.fee, 0);
  const totalNet = totalGross - totalFees;

  const handleExportCsv = () => {
    const headers = 'Settlement ID,Mandate ID,Item,Buyer Agent,Date,Gross ($),Fee ($),Net ($),Status,PayPal Order\n';
    const rows = displayed
      .map((r) => `"${r.settlementId}","${r.mandateId}","${r.item}","${r.agent}","${r.date}",${r.gross.toFixed(2)},${r.fee.toFixed(2)},${r.net.toFixed(2)},"${r.status}","${r.paypalOrderId}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autonopay_settlements_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Settlements & PayPal Clearinghouse</h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              PAYPAL DIRECT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time reconciliation of autonomous A2A payouts, processing deductions, and net treasury settlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Statement (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Gross Settled</span>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            ${totalGross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">{settledMandates.length} settled mandates</span>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Net Payout</span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-700 font-mono">
            ${totalNet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-600 mt-0.5">Credited to PayPal Merchant</span>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Processing Fees</span>
            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            ${totalFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">2.9% + $0.30 per A2A unit</span>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">SLA Settlement</span>
            <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-purple-700 font-mono">
            Instant
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">AP2 Automated Execution</span>
        </div>
      </div>

      {/* Settlements Table Card */}
      <div className="rounded-lg bg-white border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Settlements ({allRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('SETTLED')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filter === 'SETTLED'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Cleared ({allRecords.filter((r) => r.status === 'CLEARED').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('IN_TRANSIT')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filter === 'IN_TRANSIT'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Pending ({allRecords.filter((r) => r.status !== 'CLEARED').length})
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-500">
            Reconciled with PayPal Sandbox Orders API v2
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-2.5">Settlement ID</th>
                <th className="px-4 py-2.5">Mandate Ref</th>
                <th className="px-4 py-2.5">Target Line Item</th>
                <th className="px-4 py-2.5">Buyer Agent</th>
                <th className="px-4 py-2.5">Region</th>
                <th className="px-4 py-2.5 text-right">Gross</th>
                <th className="px-4 py-2.5 text-right">Fee (2.9%)</th>
                <th className="px-4 py-2.5 text-right">Net Payout</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">PayPal Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayed.map((r) => (
                <tr key={r.settlementId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{r.settlementId}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{r.mandateId}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-[180px] truncate">{r.item}</td>
                  <td className="px-4 py-3 text-slate-700">{r.agent}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px]">
                      {r.region}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-800">
                    ${r.gross.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-400">
                    -${r.fee.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                    ${r.net.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      r.status === 'CLEARED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {r.status === 'CLEARED' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                      <span>{r.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={r.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-mono font-medium hover:underline"
                    >
                      <span>{r.paypalOrderId.slice(0, 16)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
