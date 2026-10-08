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

export interface ExportStatsParams {
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

// ============================================================================
// EXPORTADOR EXCEL (.xlsx) CON ESTILOS Y COLORES OFICIALES DE REGROW CODE
// ============================================================================
export async function exportStatisticsExcel({ accountName, stats, hedgeData, trades }: ExportStatsParams) {
  // Importación dinámica de ExcelJS para optimizar rendimiento de cliente
  const ExcelJSModule = await import('exceljs');
  const ExcelJS = (ExcelJSModule as any).default || ExcelJSModule;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Regrow Code Trading Journal';
  wb.created = new Date();

  const ws = wb.addWorksheet('Reporte Regrow', {
    views: [{ showGridLines: true }]
  });

  // Paleta oficial Regrow Code (extraída del logo)
  const COLORS = {
    NAVY_DARK: 'FF071738',      // Azul marino profundo
    ROYAL_BLUE: 'FF002BDC',     // Azul royal vibrante de "re" y "row"
    ELECTRIC_GREEN: 'FF00E676', // Verde brillante del símbolo < > y la letra "G"
    CYAN_BLUE: 'FF00C0F9',      // Azul cian / celeste de los diamantes del logo
    SLATE_HEADER: 'FF0B216D',   // Azul marino medio para cabeceras
    LIGHT_BG: 'FFF4F7FC',       // Fondo de fila alterno
    WHITE: 'FFFFFFFF',
    TEXT_DARK: 'FF1A202C',
    TEXT_MUTED: 'FF718096',
    BORDER_LIGHT: 'FFE2E8F0',
    
    // Status badges
    WIN_BG: 'FFE6F9ED',
    WIN_TEXT: 'FF0B7A3B',
    LOSS_BG: 'FFFDE8E8',
    LOSS_TEXT: 'FFC53030',
    BE_BG: 'FFFEF9E7',
    BE_TEXT: 'FFB7791F',
    CYAN_BG: 'FFE6F8FD',
    CYAN_TEXT: 'FF0284C7',
    AMBER_BG: 'FFFFF3E0',
    AMBER_TEXT: 'FFD97706'
  };

  const thinBorder = {
    top: { style: 'thin' as const, color: { argb: COLORS.BORDER_LIGHT } },
    left: { style: 'thin' as const, color: { argb: COLORS.BORDER_LIGHT } },
    bottom: { style: 'thin' as const, color: { argb: COLORS.BORDER_LIGHT } },
    right: { style: 'thin' as const, color: { argb: COLORS.BORDER_LIGHT } }
  };

  // --- FILA 1: BANNER PRINCIPAL REGROW CODE ---
  ws.mergeCells('A1:R1');
  const bannerCell = ws.getCell('A1');
  bannerCell.value = 'REGROW CODE • TRADING JOURNAL & HEDGE ANALYTICS';
  bannerCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: COLORS.WHITE } };
  bannerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.NAVY_DARK } };
  bannerCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(1).height = 36;

  // --- FILA 2: LÍNEA DE ACENTO VERDE REGROW ---
  ws.mergeCells('A2:R2');
  const accentCell = ws.getCell('A2');
  accentCell.value = `Reporte Oficial de Rendimiento y Coberturas • Cuenta: ${accountName}`;
  accentCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.NAVY_DARK } };
  accentCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.ELECTRIC_GREEN } };
  accentCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(2).height = 20;

  // Fila 3: Espaciador
  ws.addRow([]);

  // =========================================================================
  // TABLA 1: RESUMEN GENERAL DE LA CUENTA
  // =========================================================================
  const t1TitleRow = ws.addRow(['TABLA 1: RESUMEN GENERAL DE LA CUENTA']);
  ws.mergeCells(`A${t1TitleRow.number}:C${t1TitleRow.number}`);
  const t1Title = ws.getCell(`A${t1TitleRow.number}`);
  t1Title.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.WHITE } };
  t1Title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SLATE_HEADER } };
  t1Title.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  t1TitleRow.height = 24;

  const t1Header = ws.addRow(['MÉTRICA', 'VALOR', 'DESCRIPCIÓN']);
  t1Header.height = 22;
  t1Header.eachCell((cell: any) => {
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.ROYAL_BLUE } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = thinBorder;
  });

  const now = new Date();
  const exportDate = `${formatDate(now)} ${formatTime(now)}`;

  const t1Data: [string, string, string][] = [
    ['Cuenta', accountName, 'Cuenta de trading seleccionada'],
    ['Fecha del Reporte', exportDate, 'Fecha y hora de exportación del informe'],
  ];

  if (stats) {
    t1Data.push(
      ['Balance Inicial', `$${stats.initialBalance}`, 'Capital con el que inició la cuenta'],
      ['Balance Actual', `$${stats.currentBalance}`, 'Capital actual en tiempo real'],
      ['Net PnL Total', `${Number(stats.netPnL) >= 0 ? '+' : ''}$${stats.netPnL}`, 'Beneficio o pérdida total acumulada'],
      ['Win Rate Global', `${stats.winRate}%`, 'Tasa de acierto de operaciones cerradas'],
      ['Profit Factor', stats.profitFactor, 'Ratio ganancia bruta / pérdida bruta'],
      ['Total Operaciones', String(stats.totalTrades), 'Cantidad de operaciones registradas']
    );
  }

  t1Data.forEach((row, i) => {
    const r = ws.addRow(row);
    r.height = 20;
    r.eachCell((cell: any, colNum: number) => {
      cell.border = thinBorder;
      cell.font = { name: 'Calibri', size: 10, color: { argb: COLORS.TEXT_DARK } };
      if (i % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.LIGHT_BG } };
      }
      if (colNum === 1) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.ROYAL_BLUE } };
      }
      if (colNum === 2) {
        cell.alignment = { horizontal: 'center' };
        cell.font = { name: 'Calibri', size: 10, bold: true };
        if (row[0].includes('PnL')) {
          const val = row[1];
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: val.startsWith('+') ? COLORS.WIN_TEXT : val.startsWith('-') ? COLORS.LOSS_TEXT : COLORS.TEXT_DARK } };
        }
      }
    });
  });

  ws.addRow([]); // Espaciador

  // =========================================================================
  // TABLA 2: ESTADÍSTICAS DE COBERTURA (HEDGE ANALYTICS)
  // =========================================================================
  if (hedgeData) {
    const t2TitleRow = ws.addRow(['TABLA 2: ESTADÍSTICAS DE COBERTURA (HEDGE ANALYTICS)']);
    ws.mergeCells(`A${t2TitleRow.number}:E${t2TitleRow.number}`);
    const t2Title = ws.getCell(`A${t2TitleRow.number}`);
    t2Title.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.WHITE } };
    t2Title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SLATE_HEADER } };
    t2Title.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    t2TitleRow.height = 24;

    const t2Header = ws.addRow(['CATEGORÍA DE COBERTURA', 'CANTIDAD OPERACIONES', 'RATIO / %', 'MONTO DINERO ($)', 'DESCRIPCIÓN']);
    t2Header.height = 22;
    t2Header.eachCell((cell: any) => {
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.WHITE } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.ROYAL_BLUE } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = thinBorder;
    });

    const t2Data = [
      ['Total Modo Hedge', `${hedgeData.totalHedgeTrades} ops`, '100.0%', '-', 'Total de operaciones configuradas con cobertura'],
      ['No Tocaron Cobertura', `${hedgeData.notTriggeredCount} ops`, `${hedgeData.notTriggeredRate}%`, '-', 'Operaciones directas que no requirieron abrir orden hedge'],
      ['Coberturas Ganadas', `${hedgeData.winCount} ops`, `${hedgeData.winRate}% Win`, `+$${hedgeData.totalHedgeWinsPnl}`, 'Coberturas cerradas donde la gestión generó ganancia neta'],
      ['Coberturas Perdidas', `${hedgeData.lossCount} ops`, `${hedgeData.lossRate}% Loss`, `-$${hedgeData.totalHedgeLossesPnl}`, 'Coberturas cerradas que resultaron en pérdida controlada'],
      ['A Break Even (BE)', `${hedgeData.breakevenCount} ops`, `${hedgeData.breakevenRate}% BE`, '$0.00', 'Coberturas cerradas en punto de equilibrio sin pérdidas'],
    ];

    if (hedgeData.managingCount && hedgeData.managingCount > 0) {
      t2Data.push(['En Gestión Activa', `${hedgeData.managingCount} ops`, `${hedgeData.managingRate || '0.0'}%`, `-$${hedgeData.totalManagingFrozenLoss || '0.00'} Flotante`, 'Coberturas activas con flotante negativo descontado']);
    }

    t2Data.push(
      ['PnL Neto de Coberturas', '-', '-', `${Number(hedgeData.totalHedgePnl) >= 0 ? '+' : ''}$${hedgeData.totalHedgePnl}`, 'Suma directa neta de impacto en el journal (Ganadas - Perdidas)'],
      ['Riesgo Promedio Efectivo', '-', `${hedgeData.avgRiskPercent}%`, '-', 'Promedio considerando el % real perdido/ganado en coberturas cerradas']
    );

    if (hedgeData.initialAvgRiskPercent) {
      t2Data.push(['Riesgo Inicial Teórico', '-', `${hedgeData.initialAvgRiskPercent}%`, '-', 'Promedio del riesgo programado originalmente en las órdenes']);
    }

    t2Data.forEach((row, i) => {
      const r = ws.addRow(row);
      r.height = 20;
      r.eachCell((cell: any, colNum: number) => {
        cell.border = thinBorder;
        cell.font = { name: 'Calibri', size: 10, color: { argb: COLORS.TEXT_DARK } };
        if (i % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.LIGHT_BG } };
        }
        if (colNum === 1) {
          cell.font = { name: 'Calibri', size: 10, bold: true };
        }
        if (colNum >= 2 && colNum <= 4) {
          cell.alignment = { horizontal: 'center' };
          if (row[0].includes('Ganadas') && colNum === 4) {
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.WIN_TEXT } };
          } else if (row[0].includes('Perdidas') && colNum === 4) {
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.LOSS_TEXT } };
          } else if (row[0].includes('PnL Neto') && colNum === 4) {
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: row[3].startsWith('+') ? COLORS.WIN_TEXT : COLORS.LOSS_TEXT } };
          }
        }
      });
    });

    ws.addRow([]); // Espaciador
  }

  // =========================================================================
  // TABLA 3: REGISTRO DETALLADO DE OPERACIONES (18 COLUMNAS EXACTAS)
  // =========================================================================
  const t3TitleRow = ws.addRow(['TABLA 3: REGISTRO DETALLADO DE OPERACIONES']);
  ws.mergeCells(`A${t3TitleRow.number}:R${t3TitleRow.number}`);
  const t3Title = ws.getCell(`A${t3TitleRow.number}`);
  t3Title.font = { name: 'Calibri', size: 12, bold: true, color: { argb: COLORS.WHITE } };
  t3Title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.NAVY_DARK } };
  t3Title.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  t3TitleRow.height = 26;

  const cols = [
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
  ];

  const t3Header = ws.addRow(cols);
  t3Header.height = 26;
  t3Header.eachCell((cell: any) => {
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.ROYAL_BLUE } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = thinBorder;
  });

  // Ordenar operaciones cronológicamente de forma ascendente
  const sortedTrades = [...trades].sort((a, b) => {
    const rawDateA = a.entryDate || a.entry_date;
    const rawDateB = b.entryDate || b.entry_date;
    const dateA = rawDateA ? new Date(rawDateA).getTime() : 0;
    const dateB = rawDateB ? new Date(rawDateB).getTime() : 0;
    return dateA - dateB;
  });

  sortedTrades.forEach((t, index) => {
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
    const status = (t.status as string) || (isHedge && hedgeTriggered && hedgeStatus ? hedgeStatus : 'OPEN');

    const symbolStr = (t.symbol as string) || '-';
    const typeStr = (t.type as string) || '-';
    const strategyStr = (t.strategy as string) || '-';
    const entryPriceStr = entryPrice !== null && entryPrice !== undefined && entryPrice !== '' ? Number(entryPrice).toString() : '-';
    const exitPriceStr = exitPrice !== null && exitPrice !== undefined && exitPrice !== '' ? Number(exitPrice).toString() : '-';
    const sizeStr = size !== null && size !== undefined && size !== '' ? Number(size).toString() : '-';
    const riskPctStr = riskPercentage !== null && riskPercentage !== undefined && riskPercentage !== '' ? `${Number(riskPercentage).toFixed(2)}%` : '-';
    const riskAmtStr = riskAmount !== null && riskAmount !== undefined && riskAmount !== '' ? `$${Number(riskAmount).toFixed(2)}` : '-';

    let estadoCoberturaStr = '-';
    if (!isHedge) estadoCoberturaStr = 'Sin Cobertura (No Hedge)';
    else if (!hedgeTriggered || hedgeStatus === 'NOT_TRIGGERED') estadoCoberturaStr = 'No tocó cobertura';
    else if (hedgeStatus === 'MANAGING') estadoCoberturaStr = 'En Gestión Activa';
    else if (hedgeStatus === 'WIN') estadoCoberturaStr = 'Ganada (WIN)';
    else if (hedgeStatus === 'LOSS') estadoCoberturaStr = 'Perdida (LOSS)';
    else if (hedgeStatus === 'BREAKEVEN') estadoCoberturaStr = 'Break Even (BE)';

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

    let pnlFinalCobStr = '-';
    if (isHedge && hedgeTriggered && hedgePnl !== null && hedgePnl !== undefined && hedgePnl !== '') {
      pnlFinalCobStr = `${Number(hedgePnl) >= 0 ? '+' : ''}$${Number(hedgePnl).toFixed(2)}`;
    }

    let pnlTotalStr = '-';
    if (pnl !== null && pnl !== undefined && pnl !== '') {
      pnlTotalStr = `${Number(pnl) >= 0 ? '+' : ''}$${Number(pnl).toFixed(2)}`;
    } else if (isHedge && hedgeTriggered && hedgePnl !== null && hedgePnl !== undefined && hedgePnl !== '') {
      pnlTotalStr = `${Number(hedgePnl) >= 0 ? '+' : ''}$${Number(hedgePnl).toFixed(2)}`;
    }

    const fechaStr = formatDate(entryDate);
    const horaAperturaStr = formatTime(entryDate);
    let horaCierreStr = '-';
    if (exitDate) horaCierreStr = formatTime(exitDate);
    else if (status === 'OPEN' || hedgeStatus === 'MANAGING') horaCierreStr = 'En curso';

    let duracionTradeStr = '-';
    if (entryDate && exitDate) {
      duracionTradeStr = formatDuration(new Date(exitDate).getTime() - new Date(entryDate).getTime());
    } else if (entryDate && (status === 'OPEN' || hedgeStatus === 'MANAGING')) {
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
      status,
      fechaStr,
      horaAperturaStr,
      horaCierreStr,
      duracionTradeStr
    ];

    const r = ws.addRow(row);
    r.height = 22;
    r.eachCell((cell: any, colNum: number) => {
      cell.border = thinBorder;
      cell.font = { name: 'Calibri', size: 10, color: { argb: COLORS.TEXT_DARK } };
      if (index % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.LIGHT_BG } };
      }

      // 1. ID
      if (colNum === 1) {
        cell.alignment = { horizontal: 'center' };
        cell.font = { name: 'Calibri', size: 10, bold: true };
      }
      // 2. Símbolo
      if (colNum === 2) {
        cell.alignment = { horizontal: 'center' };
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.ROYAL_BLUE } };
      }
      // 3. Tipo (LONG / SHORT)
      if (colNum === 3) {
        cell.alignment = { horizontal: 'center' };
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: typeStr === 'LONG' ? COLORS.WIN_TEXT : COLORS.LOSS_TEXT } };
      }
      // Precios y tamaños
      if ([5, 6, 7, 8, 9].includes(colNum)) {
        cell.alignment = { horizontal: 'right' };
      }
      // 10. Estado Cobertura
      if (colNum === 10) {
        cell.alignment = { horizontal: 'center' };
        if (estadoCoberturaStr.includes('LOSS')) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.LOSS_BG } };
          cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: COLORS.LOSS_TEXT } };
        } else if (estadoCoberturaStr.includes('WIN')) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.WIN_BG } };
          cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: COLORS.WIN_TEXT } };
        } else if (estadoCoberturaStr.includes('No tocó')) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.CYAN_BG } };
          cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: COLORS.CYAN_TEXT } };
        } else if (estadoCoberturaStr.includes('Gestión')) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.AMBER_BG } };
          cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: COLORS.AMBER_TEXT } };
        }
      }
      // 11. Riesgo Final Cobertura %
      if (colNum === 11) {
        cell.alignment = { horizontal: 'right' };
        if (riesgoFinalCobStr.startsWith('-')) {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.LOSS_TEXT } };
        } else if (riesgoFinalCobStr.startsWith('+')) {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.WIN_TEXT } };
        }
      }
      // 12. PnL Final Cobertura $ & 13. PnL Total
      if ([12, 13].includes(colNum)) {
        cell.alignment = { horizontal: 'right' };
        const val = String(cell.value);
        if (val.includes('-')) {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.LOSS_TEXT } };
        } else if (val.includes('+')) {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.WIN_TEXT } };
        }
      }
      // 14. Resultado
      if (colNum === 14) {
        cell.alignment = { horizontal: 'center' };
        if (status === 'WIN') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.WIN_BG } };
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.WIN_TEXT } };
        } else if (status === 'LOSS') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.LOSS_BG } };
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.LOSS_TEXT } };
        } else if (status === 'BREAKEVEN') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.BE_BG } };
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.BE_TEXT } };
        }
      }
      // Fechas y horas
      if ([15, 16, 17, 18].includes(colNum)) {
        cell.alignment = { horizontal: 'center' };
      }
    });
  });

  // Ajuste automático de anchos de columnas
  const colWidths = [8, 14, 10, 18, 15, 15, 14, 16, 14, 22, 22, 20, 14, 14, 13, 16, 16, 15];
  colWidths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  // Descarga directa en navegador
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  const safeAccountName = accountName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const dateFormatted = new Date().toISOString().split('T')[0];
  const filename = `reporte_regrow_${safeAccountName}_${dateFormatted}.xlsx`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// EXPORTADOR CSV PLANO (.csv) CON LAS 3 TABLAS
// ============================================================================
export function exportStatisticsCSV({ accountName, stats, hedgeData, trades }: ExportStatsParams) {
  const lines: string[] = [];
  const now = new Date();
  const exportDate = `${formatDate(now)} ${formatTime(now)}`;

  // TABLA 1: RESUMEN GENERAL DE LA CUENTA
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
    lines.push(['Total Operaciones', String(stats.totalTrades), 'Cantidad de operaciones registradas'].map(escapeCsv).join(','));
  }
  lines.push('');

  // TABLA 2: ESTADÍSTICAS DE COBERTURA (HEDGE ANALYTICS)
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

  // TABLA 3: REGISTRO DETALLADO DE OPERACIONES
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

  const sortedTrades = [...trades].sort((a, b) => {
    const rawDateA = a.entryDate || a.entry_date;
    const rawDateB = b.entryDate || b.entry_date;
    const dateA = rawDateA ? new Date(rawDateA).getTime() : 0;
    const dateB = rawDateB ? new Date(rawDateB).getTime() : 0;
    return dateA - dateB;
  });

  sortedTrades.forEach((t, index) => {
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
    const status = (t.status as string) || (isHedge && hedgeTriggered && hedgeStatus ? hedgeStatus : 'OPEN');

    const symbolStr = (t.symbol as string) || '-';
    const typeStr = (t.type as string) || '-';
    const strategyStr = (t.strategy as string) || '-';
    const entryPriceStr = entryPrice !== null && entryPrice !== undefined && entryPrice !== '' ? Number(entryPrice).toString() : '-';
    const exitPriceStr = exitPrice !== null && exitPrice !== undefined && exitPrice !== '' ? Number(exitPrice).toString() : '-';
    const sizeStr = size !== null && size !== undefined && size !== '' ? Number(size).toString() : '-';
    const riskPctStr = riskPercentage !== null && riskPercentage !== undefined && riskPercentage !== '' ? `${Number(riskPercentage).toFixed(2)}%` : '-';
    const riskAmtStr = riskAmount !== null && riskAmount !== undefined && riskAmount !== '' ? `$${Number(riskAmount).toFixed(2)}` : '-';

    let estadoCoberturaStr = '-';
    if (!isHedge) estadoCoberturaStr = 'Sin Cobertura (No Hedge)';
    else if (!hedgeTriggered || hedgeStatus === 'NOT_TRIGGERED') estadoCoberturaStr = 'No tocó cobertura';
    else if (hedgeStatus === 'MANAGING') estadoCoberturaStr = 'En Gestión Activa';
    else if (hedgeStatus === 'WIN') estadoCoberturaStr = 'Ganada (WIN)';
    else if (hedgeStatus === 'LOSS') estadoCoberturaStr = 'Perdida (LOSS)';
    else if (hedgeStatus === 'BREAKEVEN') estadoCoberturaStr = 'Break Even (BE)';

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

    let pnlFinalCobStr = '-';
    if (isHedge && hedgeTriggered && hedgePnl !== null && hedgePnl !== undefined && hedgePnl !== '') {
      pnlFinalCobStr = `${Number(hedgePnl) >= 0 ? '+' : ''}$${Number(hedgePnl).toFixed(2)}`;
    }

    let pnlTotalStr = '-';
    if (pnl !== null && pnl !== undefined && pnl !== '') {
      pnlTotalStr = `${Number(pnl) >= 0 ? '+' : ''}$${Number(pnl).toFixed(2)}`;
    } else if (isHedge && hedgeTriggered && hedgePnl !== null && hedgePnl !== undefined && hedgePnl !== '') {
      pnlTotalStr = `${Number(hedgePnl) >= 0 ? '+' : ''}$${Number(hedgePnl).toFixed(2)}`;
    }

    const fechaStr = formatDate(entryDate);
    const horaAperturaStr = formatTime(entryDate);
    let horaCierreStr = '-';
    if (exitDate) horaCierreStr = formatTime(exitDate);
    else if (status === 'OPEN' || hedgeStatus === 'MANAGING') horaCierreStr = 'En curso';

    let duracionTradeStr = '-';
    if (entryDate && exitDate) {
      duracionTradeStr = formatDuration(new Date(exitDate).getTime() - new Date(entryDate).getTime());
    } else if (entryDate && (status === 'OPEN' || hedgeStatus === 'MANAGING')) {
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
      status,
      fechaStr,
      horaAperturaStr,
      horaCierreStr,
      duracionTradeStr
    ];

    lines.push(row.map(escapeCsv).join(','));
  });

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
