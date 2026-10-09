// components/GrowthChart.tsx
'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GrowthChartProps {
  data: { date: string; balance: number; pnl: number }[];
}

interface CustomChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { date: string; balance: number; pnl: number } }>;
}

function CustomChartTooltip({ active, payload }: CustomChartTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const isPnlPositive = item.pnl >= 0;
    return (
      <div className="bg-[#121824]/95 border border-white/[0.12] p-3 rounded-xl shadow-2xl backdrop-blur-xl min-w-[170px] space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
        <p className="text-[11px] font-medium text-slate-400 border-b border-white/[0.06] pb-1">
          {item.date}
        </p>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs text-slate-300">Balance:</span>
          <span className="text-sm font-bold font-mono text-white">
            ${Number(item.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        {item.pnl !== undefined && item.pnl !== null && (
          <div className="flex items-center justify-between gap-3 pt-0.5">
            <span className="text-[11px] text-slate-400">PnL Trade:</span>
            <span className={`text-xs font-mono font-bold ${isPnlPositive ? 'text-[#00E599]' : 'text-rose-400'}`}>
              {isPnlPositive ? '+' : ''}${Number(item.pnl).toFixed(2)}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export function GrowthChart({ data }: GrowthChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E599" stopOpacity={0.35}/>
              <stop offset="50%" stopColor="#00A3FF" stopOpacity={0.12}/>
              <stop offset="100%" stopColor="#00E599" stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00E599" />
              <stop offset="100%" stopColor="#00A3FF" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#64748B" 
            tick={{ fontSize: 11, fill: '#64748B' }} 
            tickLine={false}
            axisLine={false}
            dy={8}
          />
          <YAxis 
            stroke="#64748B" 
            tick={{ fontSize: 11, fill: '#64748B' }} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
            domain={['auto', 'auto']}
            dx={-4}
          />
          <Tooltip content={<CustomChartTooltip />} />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="url(#strokeGradient)" 
            strokeWidth={2.5}
            fillOpacity={1} 
            fill="url(#colorBalance)" 
            activeDot={{ r: 5, fill: '#00E599', stroke: '#080B11', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}