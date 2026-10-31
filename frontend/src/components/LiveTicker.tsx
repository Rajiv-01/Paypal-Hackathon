import React from 'react';
import { Activity, ShieldCheck, Cpu } from 'lucide-react';


interface LiveTickerProps {
  mandateCount: number;
  totalVolume: number;
  wsConnected: boolean;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({
  mandateCount,
  totalVolume,
  wsConnected
}) => {
  return (
    <div className="w-full bg-[#06080e] border-b border-slate-900 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none overflow-x-auto whitespace-nowrap scrollbar-none">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                wsConnected ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                wsConnected ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            ></span>
          </span>
          <span className="font-semibold text-slate-200">
            {wsConnected ? 'AP2 GATEWAY MESH: ONLINE' : 'AP2 GATEWAY: RECONNECTING'}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span>SLA Latency:</span>
          <span className="text-cyan-300 font-bold">14ms</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-slate-400">
          <Cpu className="w-3 h-3 text-purple-400" />
          <span>Consensus:</span>
          <span className="text-purple-300 font-bold">EIP-4337 / AP2 Standard</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Orders API:</span>
          <span className="text-emerald-300 font-bold">PayPal Sandbox v2</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-slate-400 ml-4">
        <div>
          <span>Active Deals:</span>{' '}
          <span className="text-white font-bold">{mandateCount}</span>
        </div>
        <div className="text-cyan-400 font-bold">
          <span>Cleared:</span>{' '}
          <span>
            ${totalVolume.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
