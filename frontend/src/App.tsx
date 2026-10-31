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
  const [activeView,       setActiveView]       = useState<BusinessView>('clearance');
  const [notifications,    setNotifications]    = useState<A2ASession[]>([]);
  const [swarmStats,       setSwarmStats]       = useState<SwarmStats | null>(null);
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
          rowNode.setData({ ...rowNode.data, status, checkout_url: checkout_url || rowNode.data.checkout_url });
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
        <div className="w-full px-5 py-6 sm:px-7 sm:py-8 space-y-6">
          {/* Back to landing link */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Platforms</span>
            </Link>
          </div>

          {/* Active View Router */}
          {activeView === 'clearance' && (
            <>
              <TopHeader
                mandates={mandates}
                onOpenSimulate={() => setIsSimulateOpen(true)}
                onTriggerBurst={handleTriggerBurst}
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
