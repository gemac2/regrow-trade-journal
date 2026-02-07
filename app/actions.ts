// app/actions.ts
'use server';

import { db } from './lib/db';
import { trades } from '@/db/schema';
import { eq, and, isNotNull, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// 1. Get all trades for a user
export async function getTrades(userId: string) {
  try {
    const data = await db.select().from(trades)
      .where(eq(trades.userId, userId))
      .orderBy(desc(trades.entryDate));
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching trades:', error);
    return { success: false, data: [] };
  }
}

// 2. Create a new trade
export async function createTrade(formData: FormData) {
  const userId = formData.get('userId') as string;
  const symbol = formData.get('symbol') as string;
  const type = formData.get('type') as string;
  const entryPrice = formData.get('entryPrice') as string;
  const size = formData.get('size') as string;
  
  // Optional fields
  const exitPrice = formData.get('exitPrice') as string || null;
  const stopLoss = formData.get('stopLoss') as string || null;
  const takeProfit = formData.get('takeProfit') as string || null;
  const status = formData.get('status') as string || 'OPEN';

  // Calculate simple PnL if there is an exit price (basic logic)
  let pnl = null;
  if (exitPrice) {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const positionSize = parseFloat(size);
    // Simple formula: (Exit - Entry) * Size * (1 if Long, -1 if Short)
    pnl = (exit - entry) * positionSize * (type === 'LONG' ? 1 : -1);
  }

  try {
    await db.insert(trades).values({
      userId,
      symbol: symbol.toUpperCase(),
      type,
      entryPrice,
      exitPrice,
      size,
      pnl: pnl ? pnl.toString() : null,
      stopLoss,
      takeProfit,
      status,
    });

    revalidatePath('/'); // Reloads the page
    return { success: true };
  } catch (error) {
    console.error('Error creating trade:', error);
    return { success: false, error: 'Failed to create trade' };
  }
}

// 3. Delete a trade
export async function deleteTrade(id: number) {
    try {
        await db.delete(trades).where(eq(trades.id, id));
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

// 4. Get Statistics (New function)
export async function getStats(userId: string) {
  try {
    // Fetch all CLOSED trades (where exitPrice is not null)
    const closedTrades = await db.select().from(trades)
      .where(and(eq(trades.userId, userId), isNotNull(trades.exitPrice)));

    let totalTrades = closedTrades.length;
    let netPnL = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let wins = 0;

    // Calculate metrics loop
    closedTrades.forEach(trade => {
      const pnl = Number(trade.pnl);
      netPnL += pnl;

      if (pnl > 0) {
        grossProfit += pnl;
        wins++;
      } else {
        grossLoss += Math.abs(pnl);
      }
    });

    // Avoid division by zero
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : (grossProfit > 0 ? 999 : 0);

    return {
      success: true,
      data: {
        totalTrades,
        netPnL: netPnL.toFixed(2),
        winRate: winRate.toFixed(1), // One decimal (e.g. 65.5%)
        profitFactor: profitFactor.toFixed(2),
        wins,
        losses: totalTrades - wins
      }
    };

  } catch (error) {
    console.error('Error fetching stats:', error);
    return { success: false, data: null };
  }
}

// 5. Update Trade (New function for Editing/Closing)
export async function updateTrade(formData: FormData) {
  const id = Number(formData.get('tradeId'));
  const symbol = formData.get('symbol') as string;
  const type = formData.get('type') as string;
  const entryPrice = formData.get('entryPrice') as string;
  const size = formData.get('size') as string;
  
  // Optional fields
  const exitPrice = formData.get('exitPrice') as string || null;
  const stopLoss = formData.get('stopLoss') as string || null;
  const takeProfit = formData.get('takeProfit') as string || null;
  
  // Logic: Recalculate PnL if Exit Price exists
  let pnl = null;
  let status = 'OPEN';

  if (exitPrice) {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const positionSize = parseFloat(size);
    
    // PnL Formula
    pnl = (exit - entry) * positionSize * (type === 'LONG' ? 1 : -1);
    
    // Determine Status
    if (pnl > 0) status = 'WIN';
    else if (pnl < 0) status = 'LOSS';
    else status = 'BREAKEVEN';
  }

  try {
    await db.update(trades).set({
      symbol: symbol.toUpperCase(),
      type,
      entryPrice,
      exitPrice,
      size,
      pnl: pnl ? pnl.toString() : null,
      stopLoss,
      takeProfit,
      status,
    }).where(eq(trades.id, id));

    revalidatePath('/'); // Refresh UI
    return { success: true };
  } catch (error) {
    console.error('Error updating trade:', error);
    return { success: false, error: 'Failed to update trade' };
  }
}