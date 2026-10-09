'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface StrategyData {
  name: string;
  value: number;
}

interface StrategyDonutProps {
  data: StrategyData[];
}

// Paleta Fintech Curada
const COLORS = [
  '#00E599', // Emerald
  '#00A3FF', // Cyan
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#38BDF8', // Sky
  '#EC4899', // Pink
  '#10B981', // Teal
];

interface CustomDonutTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    payload: { fill?: string };
  }>;
}

function CustomDonutTooltip({ active, payload }: CustomDonutTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-[#121824]/95 border border-white/[0.12] p-2.5 rounded-xl shadow-2xl backdrop-blur-xl text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload.fill || item.color }} />
          <span className="font-semibold text-slate-200">{item.name}</span>
        </div>
        <div className="text-sm font-bold font-mono text-white pl-4.5">
          +${Number(item.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    );
  }
  return null;
}

export function StrategyDonut({ data }: StrategyDonutProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-400">
          <span className="text-base">📊</span>
        </div>
        <p className="text-xs font-semibold text-slate-300">Sin datos de estrategias con ganancia</p>
        <p className="text-[11px] text-slate-500 max-w-[200px]">Registra trades ganadores asignando una estrategia para ver la distribución.</p>
      </div>
    );
  }

  const totalProfit = data.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  return (
    <div className="w-full h-full min-h-[260px] flex flex-col">
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={78}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="stroke-[#121824] stroke-2 outline-none hover:opacity-85 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            
            <Tooltip content={<CustomDonutTooltip />} />
            
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', color: '#94A3B8', paddingTop: '8px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-400">
        <span>Beneficio Ganador Total:</span>
        <span className="font-mono font-bold text-[#00E599]">
          +${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}