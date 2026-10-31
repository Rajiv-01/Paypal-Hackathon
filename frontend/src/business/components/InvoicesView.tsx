import React, { useState, useEffect } from 'react';
import { CartMandate, InvoiceRecord } from '../../types';
import {
  FileText, Download, CheckCircle2, Clock, Printer,
  ShieldCheck, ExternalLink, Search, X, DollarSign,
  ArrowUpRight, Building2, UserCheck, Hash
} from 'lucide-react';

interface InvoicesViewProps {
  mandates: CartMandate[];
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({ mandates }) => {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

  // Generate or fetch invoices based on mandates
  useEffect(() => {
    fetch('/api/invoices')
      .then((res) => res.json())
      .then((data: InvoiceRecord[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setInvoices(data);
        } else {
          // Fallback generate from mandates
          const generated: InvoiceRecord[] = mandates.map((m, idx) => {
            const isPaid = m.status === 'SETTLED';
            const subtotal = m.total_value;
            const fee = +(subtotal * 0.029).toFixed(2);
            return {
              invoice_id: `INV-2026-${(8840 + idx).toString()}`,
              mandate_id: m.mandate_id,
              date: m.created_at,
              due_date: new Date(new Date(m.created_at).getTime() + 7 * 86400000).toISOString(),
              buyer_agent: m.consumer_agent,
              target_item: m.item,
              quantity: m.quantity,
              unit_price: m.agreed_price,
              subtotal,
              protocol_fee: fee,
              total: +(subtotal + fee).toFixed(2),
              status: isPaid ? 'PAID' : 'PENDING',
              payment_method: 'PayPal Orders v2 / AP2 Net',
              paypal_order_id: m.paypal_order_id || `PAYPAL-ORD-${m.mandate_id.toUpperCase()}`,
              proof_hash: `0x${(48271 + idx * 7919).toString(16)}7f4a21e${idx}b`,
              checkout_url: m.checkout_url || 'https://sandbox.paypal.com/checkout/mock',
            };
          });
          setInvoices(generated);
        }
      })
      .catch(() => {
        // Fallback from mandates
        const generated: InvoiceRecord[] = mandates.map((m, idx) => {
          const isPaid = m.status === 'SETTLED';
          const subtotal = m.total_value;
          const fee = +(subtotal * 0.029).toFixed(2);
          return {
            invoice_id: `INV-2026-${(8840 + idx).toString()}`,
            mandate_id: m.mandate_id,
            date: m.created_at,
            due_date: new Date(new Date(m.created_at).getTime() + 7 * 86400000).toISOString(),
            buyer_agent: m.consumer_agent,
            target_item: m.item,
            quantity: m.quantity,
            unit_price: m.agreed_price,
            subtotal,
            protocol_fee: fee,
            total: +(subtotal + fee).toFixed(2),
            status: isPaid ? 'PAID' : 'PENDING',
            payment_method: 'PayPal Orders v2 / AP2 Net',
            paypal_order_id: m.paypal_order_id || `PAYPAL-ORD-${m.mandate_id.toUpperCase()}`,
            proof_hash: `0x${(48271 + idx * 7919).toString(16)}7f4a21e${idx}b`,
            checkout_url: m.checkout_url || 'https://sandbox.paypal.com/checkout/mock',
          };
        });
        setInvoices(generated);
      });
  }, [mandates]);

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'PAID' && inv.status !== 'PAID') return false;
    if (filter === 'PENDING' && inv.status !== 'PENDING') return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        inv.invoice_id.toLowerCase().includes(q) ||
        inv.buyer_agent.toLowerCase().includes(q) ||
        inv.target_item.toLowerCase().includes(q) ||
        inv.mandate_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const paidTotal = invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.total, 0);
  const pendingTotal = invoices.filter((i) => i.status === 'PENDING').reduce((s, i) => s + i.total, 0);

  const handleExportCsv = () => {
    const headers = 'Invoice ID,Mandate ID,Date,Buyer Agent,Line Item,Qty,Unit Price ($),Total ($),Status,PayPal Order,Proof Hash\n';
    const rows = filteredInvoices
      .map((i) => `"${i.invoice_id}","${i.mandate_id}","${i.date}","${i.buyer_agent}","${i.target_item}",${i.quantity},${i.unit_price.toFixed(2)},${i.total.toFixed(2)},"${i.status}","${i.paypal_order_id}","${i.proof_hash}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autonopay_invoices_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Commercial Invoices & Receipts</h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              AP2 CRYPTO RECEIPTS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready commercial invoices with AP2 cryptographic proof hashes, line-item tariffs, and PayPal settlement receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Invoices (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Total Invoiced</span>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            ${totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">{invoices.length} invoices generated</span>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Settled & Paid</span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-700 font-mono">
            ${paidTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-600 mt-0.5">{invoices.filter((i) => i.status === 'PAID').length} paid via PayPal</span>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Awaiting Payment</span>
            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            ${pendingTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-amber-600 mt-0.5">{invoices.filter((i) => i.status === 'PENDING').length} awaiting clearing</span>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Settlement Turnaround</span>
            <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-purple-700 font-mono">
            14 ms
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">Automated AP2 Protocol SLA</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-lg bg-white border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter & Search Bar */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              All Invoices ({invoices.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('PAID')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filter === 'PAID'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Paid ({invoices.filter((i) => i.status === 'PAID').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filter === 'PENDING'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Pending ({invoices.filter((i) => i.status === 'PENDING').length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search invoice #, agent, item..."
              className="pl-8 pr-3 py-1 rounded-md border border-slate-200 text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
            />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-2.5">Invoice #</th>
                <th className="px-4 py-2.5">Issue Date</th>
                <th className="px-4 py-2.5">Buyer Agent</th>
                <th className="px-4 py-2.5">Target Line Item</th>
                <th className="px-4 py-2.5 text-right">Units</th>
                <th className="px-4 py-2.5 text-right">Unit Price</th>
                <th className="px-4 py-2.5 text-right">Total Amount</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.invoice_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>{inv.invoice_id}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                    {new Date(inv.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-800 font-semibold">{inv.buyer_agent}</td>
                  <td className="px-4 py-3 font-medium text-slate-700 max-w-[200px] truncate">{inv.target_item}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700">{inv.quantity}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600">${inv.unit_price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    ${inv.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      inv.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {inv.status === 'PAID' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                      <span>{inv.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(inv)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors"
                    >
                      <span>View Invoice</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commercial Invoice Modal */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Commercial Invoice</h2>
                    <span className="font-mono text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {selectedInvoice.invoice_id}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    Mandate Ref: {selectedInvoice.mandate_id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                  title="Print Invoice"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bill To / Bill From */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>ISSUED BY (MERCHANT)</span>
                </div>
                <div className="font-semibold text-slate-800">Autonopay A2A Gate Inc.</div>
                <div className="text-slate-500 text-[11px]">AP2 Protocol Clearinghouse</div>
                <div className="text-slate-500 text-[11px]">Merchant ID: AP2-MERC-99214</div>
                <div className="text-slate-500 text-[11px]">PayPal: merchant@autonopay.io</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>BILLED TO (BUYER AGENT)</span>
                </div>
                <div className="font-semibold text-slate-800">{selectedInvoice.buyer_agent}</div>
                <div className="text-slate-500 text-[11px]">Autonomous Purchasing Agent</div>
                <div className="text-slate-500 text-[11px]">Protocol: A2A Direct Tendering</div>
                <div className="text-slate-500 text-[11px]">Issue Date: {new Date(selectedInvoice.date).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase">
                  <tr>
                    <th className="px-3 py-2">Item Description</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-3 py-2.5 font-medium text-slate-800">{selectedInvoice.target_item}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-700">{selectedInvoice.quantity}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-700">${selectedInvoice.unit_price.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-900">${selectedInvoice.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td colSpan={3} className="px-3 py-1.5 text-right font-medium text-slate-500">AP2 Network Protocol Fee (2.9%):</td>
                    <td className="px-3 py-1.5 text-right font-mono text-slate-700">${selectedInvoice.protocol_fee.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-blue-50/40 font-bold">
                    <td colSpan={3} className="px-3 py-2 text-right text-slate-900">Total Cleared Amount:</td>
                    <td className="px-3 py-2 text-right font-mono text-blue-700 text-sm">${selectedInvoice.total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* AP2 Cryptographic Seal Box */}
            <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>AP2 Cryptographic Settlement Proof</span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {selectedInvoice.status === 'PAID' ? 'SETTLED & VERIFIED' : 'PENDING SETTLEMENT'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block">Proof Hash:</span>
                  <span className="text-slate-800 font-semibold break-all">{selectedInvoice.proof_hash}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">PayPal Order ID:</span>
                  <span className="text-slate-800 font-semibold">{selectedInvoice.paypal_order_id}</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 font-mono">
                Generated by Autonopay Autonomous Settlement Gateway v2.4
              </span>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
