import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { CartMandate } from '../types';

export const TrendCellRenderer: React.FC<ICellRendererParams<CartMandate>> = (params) => {
  const mandate = params.data;
  if (!mandate) return null;

  const isSettled = mandate.status === 'SETTLED';
  const isHighRisk = (mandate.risk_score || 0) > 50;

  // Generate deterministic sparkline points based on mandate_id
  const seed = (mandate.mandate_id || '').charCodeAt(mandate.mandate_id.length - 1) || 7;
  const points = isHighRisk
    ? [20, 15, 22, 12, 28, 10, 8] // downward/volatile
    : isSettled
    ? [8, 12, 15, 14, 20, 24, 28] // steady upward
    : [10, 16, 12, 22, 18, 25, 26]; // upward

  const w = 72;
  const h = 26;
  const min = Math.min(...points);
  const max = Math.max(...points);

  const polyPoints = points
    .map((val, idx) => {
      const x = Math.round((idx / (points.length - 1)) * (w - 10) + 5);
      const y = Math.round(h - 4 - ((val - min) / (max - min || 1)) * (h - 8));
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColor = isHighRisk ? '#f43f5e' : isSettled ? '#10b981' : '#3b82f6';
  const lastPoint = polyPoints.split(' ').slice(-1)[0].split(',');

  return (
    <div className="flex items-center h-full">
      <svg width={w} height={h} className="overflow-visible">
        <polyline
          points={polyPoints}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* End pulse dot */}
        <circle
          cx={lastPoint[0]}
          cy={lastPoint[1]}
          r="2.5"
          fill={strokeColor}
        />
      </svg>
    </div>
  );
};
