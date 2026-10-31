import React, { useCallback, useEffect, useRef, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { AgGridReact } from 'ag-grid-react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CartMandate, WebSocketMessage, A2ASession, SwarmStats } from './types';
import { Sidebar, BusinessView } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { ClearanceGrid } from './components/ClearanceGrid';
import { SimulateModal } from './components/SimulateModal';
import { InboundNotification } from './business/components/InboundNotification';
import { AgentSwarmDashboard } from './business/components/AgentSwarmDashboard';
import { LeadsView } from './business/components/LeadsView';
import { SettlementsView } from './business/components/SettlementsView';
import { InvoicesView } from './business/components/InvoicesView';

export const App: React.FC = () => {
  const [mandates,         setMandates]         = useState<CartMandate[]>([]);
  const [isSimulateOpen,   setIsSimulateOpen]   = useState(false);
  const [searchTerm,       setSearchTerm]       = useState('');
  const [activeView,       setActiveView]       = useState<BusinessView>('transactions');
  const [notifications,    setNotifications]    = useState<A2ASession[]>([]);
  const [,                 setSwarmStats]       = useState<SwarmStats | null>(null);
  const gridRef = useRef<AgGridReact<CartMandate>>(null);

  const { lastJsonMessage } = useWebSocket<WebSocketMessage>('ws://localhost:3001', {
    shouldReconnect: () => true,
    reconnectInterval: 2500,
    reconnectAttempts: 25,
  });

  // Fetch initial mandates on mount
  useEffect(() => {
    fetch('/api/mandates')
      .then((res) => res.json())
      .then((data: CartMandate[]) => { if (Array.isArray(data)) setMandates(data); })
      .catch(console.warn);
  }, []);

  // WebSocket message handler
  useEffect(() => {
    if (!lastJsonMessage) return;

    if (lastJsonMessage.type === 'NEW_MANDATE' && lastJsonMessage.payload) {
      const newMandate = lastJsonMessage.payload;
      setMandates((prev) => [newMandate, ...prev.filter((m) => m.mandate_id !== newMandate.mandate_id)]);
      if (gridRef.current?.api) {
        gridRef.current.api.applyTransaction({ add: [newMandate], addIndex: 0 });
        const node = gridRef.current.api.getRowNode(newMandate.mandate_id);
        if (node) gridRef.current.api.flashCells({ rowNodes: [node], flashDelay: 800 });
      }
    }

    if (lastJsonMessage.type === 'MANDATE_UPDATED' && lastJsonMessage.payload) {
      const { mandate_id, status, checkout_url } = lastJsonMessage.payload;
      setMandates((prev) => prev.map((m) =>
        m.mandate_id === mandate_id ? { ...m, status: status as any, checkout_url: checkout_url || m.checkout_url } : m
      ));
      if (gridRef.current?.api) {
        const rowNode = gridRef.current.api.getRowNode(mandate_id);
        if (rowNode?.data) {
          rowNode.setData({ ...rowNode.data, status: status as any, checkout_url: checkout_url || rowNode.data.checkout_url });
          gridRef.current.api.flashCells({ rowNodes: [rowNode], flashDelay: 800 });
        }
      }
    }

    if (lastJsonMessage.type === 'SESSION_STARTED') {
      setNotifications((prev) => [lastJsonMessage.payload, ...prev.slice(0, 4)]);
    }

    if (lastJsonMessage.type === 'SWARM_STATS_UPDATE') {
      setSwarmStats(lastJsonMessage.payload);
    }
  }, [lastJsonMessage]);

  const handleApproveSuccess = useCallback((mandateId: string, checkoutUrl: string) => {
    setMandates((prev) =>
      prev.map((m) => m.mandate_id === mandateId ? { ...m, status: 'SETTLED', checkout_url: checkoutUrl } : m)
    );
  }, []);

  const handleTriggerBurst = async () => {
    try { await fetch('/api/simulate-burst', { method: 'POST' }); } catch {}
  };

  const dismissNotification = (session_id: string) => {
    setNotifications((prev) => prev.filter((n) => n.session_id !== session_id));
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900 flex font-sans">
      {/* Left Sidebar Navigation (Compact w-52, Consolidated, All 5 Tabs) */}
      <Sidebar
        transactionCount={mandates.length}
        leadCount={3}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main Dashboard Surface */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="w-full px-4 py-2 sm:px-6 sm:py-2.5 space-y-2.5">
          {/* Back to landing link (Tight, minimal top space) */}
          <div className="flex items-center justify-between pb-0.5">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Platforms</span>
            </Link>
            <span className="text-[10px] font-mono text-slate-400">AP2 Gateway Terminal v2.4</span>
          </div>

          {/* Active View Router */}
          {(activeView === 'transactions' || activeView === 'overview' || activeView === 'clearance') && (
            <>
              <TopHeader
                mandates={mandates}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              <ClearanceGrid
                mandates={mandates}
                onApproveSuccess={handleApproveSuccess}
                gridRef={gridRef}
                searchTerm={searchTerm}
              />
            </>
          )}

          {activeView === 'swarm' && <AgentSwarmDashboard />}

          {activeView === 'leads' && <LeadsView />}

          {activeView === 'settlements' && <SettlementsView mandates={mandates} />}

          {activeView === 'invoices' && <InvoicesView mandates={mandates} />}

          {activeView === 'analytics' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white border border-slate-200">
                <h2 className="text-base font-bold text-slate-900">A2A Financial Analytics Studio</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time volume velocity, risk anomalies, and counterparty performance metrics.</p>
              </div>
              <TopHeader
                mandates={mandates}
                onOpenSimulate={() => setIsSimulateOpen(true)}
                onTriggerBurst={handleTriggerBurst}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>
          )}

          {activeView === 'integrations' && (
            <div className="space-y-4 max-w-4xl">
              <div className="p-4 rounded-lg bg-white border border-slate-200">
                <h2 className="text-base font-bold text-slate-900">Connected Gateways & Protocols</h2>
                <p className="text-xs text-slate-500 mt-0.5">Configure live payment processors, agent networks, and settlement relays.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">PayPal REST API</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Connected</span>
                  </div>
                  <p className="text-xs text-slate-500">Orders v2 automated checkout capture & instant clearinghouse settlement.</p>
                  <div className="text-[11px] font-mono text-slate-400 bg-slate-50 p-2 rounded border border-slate-200">
                    Mode: Sandbox v2 | Client: AbI2D_...3Ye
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">AP2 Settlement Protocol</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Verified</span>
                  </div>
                  <p className="text-xs text-slate-500">Agent-to-Agent cryptographic mandate signing and treasury validation.</p>
                  <div className="text-[11px] font-mono text-slate-400 bg-slate-50 p-2 rounded border border-slate-200">
                    SLA: 14.2ms | Max Breach: 0
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'settings' && (
            <div className="space-y-4 max-w-3xl">
              <div className="p-4 rounded-lg bg-white border border-slate-200">
                <h2 className="text-base font-bold text-slate-900">Autonomous Merchant Rules & Guardrails</h2>
                <p className="text-xs text-slate-500 mt-0.5">Define autonomous negotiation policies, risk score ceilings, and auto-settlement triggers.</p>
              </div>
              <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-800">Minimum Gross Margin Floor</span>
                    <p className="text-slate-400 text-[11px]">Reject or counter-offer any autonomous bid below this threshold.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-slate-100 font-mono font-bold text-slate-800">18.5%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-800">Human-in-the-Loop Risk Score Threshold</span>
                    <p className="text-slate-400 text-[11px]">Require merchant signoff if counterparty risk score exceeds.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold">&gt; 50%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="font-semibold text-slate-800">Instant PayPal Authorization</span>
                    <p className="text-slate-400 text-[11px]">Auto-generate PayPal checkout mandate upon deal agreement.</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">Enabled</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inbound Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {notifications.map((sess) => (
          <div key={sess.session_id} className="pointer-events-auto">
            <InboundNotification
              session={sess}
              onDismiss={() => dismissNotification(sess.session_id)}
            />
          </div>
        ))}
      </div>

      {/* Inbound Agent Simulator Modal */}
      <SimulateModal isOpen={isSimulateOpen} onClose={() => setIsSimulateOpen(false)} />
    </div>
  );
};

export default App;
