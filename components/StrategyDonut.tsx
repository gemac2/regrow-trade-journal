'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface StrategyData {
  name: string;
  value: number;
}

interface StrategyDonutProps {
  data: StrategyData[];
}

// Paleta de Colores Cyberpunk
const COLORS = [
  '#00FF7F', // Neon Green
  '#00A3FF', // Neon Blue
  '#FF00FF', // Magenta
  '#FFFF00', // Yellow
  '#FF4D4D', // Red
  '#8A2BE2', // Violet
];

export function StrategyDonut({ data }: StrategyDonutProps) {
  
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
         <p className="text-sm">No profitable strategies yet.</p>
         <p className="text-xs opacity-50">Record winning trades with a strategy tag.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                className="stroke-[#1e2329] stroke-2 outline-none"
              />
            ))}
          </Pie>
          
          <Tooltip 
            contentStyle={{ 
                backgroundColor: '#13171D', 
                borderColor: '#374151', 
                borderRadius: '12px',
                color: '#fff' 
            }}
            itemStyle={{ color: '#fff' }}
            // CORRECCIÓN AQUÍ: Cambiamos 'number' por 'any' para evitar el error de tipado
            formatter={(value: any) => [`$${value}`, 'Profit']}
          />
          
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', opacity: 0.8 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}