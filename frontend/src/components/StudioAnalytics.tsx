import React, { useMemo, useState } from 'react';
import { AgStudio } from 'ag-studio-react';
import type { AgDataSourcesDefinition } from 'ag-studio';
import { CartMandate } from '../types';
import { Edit3, Eye, BarChart3 } from 'lucide-react';

interface StudioAnalyticsProps {
  mandates: CartMandate[];
}

export const StudioAnalytics: React.FC<StudioAnalyticsProps> = ({ mandates }) => {
  const [mode, setMode] = useState<'view' | 'edit'>('edit');

  // Convert mandates into clean tabular data for AG Studio
  const studioData = useMemo(() => {
    return mandates.map((m) => ({
      mandate_id: m.mandate_id,
      consumer_agent: m.consumer_agent,
      item: m.item,
      agreed_price: m.agreed_price,
      quantity: m.quantity,
      total_value: m.total_value,
      risk_score: m.risk_score,
      status: m.status
    }));
  }, [mandates]);

  const studioSources = useMemo<AgDataSourcesDefinition>(() => {
    return {
      sources: [
        {
          id: 'mandates',
          name: 'A2A Clearance Mandates',
          data: studioData,
          fields: [
            { id: 'mandate_id', name: 'Mandate ID', format: 'textFormat' },
            { id: 'consumer_agent', name: 'Consumer Agent', format: 'textFormat' },
            { id: 'item', name: 'Contract Item', format: 'textFormat' },
            { id: 'agreed_price', name: 'Agreed Price', format: 'currencyFormat' },
            { id: 'quantity', name: 'Quantity', format: 'integerFormat' },
            { id: 'total_value', name: 'Total Valuation', format: 'currencyFormat' },
            { id: 'risk_score', name: 'Risk Score', format: 'integerFormat' },
            { id: 'status', name: 'Clearance Status', format: 'textFormat' }
          ]
        }
      ]
    };
  }, [studioData]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Studio Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-950/80 border border-purple-500/30 text-purple-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <span>AG Studio BI Intelligence</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 font-sans">
                Embedded Analytics Engine
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive dashboard & multi-dimensional reporting across settled A2A mandates
            </p>
          </div>
        </div>

        {/* Mode switcher: View vs Edit */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setMode('view')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all ${
                mode === 'view'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Executive View</span>
            </button>
            <button
              onClick={() => setMode('edit')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all ${
                mode === 'edit'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Studio Builder</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sized container for AG Studio */}
      <div className="w-full h-[580px] rounded-xl overflow-hidden border border-purple-900/30 bg-[#0a0d14] shadow-2xl relative">
        <AgStudio
          data={studioSources}
          mode={mode}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};
