// components/GrowthChart.tsx
'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function GrowthChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00FF7F" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00FF7F" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2329" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280" 
            tick={{fontSize: 12}} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#6b7280" 
            tick={{fontSize: 12}} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
            domain={['auto', 'auto']} // Ajuste automático de escala
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#13171D', borderColor: '#374151', color: '#fff' }}
            itemStyle={{ color: '#00FF7F' }}
            formatter={(value: any) => [`$${value}`, 'Balance']}
          />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="#00FF7F" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorBalance)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}