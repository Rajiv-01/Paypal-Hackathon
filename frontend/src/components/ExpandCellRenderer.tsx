import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { ChevronDown, ChevronRight, MessageSquareText } from 'lucide-react';
import { CartMandate } from '../types';

interface ExpandCellRendererProps extends ICellRendererParams<CartMandate> {
  expandedIds?: Set<string>;
  toggleExpand?: (id: string) => void;
}

export const ExpandCellRenderer: React.FC<ExpandCellRendererProps> = (params) => {
  const data = params.data;
  if (!data) return null;

  const isExpanded = params.context?.expandedIds?.has(data.mandate_id) || false;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (params.context?.toggleExpand) {
      params.context.toggleExpand(data.mandate_id);
    }
  };

  return (
    <div className="flex items-center gap-1.5 h-full">
      <button
        onClick={handleToggle}
        className={`p-1 rounded transition-colors ${
          isExpanded
            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
        title={isExpanded ? 'Collapse Transcript' : 'Expand A2A Chat Transcript'}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
      <MessageSquareText
        className={`w-3.5 h-3.5 cursor-pointer ${
          isExpanded ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
        }`}
        onClick={handleToggle}
      />
    </div>
  );
};
