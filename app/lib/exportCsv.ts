// app/lib/exportCsv.ts

export interface TradeExportItem {
  id?: number | string;
  symbol?: string;
  type?: string;
  strategy?: string | null;
  entryDate?: Date | string | null;
  isHedge?: boolean | null;
  hedgeTriggered?: boolean | null;
  hedgeStatus?: string | null;
  riskPercentage?: string | number | null;
  riskAmount?: string | number | null;
  hedgePnlPercent?: string | number | null;
  hedgePnl?: string | number | null;
  frozenLoss?: string | number | null;
  entryPrice?: string | number | null;
  size?: string | number | null;
  exitPrice?: string | number | null;
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

export function exportStatisticsCSV({ accountName, stats, hedgeData, trades }: ExportStatsParams) {
  const lines: string[] = [];
  const exportDate = new Date().toLocaleString();

  // --- ENCABEZADO PRINCIPAL ---
  lines.push(`REPORTE DE ESTADÍSTICAS Y OPERACIONES - TRADING JOURNAL`);
  lines.push(`Cuenta,${escapeCsv(accountName)}`);
  lines.push(`Fecha de Exportación,${escapeCsv(exportDate)}`);
  lines.push('');

  // --- SECCIÓN 1: RESUMEN GENERAL DE LA CUENTA ---
  if (stats) {
    lines.push(`=== RESUMEN GENERAL DE LA CUENTA ===`);
    lines.push(`Métrica,Valor`);
    lines.push(`Balance Inicial,${escapeCsv(`$${stats.initialBalance}`)}`);
    lines.push(`Balance Actual,${escapeCsv(`$${stats.currentBalance}`)}`);
    lines.push(`Net PnL,${escapeCsv(`${Number(stats.netPnL) >= 0 ? '+' : ''}$${stats.netPnL}`)}`);
    lines.push(`Win Rate Global,${escapeCsv(`${stats.winRate}%`)}`);
    lines.push(`Profit Factor,${escapeCsv(stats.profitFactor)}`);
    lines.push(`Total Operaciones,${escapeCsv(stats.totalTrades)}`);
    lines.push('');
  }

  // --- SECCIÓN 2: ESTADÍSTICAS DE COBERTURA (HEDGE ANALYTICS) ---
  if (hedgeData) {
    lines.push(`=== ESTADÍSTICAS DE COBERTURA (HEDGE ANALYTICS) ===`);
    lines.push(`Categoría,Conteo,Porcentaje,PnL / Flotante`);
    lines.push(`Total Operaciones Hedge,${escapeCsv(hedgeData.totalHedgeTrades)},100.0%,-`);
    lines.push(`No Tocaron Cobertura,${escapeCsv(hedgeData.notTriggeredCount)},${escapeCsv(`${hedgeData.notTriggeredRate}%`)},Sin activación`);
    lines.push(`Coberturas Ganadas,${escapeCsv(hedgeData.winCount)},${escapeCsv(`${hedgeData.winRate}% Win`)},${escapeCsv(`+$${hedgeData.totalHedgeWinsPnl}`)}`);
    lines.push(`Coberturas Perdidas,${escapeCsv(hedgeData.lossCount)},${escapeCsv(`${hedgeData.lossRate}% Loss`)},${escapeCsv(`-$${hedgeData.totalHedgeLossesPnl}`)}`);
    lines.push(`A Break Even (BE),${escapeCsv(hedgeData.breakevenCount)},${escapeCsv(`${hedgeData.breakevenRate}%`)},$0.00`);
    if (hedgeData.managingCount && hedgeData.managingCount > 0) {
      lines.push(`En Gestión Activa,${escapeCsv(hedgeData.managingCount)},${escapeCsv(`${hedgeData.managingRate || '0'}%`)},${escapeCsv(`-$${hedgeData.totalManagingFrozenLoss || '0.00'} Flotante`)}`);
    }
    lines.push(`PnL Neto de Coberturas,-,-,${escapeCsv(`${Number(hedgeData.totalHedgePnl) >= 0 ? '+' : ''}$${hedgeData.totalHedgePnl}`)}`);
    lines.push(`Riesgo Promedio Efectivo,-,${escapeCsv(`${hedgeData.avgRiskPercent}%`)},Tomando % real perdido/ganado en cobertura`);
    if (hedgeData.initialAvgRiskPercent) {
      lines.push(`Riesgo Inicial Programado Promedio,-,${escapeCsv(`${hedgeData.initialAvgRiskPercent}%`)},Riesgo teórico al abrir orden`);
    }
    lines.push('');
  }

  // --- SECCIÓN 3: REGISTRO DETALLADO DE TRADES ---
  lines.push(`=== REGISTRO DETALLADO DE OPERACIONES ===`);
  lines.push([
    'ID',
    'Fecha',
    'Símbolo',
    'Tipo',
    'Estrategia',
    'Modo Hedge',
    'Estado Cobertura',
    'Riesgo Inicial (%)',
    'Riesgo Inicial ($)',
    'PnL Cobertura (%) [Real]',
    'PnL Cobertura ($)',
    'Flotante Congelado ($)',
    'Precio Entrada',
    'Tamaño (Size)',
    'Precio Salida',
    'PnL Total ($)',
    'Resultado Global'
  ].map(escapeCsv).join(','));

  trades.forEach(t => {
    const isHedgeStr = t.isHedge ? 'SÍ' : 'NO';
    let hedgeStatusStr = '-';
    if (t.isHedge) {
      if (!t.hedgeTriggered || t.hedgeStatus === 'NOT_TRIGGERED') hedgeStatusStr = 'Sin Cobertura';
      else if (t.hedgeStatus === 'MANAGING') hedgeStatusStr = 'En Gestión';
      else if (t.hedgeStatus === 'WIN') hedgeStatusStr = 'Ganada (WIN)';
      else if (t.hedgeStatus === 'LOSS') hedgeStatusStr = 'Perdida (LOSS)';
      else if (t.hedgeStatus === 'BREAKEVEN') hedgeStatusStr = 'Break Even (BE)';
    }

    const dateStr = t.entryDate ? new Date(t.entryDate).toLocaleDateString() : '';
    const riskPctStr = t.riskPercentage ? `${t.riskPercentage}%` : '';
    const riskAmtStr = t.riskAmount ? `$${Number(t.riskAmount).toFixed(2)}` : '';
    
    // PnL Cobertura %: porcentaje que se terminó perdiendo/ganando
    let hedgePctStr = '';
    if (t.isHedge && t.hedgeTriggered && t.hedgeStatus && t.hedgeStatus !== 'MANAGING') {
      if (t.hedgePnlPercent !== null && t.hedgePnlPercent !== undefined) {
        const n = Number(t.hedgePnlPercent);
        hedgePctStr = `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
      }
    }

    const hedgePnlStr = t.hedgePnl !== null && t.hedgePnl !== undefined ? `$${Number(t.hedgePnl).toFixed(2)}` : '';
    const frozenLossStr = t.frozenLoss ? `$${Number(t.frozenLoss).toFixed(2)}` : '';
    const entryStr = t.entryPrice ? Number(t.entryPrice).toString() : '';
    const sizeStr = t.size ? Number(t.size).toString() : '';
    const exitStr = t.exitPrice ? Number(t.exitPrice).toString() : '';
    const pnlStr = t.pnl !== null && t.pnl !== undefined 
      ? `${Number(t.pnl) >= 0 ? '+' : ''}$${Number(t.pnl).toFixed(2)}` 
      : (t.isHedge && t.hedgeTriggered && t.hedgePnl ? `${Number(t.hedgePnl) >= 0 ? '+' : ''}$${Number(t.hedgePnl).toFixed(2)}` : '');

    const row = [
      t.id,
      dateStr,
      t.symbol,
      t.type,
      t.strategy || '',
      isHedgeStr,
      hedgeStatusStr,
      riskPctStr,
      riskAmtStr,
      hedgePctStr,
      hedgePnlStr,
      frozenLossStr,
      entryStr,
      sizeStr,
      exitStr,
      pnlStr,
      t.status || 'OPEN'
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
