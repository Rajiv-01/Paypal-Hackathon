import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { CartMandate } from '../types';

const REGION_FLAGS: Record<string, { flag: string; label: string }> = {
  'US-WEST':    { flag: '🇺🇸', label: 'US West' },
  'US-EAST':    { flag: '🇺🇸', label: 'US East' },
  'EU-CENTRAL': { flag: '🇪🇺', label: 'EU Central' },
  'APAC':       { flag: '🌏', label: 'APAC' },
  'LATAM':      { flag: '🌎', label: 'LATAM' },
};

export const RegionCellRenderer: React.FC<ICellRendererParams<CartMandate>> = (params) => {
  const region = params.value as string | undefined;
  if (!region) return <span className="text-slate-400 text-xs">—</span>;

  const info = REGION_FLAGS[region] || { flag: '🌐', label: region };

  return (
    <div className="flex items-center gap-1.5 h-full">
      <span className="text-base leading-none">{info.flag}</span>
      <span className="text-xs text-slate-600 font-medium">{info.label}</span>
    </div>
  );
};
