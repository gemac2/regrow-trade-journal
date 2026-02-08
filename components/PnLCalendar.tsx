'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DayData {
  date: string;
  pnl: number;
}

interface PnLCalendarProps {
  data: DayData[];
}

export function PnLCalendar({ data }: PnLCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDayData = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return data.find((d) => d.date === dateKey);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const today = new Date();

  return (
    <Tooltip.Provider delayDuration={0}>
      <div className="bg-[#1e2329] border border-gray-800 rounded-2xl p-6 shadow-2xl h-full flex flex-col w-full">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0b0e11] rounded-lg border border-gray-800 text-gray-400">
              <CalendarIcon size={20} />
            </div>
            <h3 className="text-xl font-bold text-white capitalize tracking-wide">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
          </div>

          <div className="flex gap-1 bg-[#0b0e11] p-1 rounded-lg border border-gray-800">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-gray-800 rounded-md text-gray-500 hover:text-white transition"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="w-[1px] bg-gray-800 my-1"></div>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-gray-800 rounded-md text-gray-500 hover:text-white transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* GRID */}
        {/* `place-content-center` ayuda a centrar si sobra espacio */}
        <div className="grid grid-cols-7 gap-2 w-full">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-[11px] font-bold text-gray-500 uppercase tracking-widest py-2"
            >
              {day}
            </div>
          ))}

          {calendarDays.map((day) => {
            const dayData = getDayData(day);
            const pnl = dayData ? dayData.pnl : 0;
            const hasTrade = !!dayData;
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, today);

            // --- LÓGICA DE ESTILOS ESTRICTA ---
            
            // 1. Estilos por defecto (Sin trade)
            let bgClass = "bg-[#0b0e11]";
            let borderClass = "border border-gray-800/50";
            let textClass = "text-gray-500";
            let hoverClass = "hover:bg-gray-800/80 hover:border-gray-600"; // Hover simple para días vacíos
            let pnlColor = "text-gray-500";

            if (hasTrade) {
              if (pnl > 0) {
                // WIN (Verde Sólido estilo Binance)
                bgClass = "bg-[#00FF7F]"; // Fondo verde brillante
                borderClass = "border border-[#00FF7F]";
                textClass = "text-[#004d26] font-bold"; // Texto oscuro para contraste
                // Hover: Se oscurece ligeramente o brilla más
                hoverClass = "hover:brightness-110 hover:shadow-[0_0_15px_rgba(0,255,127,0.4)] transition-all duration-200 z-10 scale-105";
                pnlColor = "text-[#004d26] font-extrabold";
              } else if (pnl < 0) {
                // LOSS (Rojo Sólido)
                bgClass = "bg-[#FF4D4D]"; // Rojo brillante
                borderClass = "border border-[#FF4D4D]";
                textClass = "text-white font-bold"; // Texto blanco para contraste
                hoverClass = "hover:brightness-110 hover:shadow-[0_0_15px_rgba(255,77,77,0.4)] transition-all duration-200 z-10 scale-105";
                pnlColor = "text-white font-extrabold";
              } else {
                // BREAK EVEN
                bgClass = "bg-gray-600";
                borderClass = "border border-gray-500";
                textClass = "text-white";
                hoverClass = "hover:bg-gray-500";
                pnlColor = "text-gray-200";
              }
            } else {
               // Si es HOY pero sin trade
               if (isToday) {
                 borderClass = "border-2 border-[#00A3FF]";
               }
            }

            // Opacidad para días de otros meses
            const opacityClass = !isCurrentMonth ? "opacity-30 grayscale pointer-events-none" : "opacity-100";

            // TOOLTIP
            const tooltipContent = (
              <div className="space-y-1 text-sm min-w-[140px]">
                <p className="text-gray-400 text-xs font-medium border-b border-gray-700 pb-1 mb-1">
                  {format(day, 'EEEE, MMM d, yyyy')}
                </p>
                {hasTrade ? (
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-300">PnL:</span>
                    <span className={`font-bold font-mono ${pnl > 0 ? 'text-[#00FF7F]' : pnl < 0 ? 'text-red-500' : 'text-gray-300'}`}>
                      {pnl > 0 ? '+' : ''}{pnl.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500 italic text-xs">No trading activity</span>
                )}
              </div>
            );

            return (
              <Tooltip.Root key={day.toString()}>
                <Tooltip.Trigger asChild>
                  <div
                    className={cn(
                      "aspect-square w-full rounded-lg flex flex-col relative cursor-default",
                      bgClass,
                      borderClass,
                      hoverClass,
                      opacityClass
                    )}
                  >
                    {/* FECHA (Arriba Izquierda) */}
                    <span className={cn("absolute top-1 left-1.5 text-[10px] leading-none", textClass)}>
                      {format(day, 'd')}
                    </span>

                    {/* PNL (Centro) - Solo si hay trade */}
                    {hasTrade && (
                      <div className="flex-1 flex items-center justify-center pt-3">
                         <span className={cn("text-[10px] md:text-xs tracking-tighter", pnlColor)}>
                            {pnl > 0 ? '+' : ''}{Math.round(pnl)}
                         </span>
                      </div>
                    )}

                    {/* Indicador HOY (si no hay trade) */}
                    {isToday && !hasTrade && isCurrentMonth && (
                       <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00A3FF] animate-pulse"></div>
                    )}
                  </div>
                </Tooltip.Trigger>
                
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-[#13171D] border border-gray-700 p-3 rounded-xl shadow-[0_10px_38px_-10px_rgba(0,0,0,0.8)] z-50 animate-in fade-in zoom-in-95 duration-200"
                    sideOffset={5}
                  >
                    {tooltipContent}
                    <Tooltip.Arrow className="fill-[#13171D] border-t border-gray-700" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            );
          })}
        </div>
        
        {/* Footer / Leyenda */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#00FF7F]"></div> Win
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#FF4D4D]"></div> Loss
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#0b0e11] border border-gray-800"></div> No Trade
            </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
}