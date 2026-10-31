import React, { useCallback, useMemo, useState } from 'react';
import 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  RowClickedEvent,
  FirstDataRenderedEvent
} from 'ag-grid-community';
import { CartMandate } from '../types';
import { AgentCellRenderer } from './AgentCellRenderer';
import { StatusCellRenderer } from './StatusCellRenderer';
import { ActionCellRenderer } from './ActionCellRenderer';
import { ThreeTokenCellRenderer } from './ThreeTokenCellRenderer';
import { RegionCellRenderer } from './RegionCellRenderer';
import { RichExpandedDetailPanel } from './RichExpandedDetailPanel';
import { ProductDetailPanel } from '../business/components/ProductDetailPanel';
import {
  Download,
  Shield,
  LayoutList,
  LayoutGrid,
  Filter,
  Check,
  MoreHorizontal
} from 'lucide-react';

interface ClearanceGridProps {
  mandates: CartMandate[];
  onApproveSuccess?: (mandateId: string, checkoutUrl: string) => void;
  gridRef: React.RefObject<AgGridReact<CartMandate>>;
  searchTerm: string;
}

export const ClearanceGrid: React.FC<ClearanceGridProps> = ({
  mandates,
  onApproveSuccess,
  gridRef,
  searchTerm
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'PENDING' | 'SETTLED' | 'HIGH_RISK'>('ALL');
  const [rowDensity, setRowDensity] = useState<'compact' | 'normal' | 'comfortable'>('normal');
  const [selectedProductForAnalytics, setSelectedProductForAnalytics] = useState<string | null>(null);

  const rowHeight = useMemo(() => {
    switch (rowDensity) {
      case 'compact':
        return 46;
      case 'comfortable':
        return 62;
      case 'normal':
      default:
        return 54;
    }
  }, [rowDensity]);

  // Filtered mandates based on active filter pill and search
  const displayedMandates = useMemo(() => {
    let list = mandates;
    if (filterType === 'PENDING') {
      list = list.filter((m) => m.status === 'PENDING_APPROVAL');
    } else if (filterType === 'SETTLED') {
      list = list.filter((m) => m.status === 'SETTLED');
    } else if (filterType === 'HIGH_RISK') {
      list = list.filter((m) => m.risk_score > 50);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (m) =>
          m.item.toLowerCase().includes(q) ||
          m.consumer_agent.toLowerCase().includes(q) ||
          m.mandate_id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [mandates, filterType, searchTerm]);

  // Expand row 0 on boot matching reference picture
  const handleFirstDataRendered = useCallback((params: FirstDataRenderedEvent<CartMandate>) => {
    const firstNode = params.api.getDisplayedRowAtIndex(0);
    if (firstNode) {
      firstNode.setExpanded(true);
    }
  }, []);

  const handleRowClicked = useCallback((event: RowClickedEvent<CartMandate>) => {
    if (event.node) {
      event.node.setExpanded(!event.node.expanded);
    }
  }, []);

  // Columns precisely matching the user's reference picture
  const columnDefs = useMemo<ColDef<CartMandate>[]>(() => {
    return [
      {
        headerName: '',
        field: 'mandate_id',
        width: 44,
        minWidth: 40,
        maxWidth: 48,
        sortable: false,
        filter: false,
        headerComponent: () => (
          <div className="flex items-center justify-center h-full">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
              readOnly
            />
          </div>
        ),
        cellRenderer: (params: any) => (
          <div className="flex items-center justify-center h-full">
            <input
              type="checkbox"
              checked={params.node.expanded}
              onChange={() => params.node.setExpanded(!params.node.expanded)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
            />
          </div>
        )
      },
      {
        headerName: 'ID / Risk',
        field: 'mandate_id',
        width: 100,
        minWidth: 90,
        sortable: true,
        filter: true,
        cellRenderer: ThreeTokenCellRenderer
      },
      {
        headerName: 'Date',
        field: 'created_at',
        width: 110,
        minWidth: 100,
        cellRenderer: () => (
          <div className="flex flex-col justify-center h-full leading-tight font-sans">
            <span className="text-xs font-semibold text-slate-800">
              Oct 28, 2024
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
              10:24 AM
            </span>
          </div>
        )
      },
      {
        headerName: 'Type',
        field: 'item',
        width: 95,
        minWidth: 85,
        cellRenderer: (params: any) => {
          const isHighRisk = (params.data?.risk_score || 0) > 50;
          return (
            <div className="flex items-center h-full">
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  isHighRisk
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                }`}
              >
                {isHighRisk ? 'Untrusted' : 'A2A Sale'}
              </span>
            </div>
          );
        }
      },
      {
        headerName: 'Description',
        field: 'item',
        minWidth: 180,
        flex: 1.4,
        cellRenderer: (params: any) => (
          <div className="flex flex-col justify-center h-full leading-tight truncate">
            <span className="font-bold text-xs text-slate-900 truncate">
              {params.value}
            </span>
            <span className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
              {params.data?.mandate_id}
            </span>
          </div>
        )
      },
      {
        headerName: 'Customer / Vendor',
        field: 'consumer_agent',
        width: 160,
        minWidth: 145,
        cellRenderer: AgentCellRenderer
      },
      {
        headerName: 'Region',
        field: 'region',
        width: 115,
        minWidth: 100,
        cellRenderer: RegionCellRenderer
      },
      {
        headerName: 'City',
        field: 'city',
        width: 120,
        minWidth: 105,
        cellRenderer: (params: any) => (
          <div className="flex items-center gap-1.5 h-full text-xs font-medium text-slate-700">
            <span className="text-[11px] text-rose-500">📍</span>
            <span className="truncate">{params.value || 'New York'}</span>
          </div>
        )
      },
      {
        headerName: 'Qty',
        field: 'quantity',
        width: 65,
        minWidth: 55,
        type: 'numericColumn',
        cellRenderer: (params: any) => (
          <div className="flex items-center justify-end h-full font-mono text-xs font-semibold text-slate-800">
            {params.value || 60}
          </div>
        )
      },
      {
        headerName: 'Category',
        field: 'item',
        width: 95,
        minWidth: 85,
        cellRenderer: (params: any) => {
          const val = params.value || '';
          let cat = 'Software';
          let color = 'bg-blue-50 text-blue-700 border-blue-200';
          if (val.includes('GPU')) {
            cat = 'Cloud';
            color = 'bg-purple-50 text-purple-700 border-purple-200';
          } else if (val.includes('Security') || val.includes('Key')) {
            cat = 'Security';
            color = 'bg-slate-100 text-slate-700 border-slate-200';
          } else if (val.includes('Feed')) {
            cat = 'Software';
            color = 'bg-blue-50 text-blue-700 border-blue-200';
          }
          return (
            <div className="flex items-center h-full">
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${color}`}>
                {cat}
              </span>
            </div>
          );
        }
      },
      {
        headerName: 'Risk Score',
        field: 'risk_score',
        width: 95,
        minWidth: 85,
        cellRenderer: (params: any) => {
          const score = params.value || 0;
          const isHigh = score > 50;
          return (
            <div className="flex items-center gap-1 h-full font-mono text-xs">
              <Shield className={`w-3.5 h-3.5 ${isHigh ? 'text-rose-500' : 'text-slate-400'}`} />
              <span className={`font-semibold ${isHigh ? 'text-rose-700 font-bold' : 'text-slate-700'}`}>
                {score}%
              </span>
            </div>
          );
        }
      },
      {
        headerName: 'Budget',
        field: 'budget_cap',
        width: 90,
        minWidth: 80,
        cellRenderer: (params: any) => {
          const isHigh = (params.data?.risk_score || 0) > 50;
          return (
            <div className="flex items-center gap-1 h-full">
              <div className="flex items-end gap-0.5 h-3">
                <div className={`w-1 h-2 rounded-xs ${isHigh ? 'bg-rose-500' : 'bg-blue-500'}`} />
                <div className={`w-1 h-2.5 rounded-xs ${isHigh ? 'bg-rose-500' : 'bg-blue-500'}`} />
                <div className={`w-1 h-3 rounded-xs ${isHigh ? 'bg-rose-500' : 'bg-blue-500'}`} />
              </div>
              <span className={`text-[10px] font-mono font-bold ${isHigh ? 'text-rose-600' : 'text-slate-600'}`}>
                {isHigh ? 'HIGH' : 'OK'}
              </span>
            </div>
          );
        }
      },
      {
        headerName: 'Amount',
        field: 'total_value',
        width: 110,
        minWidth: 100,
        type: 'numericColumn',
        cellRenderer: (params: any) => (
          <div className="flex items-center justify-end h-full">
            <span className="font-bold text-xs text-emerald-700 font-mono">
              ${Number(params.value || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
        )
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 105,
        minWidth: 95,
        cellRenderer: (params: any) => {
          const val = params.value;
          const isPending = val === 'PENDING_APPROVAL';
          return (
            <div className="flex items-center gap-1.5 h-full text-xs font-semibold">
              <span className={`w-2 h-2 rounded-full ${isPending ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className={isPending ? 'text-amber-700' : 'text-emerald-700'}>
                {isPending ? 'Pending' : 'Completed'}
              </span>
            </div>
          );
        }
      },
      {
        headerName: 'Actions',
        field: 'mandate_id',
        width: 125,
        minWidth: 115,
        sortable: false,
        filter: false,
        pinned: 'right',
        cellRenderer: (params: any) => {
          const isPending = params.data?.status === 'PENDING_APPROVAL';
          return (
            <div className="flex items-center gap-1.5 h-full">
              {isPending ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    params.context?.onApproveSuccess?.(params.data.mandate_id, 'https://sandbox.paypal.com/checkout/mock');
                  }}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Approve</span>
                </button>
              ) : null}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  params.node.setExpanded(!params.node.expanded);
                }}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          );
        }
      }
    ];
  }, []);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      sortable: true,
      filter: true,
      resizable: true
    };
  }, []);

  const gridContext = useMemo(() => {
    return {
      onApproveSuccess: (mandateId: string, checkoutUrl: string) => {
        onApproveSuccess?.(mandateId, checkoutUrl);
      }
    };
  }, [onApproveSuccess]);

  const handleExportCsv = () => {
    gridRef.current?.api?.exportDataAsCsv({
      fileName: `autonopay_mandates_${new Date().toISOString().slice(0, 10)}.csv`
    });
  };

  return (
    <div className="space-y-3 font-sans">
      {/* AG Grid Container (100% Full Width matching Reference Image) */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col transition-all">
        {/* Top Filter Pill Bar & Controls (Matching Reference Image) */}
        <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          {/* Left: Filter Pills */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                filterType === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>All Transactions</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                filterType === 'ALL' ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
              }`}>
                {mandates.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('PENDING')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                filterType === 'PENDING'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Pending Clearance</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                filterType === 'PENDING' ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
              }`}>
                {mandates.filter((m) => m.status === 'PENDING_APPROVAL').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('SETTLED')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                filterType === 'SETTLED'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Settled Orders</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                filterType === 'SETTLED' ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
              }`}>
                {mandates.filter((m) => m.status === 'SETTLED').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('HIGH_RISK')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                filterType === 'HIGH_RISK'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>High Risk (&gt;50%)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                filterType === 'HIGH_RISK' ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {mandates.filter((m) => m.risk_score > 50).length}
              </span>
            </button>
          </div>

          {/* Right Tools matching Reference Image */}
          <div className="flex items-center gap-2">
            {/* Density Selector */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-[11px] font-medium text-slate-600">
              <button
                onClick={() => setRowDensity('compact')}
                className={`px-2 py-1 rounded transition-all ${
                  rowDensity === 'compact' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Compact
              </button>
              <button
                onClick={() => setRowDensity('normal')}
                className={`px-2 py-1 rounded transition-all ${
                  rowDensity === 'normal' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setRowDensity('comfortable')}
                className={`px-2 py-1 rounded transition-all ${
                  rowDensity === 'comfortable' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Spacious
              </button>
            </div>

            {/* View Icons */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-slate-500">
              <button type="button" className="p-1 rounded bg-white text-slate-900 shadow-xs" title="Table View">
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button type="button" className="p-1 rounded hover:text-slate-900" title="Grid View">
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* AG Grid Table with Master-Detail Child Row Matching Reference Picture */}
        <div className="w-full relative overflow-hidden">
          <div className="ag-theme-quartz w-full" style={{ height: '760px', width: '100%' }}>
            <AgGridReact<CartMandate>
              ref={gridRef}
              rowData={displayedMandates}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              getRowId={(params) => params.data.mandate_id}
              context={gridContext}
              rowHeight={rowHeight}
              onRowClicked={handleRowClicked}
              onFirstDataRendered={handleFirstDataRendered}
              masterDetail={true}
              detailCellRenderer={RichExpandedDetailPanel}
              detailRowHeight={320}
              isRowMaster={() => true}
              rowSelection="single"
              animateRows={true}
              suppressCellFocus={false}
              enableCellTextSelection={true}
            />
          </div>
        </div>
      </div>

      {/* Product Analytics Panel Modal */}
      {selectedProductForAnalytics && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setSelectedProductForAnalytics(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <ProductDetailPanel
              productId={selectedProductForAnalytics}
              onClose={() => setSelectedProductForAnalytics(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
