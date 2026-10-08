// app/lib/exportCsv.ts

export interface TradeExportItem {
  id?: number | string;
  symbol?: string;
  type?: string;
  strategy?: string | null;
  entryDate?: Date | string | null;
  exitDate?: Date | string | null;
  entry_date?: Date | string | null;
  exit_date?: Date | string | null;
  isHedge?: boolean | null;
  is_hedge?: boolean | null;
  hedgeTriggered?: boolean | null;
  hedge_triggered?: boolean | null;
  hedgeStatus?: string | null;
  hedge_status?: string | null;
  riskPercentage?: string | number | null;
  risk_percentage?: string | number | null;
  riskAmount?: string | number | null;
  risk_amount?: string | number | null;
  hedgePnlPercent?: string | number | null;
  hedge_pnl_percent?: string | number | null;
  hedgePnl?: string | number | null;
  hedge_pnl?: string | number | null;
  frozenLoss?: string | number | null;
  frozen_loss?: string | number | null;
  entryPrice?: string | number | null;
  entry_price?: string | number | null;
  size?: string | number | null;
  exitPrice?: string | number | null;
  exit_price?: string | number | null;
  pnl?: string | number | null;
  status?: string | null;
  [key: string]: unknown;
}

interface ExportStatsParams {
  accountName: string;
  stats?: {
    netPnL: string;
    winRate: string;
    profitFactor: string;
    totalTrades: number;
    currentBalance: string;
    initialBalance: string;
  } | null;
  hedgeData?: {
    totalHedgeTrades: number;
    notTriggeredCount: number;
    notTriggeredRate: string;
    winCount: number;
    winRate: string;
    lossCount: number;
    lossRate: string;
    breakevenCount: number;
    breakevenRate: string;
    managingCount?: number;
    managingRate?: string;
    totalHedgePnl: string;
    totalHedgeWinsPnl: string;
    totalHedgeLossesPnl: string;
    totalManagingFrozenLoss?: string;
    avgRiskPercent: string;
    initialAvgRiskPercent?: string;
  } | null;
  trades: TradeExportItem[];
}

function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return '-';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '-';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTime(d: Date | string | null | undefined): string {
  if (!d) return '-';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '-';
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  const secs = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${mins}:${secs}`;
}

function formatDuration(diffMs: number): string {
  if (isNaN(diffMs) || diffMs < 0) return '-';
  const totalSec = Math.floor(diffMs / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (days === 0 && hours === 0 && secs > 0) parts.push(`${secs}s`);
  return parts.join(' ') || '0s';
}

export function exportStatisticsCSV({ accountName, stats, hedgeData, trades }: ExportStatsParams) {
  const lines: string[] = [];
  const now = new Date();
  const exportDate = `${formatDate(now)} ${formatTime(now)}`;

  // =========================================================================
  // TABLA 1: RESUMEN GENERAL DE LA CUENTA
  // =========================================================================
  lines.push('TABLA 1: RESUMEN GENERAL DE LA CUENTA');
  lines.push(['MÉTRICA', 'VALOR', 'DESCRIPCIÓN'].map(escapeCsv).join(','));
  lines.push(['Cuenta', accountName, 'Cuenta de trading seleccionada'].map(escapeCsv).join(','));
  lines.push(['Fecha del Reporte', exportDate, 'Fecha y hora de exportación del informe'].map(escapeCsv).join(','));

  if (stats) {
    lines.push(['Balance Inicial', `$${stats.initialBalance}`, 'Capital con el que inició la cuenta'].map(escapeCsv).join(','));
    lines.push(['Balance Actual', `$${stats.currentBalance}`, 'Capital actual en tiempo real'].map(escapeCsv).join(','));
    lines.push(['Net PnL Total', `${Number(stats.netPnL) >= 0 ? '+' : ''}$${stats.netPnL}`, 'Beneficio o pérdida total acumulada'].map(escapeCsv).join(','));
    lines.push(['Win Rate Global', `${stats.winRate}%`, 'Tasa de acierto de operaciones cerradas'].map(escapeCsv).join(','));
    lines.push(['Profit Factor', stats.profitFactor, 'Ratio ganancia bruta / pérdida bruta'].map(escapeCsv).join(','));
    lines.push(['Total Operaciones', stats.totalTrades, 'Cantidad de operaciones registradas'].map(escapeCsv).join(','));
  }
  lines.push('');

  // =========================================================================
  // TABLA 2: ESTADÍSTICAS DE COBERTURA (HEDGE ANALYTICS)
  // =========================================================================
  if (hedgeData) {
    lines.push('TABLA 2: ESTADÍSTICAS DE COBERTURA (HEDGE ANALYTICS)');
    lines.push([
      'CATEGORÍA',
      'CANTIDAD OPERACIONES',
      'RATIO / %',
      'MONTO DINERO ($)',
      'DESCRIPCIÓN'
    ].map(escapeCsv).join(','));

    lines.push([
      'Total Modo Hedge',
      `${hedgeData.totalHedgeTrades} ops`,
      '100.0%',
      '-',
      'Total de operaciones configuradas con cobertura'
    ].map(escapeCsv).join(','));

    lines.push([
      'No Tocaron Cobertura',
      `${hedgeData.notTriggeredCount} ops`,
      `${hedgeData.notTriggeredRate}%`,
      '-',
      'Operaciones directas que no requirieron abrir orden hedge'
    ].map(escapeCsv).join(','));

    lines.push([
      'Coberturas Ganadas',
      `${hedgeData.winCount} ops`,
      `${hedgeData.winRate}% Win`,
      `+$${hedgeData.totalHedgeWinsPnl}`,
      'Coberturas cerradas donde la gestión generó ganancia neta'
    ].map(escapeCsv).join(','));

    lines.push([
      'Coberturas Perdidas',
      `${hedgeData.lossCount} ops`,
      `${hedgeData.lossRate}% Loss`,
      `-$${hedgeData.totalHedgeLossesPnl}`,
      'Coberturas cerradas que resultaron en pérdida controlada'
    ].map(escapeCsv).join(','));

    lines.push([
      'A Break Even (BE)',
      `${hedgeData.breakevenCount} ops`,
      `${hedgeData.breakevenRate}% BE`,
      '$0.00',
      'Coberturas cerradas en punto de equilibrio sin pérdidas'
    ].map(escapeCsv).join(','));

    if (hedgeData.managingCount && hedgeData.managingCount > 0) {
      lines.push([
        'En Gestión Activa',
        `${hedgeData.managingCount} ops`,
        `${hedgeData.managingRate || '0.0'}%`,
        `-$${hedgeData.totalManagingFrozenLoss || '0.00'} Flotante`,
        'Coberturas activas con flotante negativo descontado'
      ].map(escapeCsv).join(','));
    }

    lines.push([
      'PnL Neto de Coberturas',
      '-',
      '-',
      `${Number(hedgeData.totalHedgePnl) >= 0 ? '+' : ''}$${hedgeData.totalHedgePnl}`,
      'Suma directa neta de impacto en el journal (Ganadas - Perdidas)'
    ].map(escapeCsv).join(','));

    lines.push([
      'Riesgo Promedio Efectivo',
      '-',
      `${hedgeData.avgRiskPercent}%`,
      '-',
      'Promedio considerando el % real perdido/ganado en coberturas cerradas'
    ].map(escapeCsv).join(','));

    if (hedgeData.initialAvgRiskPercent) {
      lines.push([
        'Riesgo Inicial Teórico',
        '-',
        `${hedgeData.initialAvgRiskPercent}%`,
        '-',
        'Promedio del riesgo programado originalmente en las órdenes'
      ].map(escapeCsv).join(','));
    }
    lines.push('');
  }

  // =========================================================================
  // TABLA 3: REGISTRO DETALLADO DE OPERACIONES
  // =========================================================================
  lines.push('TABLA 3: REGISTRO DETALLADO DE OPERACIONES');
  lines.push([
    'ID',
    'Símbolo',
    'Tipo',
    'Estrategia',
    'Precio Entrada',
    'Precio Salida',
    'Tamaño Size',
    'Riesgo Inicial %',
    'Riesgo $',
    'Estado de la Cobertura',
    'Riesgo Final Cobertura %',
    'PnL Final Cobertura $',
    'PnL Total',
    'Resultado',
    'Fecha',
    'Hora de Apertura',
    'Hora de Cierre',
    'Duración Trade'
  ].map(escapeCsv).join(','));

  // Ordenar operaciones cronológicamente de forma ascendente
  const sortedTrades = [...trades].sort((a, b) => {
    const rawDateA = a.entryDate || a.entry_date;
    const rawDateB = b.entryDate || b.entry_date;
    const dateA = rawDateA ? new Date(rawDateA).getTime() : 0;
    const dateB = rawDateB ? new Date(rawDateB).getTime() : 0;
    return dateA - dateB;
  });

  sortedTrades.forEach((t, index) => {
    // 1. ID que inicia desde el 1 ascendiendo
    const rowId = index + 1;

    const entryDate = t.entryDate || t.entry_date;
    const exitDate = t.exitDate || t.exit_date;
    const isHedge = Boolean(t.isHedge ?? t.is_hedge);
    const hedgeTriggered = Boolean(t.hedgeTriggered ?? t.hedge_triggered);
    const hedgeStatus = (t.hedgeStatus ?? t.hedge_status) as string | undefined;
    const riskPercentage = t.riskPercentage ?? t.risk_percentage;
    const riskAmount = t.riskAmount ?? t.risk_amount;
    const hedgePnlPercent = t.hedgePnlPercent ?? t.hedge_pnl_percent;
    const hedgePnl = t.hedgePnl ?? t.hedge_pnl;
    const entryPrice = t.entryPrice ?? t.entry_price;
    const exitPrice = t.exitPrice ?? t.exit_price;
    const size = t.size;
    const pnl = t.pnl;
    const status = t.status as string | undefined;

    // 2. Símbolo
    const symbolStr = (t.symbol as string) || '-';

    // 3. Tipo
    const typeStr = (t.type as string) || '-';

    // 4. Estrategia
    const strategyStr = (t.strategy as string) || '-';

    // 5. Precio Entrada
    const entryPriceStr = entryPrice !== null && entryPrice !== undefined && entryPrice !== ''
      ? Number(entryPrice).toString()
      : '-';

    // 6. Precio Salida
    const exitPriceStr = exitPrice !== null && exitPrice !== undefined && exitPrice !== ''
      ? Number(exitPrice).toString()
      : '-';

    // 7. Tamaño Size
    const sizeStr = size !== null && size !== undefined && size !== ''
      ? Number(size).toString()
      : '-';

    // 8. Riesgo Inicial %
    const riskPctStr = riskPercentage !== null && riskPercentage !== undefined && riskPercentage !== ''
      ? `${Number(riskPercentage).toFixed(2)}%`
      : '-';

    // 9. Riesgo $
    const riskAmtStr = riskAmount !== null && riskAmount !== undefined && riskAmount !== ''
      ? `$${Number(riskAmount).toFixed(2)}`
      : '-';

    // 10. Estado de la Cobertura
    let estadoCoberturaStr = '-';
    if (!isHedge) {
      estadoCoberturaStr = 'Sin Cobertura (No Hedge)';
    } else if (!hedgeTriggered || hedgeStatus === 'NOT_TRIGGERED') {
      estadoCoberturaStr = 'No tocó cobertura';
    } else if (hedgeStatus === 'MANAGING') {
      estadoCoberturaStr = 'En Gestión Activa';
    } else if (hedgeStatus === 'WIN') {
      estadoCoberturaStr = 'Ganada (WIN)';
    } else if (hedgeStatus === 'LOSS') {
      estadoCoberturaStr = 'Perdida (LOSS)';
    } else if (hedgeStatus === 'BREAKEVEN') {
      estadoCoberturaStr = 'Break Even (BE)';
    }

    // 11. Riesgo Final Cobertura %
    let riesgoFinalCobStr = '-';
    if (isHedge && hedgeTriggered && hedgeStatus && hedgeStatus !== 'MANAGING') {
      if (hedgeStatus === 'LOSS') {
        let lossPct = 0;
        if (hedgePnlPercent !== null && hedgePnlPercent !== undefined && hedgePnlPercent !== '') {
          lossPct = Math.abs(Number(hedgePnlPercent));
        } else if (hedgePnl && riskAmount && riskPercentage && Number(riskAmount) > 0) {
          lossPct = (Math.abs(Number(hedgePnl)) / Number(riskAmount)) * Number(riskPercentage);
        } else if (riskPercentage) {
          lossPct = Number(riskPercentage);
        }
        riesgoFinalCobStr = `-${lossPct.toFixed(2)}%`;
      } else if (hedgeStatus === 'WIN') {
        const winPct = hedgePnlPercent ? Math.abs(Number(hedgePnlPercent)).toFixed(2) : '0.00';
        riesgoFinalCobStr = `+${winPct}%`;
      } else if (hedgeStatus === 'BREAKEVEN') {
        riesgoFinalCobStr = '0.00%';
      }
    } else if (isHedge && (!hedgeTriggered || hedgeStatus === 'NOT_TRIGGERED')) {
      riesgoFinalCobStr = riskPercentage ? `${Number(riskPercentage).toFixed(2)}%` : '-';
    }

    // 12. PnL Final Cobertura $
    let pnlFinalCobStr = '-';
    if (isHedge && hedgeTriggered && hedgePnl !== null && hedgePnl !== undefined && hedgePnl !== '') {
      pnlFinalCobStr = `${Number(hedgePnl) >= 0 ? '+' : ''}$${Number(hedgePnl).toFixed(2)}`;
    }

    // 13. PnL Total
    let pnlTotalStr = '-';
    if (pnl !== null && pnl !== undefined && pnl !== '') {
      pnlTotalStr = `${Number(pnl) >= 0 ? '+' : ''}$${Number(pnl).toFixed(2)}`;
    } else if (isHedge && hedgeTriggered && hedgePnl !== null && hedgePnl !== undefined && hedgePnl !== '') {
      pnlTotalStr = `${Number(hedgePnl) >= 0 ? '+' : ''}$${Number(hedgePnl).toFixed(2)}`;
    }

    // 14. Resultado
    const resultadoStr = status || (isHedge && hedgeTriggered && hedgeStatus ? hedgeStatus : 'OPEN');

    // 15. Fecha
    const fechaStr = formatDate(entryDate);

    // 16. Hora de Apertura
    const horaAperturaStr = formatTime(entryDate);

    // 17. Hora de Cierre
    let horaCierreStr = '-';
    if (exitDate) {
      horaCierreStr = formatTime(exitDate);
    } else if (resultadoStr === 'OPEN' || hedgeStatus === 'MANAGING') {
      horaCierreStr = 'En curso';
    }

    // 18. Duración Trade
    let duracionTradeStr = '-';
    if (entryDate && exitDate) {
      const diff = new Date(exitDate).getTime() - new Date(entryDate).getTime();
      duracionTradeStr = formatDuration(diff);
    } else if (entryDate && (resultadoStr === 'OPEN' || hedgeStatus === 'MANAGING')) {
      duracionTradeStr = 'En curso';
    }

    const row = [
      rowId,
      symbolStr,
      typeStr,
      strategyStr,
      entryPriceStr,
      exitPriceStr,
      sizeStr,
      riskPctStr,
      riskAmtStr,
      estadoCoberturaStr,
      riesgoFinalCobStr,
      pnlFinalCobStr,
      pnlTotalStr,
      resultadoStr,
      fechaStr,
      horaAperturaStr,
      horaCierreStr,
      duracionTradeStr
    ];

    lines.push(row.map(escapeCsv).join(','));
  });

  // Generar Blob con UTF-8 BOM (\uFEFF) para compatibilidad total con Excel
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const safeAccountName = accountName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const dateFormatted = new Date().toISOString().split('T')[0];
  const filename = `estadisticas_${safeAccountName}_${dateFormatted}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
