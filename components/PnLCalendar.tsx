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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';
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
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Empezar lunes
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const getDayData = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return data.find((d) => d.date === dateKey);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const today = new Date();

  // Calcular métricas del mes actual mostrado
  const currentMonthDays = data.filter((d) => {
    const itemDate = new Date(d.date + 'T00:00:00');
    return isSameMonth(itemDate, currentMonth);
  });

  const monthTotalPnL = currentMonthDays.reduce((acc, curr) => acc + (Number(curr.pnl) || 0), 0);
  const greenDaysCount = currentMonthDays.filter((d) => d.pnl > 0).length;
  const redDaysCount = currentMonthDays.filter((d) => d.pnl < 0).length;

  return (
    <Tooltip.Provider delayDuration={50}>
      <div className="bg-[#121824] border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col w-full space-y-5">
        
        {/* HEADER CON RESUMEN MENSUAL */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0D1117] rounded-xl border border-white/[0.08] text-[#00E599]">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white capitalize tracking-tight flex items-center gap-2">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <p className="text-xs text-slate-400">Distribución de PnL diario y regularidad operativa</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Pill PnL Mes */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0D1117] border border-white/[0.08]">
              <span className="text-[11px] text-slate-400 font-medium">PnL Mes:</span>
              <span className={`text-sm font-mono font-bold ${
                monthTotalPnL > 0 ? 'text-[#00E599]' : monthTotalPnL < 0 ? 'text-rose-400' : 'text-slate-300'
              }`}>
                {monthTotalPnL > 0 ? '+' : ''}${monthTotalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Días Verdes / Rojos */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0D1117] border border-white/[0.08] text-xs font-mono">
              <span className="text-[#00E599] font-bold flex items-center gap-1">
                <TrendingUp size={12} /> {greenDaysCount} W
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <TrendingDown size={12} /> {redDaysCount} L
              </span>
            </div>

            {/* Selector mes */}
            <div className="flex gap-1 bg-[#0D1117] p-1 rounded-xl border border-white/[0.08]">
              <button
                onClick={prevMonth}
                className="p-1.5 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                title="Mes anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="w-[1px] bg-white/[0.08] my-1"></div>
              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                title="Siguiente mes"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* CALENDAR GRID */}
        <div>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 w-full mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-2 w-full">
            {calendarDays.map((day) => {
              const dayData = getDayData(day);
              const pnl = dayData ? Number(dayData.pnl) : 0;
              const hasTrade = !!dayData;
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, today);

              // Estilos refinados con alto contraste y sin fatiga visual
              let bgClass = "bg-[#0D1117]/80";
              let borderClass = "border border-white/[0.06]";
              let textDateClass = "text-slate-400";
              let pnlColor = "text-slate-500";
              let hoverClass = "hover:border-white/[0.18] hover:bg-[#161D2B]";

              if (hasTrade) {
                if (pnl > 0) {
                  // WIN: Dark emerald tint con borde fino brillante y tipografía legible
                  bgClass = "bg-gradient-to-b from-emerald-950/60 to-emerald-900/30";
                  borderClass = "border border-[#00E599]/40";
                  textDateClass = "text-[#00E599] font-bold";
                  pnlColor = "text-[#00E599] font-extrabold";
                  hoverClass = "hover:border-[#00E599] hover:shadow-[0_0_20px_rgba(0,229,153,0.25)] hover:scale-[1.03] z-10 transition-all duration-200";
                } else if (pnl < 0) {
                  // LOSS: Dark rose tint con borde fino carmesí
                  bgClass = "bg-gradient-to-b from-rose-950/60 to-rose-900/30";
                  borderClass = "border border-rose-500/40";
                  textDateClass = "text-rose-400 font-bold";
                  pnlColor = "text-rose-300 font-extrabold";
                  hoverClass = "hover:border-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.25)] hover:scale-[1.03] z-10 transition-all duration-200";
                } else {
                  // BREAKEVEN
                  bgClass = "bg-slate-800/40";
                  borderClass = "border border-slate-600/40";
                  textDateClass = "text-slate-300 font-semibold";
                  pnlColor = "text-slate-300 font-bold";
                  hoverClass = "hover:border-slate-400";
                }
              } else if (isToday) {
                borderClass = "border-2 border-[#00A3FF]";
                bgClass = "bg-[#121824]";
              }

              const opacityClass = !isCurrentMonth ? "opacity-25 grayscale pointer-events-none" : "opacity-100";

              return (
                <Tooltip.Root key={day.toString()}>
                  <Tooltip.Trigger asChild>
                    <div
                      className={cn(
                        "aspect-square min-h-[58px] sm:min-h-[72px] w-full rounded-xl p-1.5 flex flex-col justify-between relative cursor-pointer transition-all duration-200 select-none",
                        bgClass,
                        borderClass,
                        hoverClass,
                        opacityClass
                      )}
                    >
                      {/* Día del mes */}
                      <div className="flex items-center justify-between">
                        <span className={cn("text-[11px] leading-none font-mono", textDateClass)}>
                          {format(day, 'd')}
                        </span>
                        {isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00A3FF] shadow-[0_0_6px_#00A3FF]"></span>
                        )}
                      </div>

                      {/* Monto PnL */}
                      {hasTrade ? (
                        <div className="flex flex-col items-center justify-center my-auto">
                          <span className={cn("text-xs sm:text-sm font-mono tracking-tight", pnlColor)}>
                            {pnl > 0 ? '+' : ''}${Math.round(pnl).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <div className="h-4"></div>
                      )}
                    </div>
                  </Tooltip.Trigger>
                  
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-[#121824] border border-white/[0.15] p-3 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl min-w-[170px]"
                      sideOffset={6}
                    >
                      <p className="text-slate-400 text-xs font-medium border-b border-white/[0.08] pb-1.5 mb-2 capitalize">
                        {format(day, 'EEEE, d MMMM yyyy')}
                      </p>
                      {hasTrade ? (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-300">PnL Neto:</span>
                            <span className={`font-mono font-bold ${pnl > 0 ? 'text-[#00E599]' : pnl < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                              {pnl > 0 ? '+' : ''}${pnl.toFixed(2)}
                            </span>
                          </div>
                          <div className="pt-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              pnl > 0 ? 'bg-[#00E599]/15 text-[#00E599]' : pnl < 0 ? 'bg-rose-500/15 text-rose-400' : 'bg-slate-700 text-slate-300'
                            }`}>
                              {pnl > 0 ? 'Día Ganador (Profit)' : pnl < 0 ? 'Día Negativo (Loss)' : 'Breakeven'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-xs">Sin operaciones registradas</span>
                      )}
                      <Tooltip.Arrow className="fill-[#121824]" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              );
            })}
          </div>
        </div>

        {/* FOOTER / LEYENDA */}
        <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-white/[0.04] gap-2">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#00E599]/20 border border-[#00E599]/60"></span>
              <span className="text-slate-300">Día Ganador</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-500/20 border border-rose-500/60"></span>
              <span className="text-slate-300">Día Pérdida</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#0D1117] border border-white/[0.08]"></span>
              <span className="text-slate-400">Sin Actividad</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">Pasa el cursor sobre un día para ver el detalle exacto</span>
        </div>
      </div>
    </Tooltip.Provider>
  );
}