import React, { useEffect, useState } from 'react';
import { A2ASession } from '../../types';
import { Bell, Bot, X, ArrowRight } from 'lucide-react';

interface InboundNotificationProps {
  session: A2ASession;
  onDismiss: () => void;
}

export const InboundNotification: React.FC<InboundNotificationProps> = ({ session, onDismiss }) => {
  const [visible,  setVisible]  = useState(false);
  const [progress, setProgress] = useState(100);

  // Slide in
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Progress bar & auto-dismiss after 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p <= 0) { onDismiss(); return 0; }
        return p - 100 / 80; // 8000ms / 100ms intervals = 80 steps
      });
    }, 100);
    return () => clearInterval(interval);
  }, [onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`w-full rounded-2xl border border-blue-200/60 bg-white shadow-2xl shadow-blue-500/10 overflow-hidden transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      {/* Progress bar */}
      <div className="h-0.5 bg-blue-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
            <Bell className="w-4 h-4 text-blue-600" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold text-blue-600 font-mono">NEW INBOUND SESSION</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-slate-800 leading-tight mb-1">
              {session.bot_name} is negotiating
            </p>
            <p className="text-xs text-slate-500 truncate">
              {session.item_requested} · Budget ${session.budget_cap.toLocaleString()} · {session.quantity} units
            </p>
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bot details row */}
        <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <Bot className="w-3 h-3" />
          <span>Session: {session.session_id.slice(-8)}</span>
          {session.region && (
            <>
              <span className="text-slate-300">·</span>
              <span>{session.region}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
