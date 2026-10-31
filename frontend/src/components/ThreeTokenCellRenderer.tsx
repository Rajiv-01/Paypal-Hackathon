import React, { useState, useEffect } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { CartMandate } from '../types';

export const ThreeTokenCellRenderer: React.FC<ICellRendererParams<CartMandate>> = (params) => {
  const mandate = params.data;
  const [isHovered, setIsHovered] = useState(false);

  if (!mandate) return null;

  const isSettled = mandate.status === 'SETTLED';
  const isHighRisk = (mandate.risk_score || 0) > 50;

  // Format ID to match reference image (t_1003, t_1001, t_1002)
  let displayId = mandate.mandate_id;
  if (displayId.startsWith('req_init_')) {
    displayId = 't_' + displayId.replace('req_init_', '');
  } else if (!displayId.startsWith('t_')) {
    displayId = 't_' + displayId.slice(-4);
  }

  const theme = isHighRisk
    ? {
        stroke: '#ef4444',
        fill: 'rgba(239, 68, 68, 0.12)',
        text: 'text-rose-600',
        label: 'RISK',
      }
    : isSettled
    ? {
        stroke: '#10b981',
        fill: 'rgba(16, 185, 129, 0.12)',
        text: 'text-emerald-600',
        label: 'SEALED',
      }
    : {
        stroke: '#3b82f6',
        fill: 'rgba(59, 130, 246, 0.12)',
        text: 'text-blue-600',
        label: 'ACTIVE',
      };

  return (
    <div
      className="flex items-center gap-2 h-full cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`Mandate ID: ${mandate.mandate_id}`}
    >
      {/* 2D/3D Diamond Badge Matching Reference Picture */}
      <div className={`w-7 h-7 flex items-center justify-center shrink-0 transition-transform ${isHovered ? 'scale-110' : ''}`}>
        <svg width="26" height="26" viewBox="0 0 26 26" className="overflow-visible">
          {/* Diamond Outer Boundary */}
          <polygon
            points="13,2 24,13 13,24 2,13"
            fill={theme.fill}
            stroke={theme.stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Inner Glyph based on state */}
          {isHighRisk ? (
            /* Warning / Slash Glyph */
            <g stroke={theme.stroke} strokeWidth="1.8" strokeLinecap="round">
              <line x1="9" y1="9" x2="17" y2="17" />
              <line x1="17" y1="9" x2="9" y2="17" />
            </g>
          ) : isSettled ? (
            /* Checkmark Glyph */
            <polyline
              points="8,13 11,16 18,9"
              fill="none"
              stroke={theme.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            /* Active Inner Core */
            <polygon
              points="13,7 19,13 13,19 7,13"
              fill="none"
              stroke={theme.stroke}
              strokeWidth="1.2"
            />
          )}
        </svg>
      </div>

      <div className="flex flex-col leading-tight">
        <span className="font-mono text-xs font-bold text-slate-900">
          {displayId}
        </span>
        <span className={`text-[9px] font-mono uppercase tracking-wider font-bold mt-0.5 ${theme.text}`}>
          {theme.label}
        </span>
      </div>
    </div>
  );
};
