// app/actions.ts
'use server';

import { db } from '@/app/lib/db';
import { trades, accounts } from '@/db/schema';
import { desc, eq, and, isNotNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// --- ACCOUNT ACTIONS ---

// 1. Get all accounts for a user
export async function getAccounts(userId: string) {
  try {
    const data = await db.select().from(accounts).where(eq(accounts.userId, userId));
    return { success: true, data };
  } catch (error) {
    return { success: false, data: [] };
  }
}

// 2. Create a new account
export async function createAccount(userId: string, name: string, balance: string) {
  try {
    const [newAcc] = await db.insert(accounts).values({
      userId,
      name,
      initialBalance: balance
    }).returning();
    revalidatePath('/');
    return { success: true, data: newAcc };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to create account' };
  }
}

// --- TRADE ACTIONS ---

// 3. Get Trades (Filtered by Account ID & User ID)
export async function getTrades(userId: string, accountId: number) {
  try {
    const data = await db.select().from(trades)
      .where(and(eq(trades.userId, userId), eq(trades.accountId, accountId)))
      .orderBy(desc(trades.entryDate));
    return { success: true, data };
  } catch (error) {
    return { success: false, data: [] };
  }
}

// 4. Create Trade (UPDATED WITH STRATEGY)
export async function createTrade(formData: FormData) {
  const userId = formData.get('userId') as string;
  const accountId = Number(formData.get('accountId'));
  const symbol = formData.get('symbol') as string;
  const type = formData.get('type') as string;
  const strategy = formData.get('strategy') as string || null; // <--- NUEVO: Capturar estrategia
  const entryPrice = formData.get('entryPrice') as string;
  const size = formData.get('size') as string;
  
  // Optional fields
  const exitPrice = formData.get('exitPrice') as string || null;
  const stopLoss = formData.get('stopLoss') as string || null;
  const takeProfit = formData.get('takeProfit') as string || null;

  let pnl = null;
  let status = 'OPEN';

  if (exitPrice) {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const positionSize = parseFloat(size);
    // PnL Formula: (Exit - Entry) * Size * (1 if Long, -1 if Short)
    pnl = (exit - entry) * positionSize * (type === 'LONG' ? 1 : -1);
    
    // Determine Status
    if (pnl > 0) status = 'WIN';
    else if (pnl < 0) status = 'LOSS';
    else status = 'BREAKEVEN';
  }

  try {
    await db.insert(trades).values({
      userId,
      accountId,
      symbol: symbol.toUpperCase(),
      type,
      strategy, // <--- NUEVO: Guardar estrategia
      entryPrice,
      exitPrice,
      size,
      pnl: pnl ? pnl.toString() : null,
      stopLoss,
      takeProfit,
      status,
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Create trade error:", error);
    return { success: false, error: 'Failed to create trade' };
  }
}

// 5. Update Trade (UPDATED WITH STRATEGY)
export async function updateTrade(formData: FormData) {
    const id = Number(formData.get('tradeId'));
    const symbol = formData.get('symbol') as string;
    const type = formData.get('type') as string;
    const strategy = formData.get('strategy') as string || null; // <--- NUEVO: Capturar estrategia
    const entryPrice = formData.get('entryPrice') as string;
    const size = formData.get('size') as string;
    
    // Optional fields
    const exitPrice = formData.get('exitPrice') as string || null;
    const stopLoss = formData.get('stopLoss') as string || null;
    const takeProfit = formData.get('takeProfit') as string || null;
    
    let pnl = null;
    let status = 'OPEN';
  
    if (exitPrice) {
      const entry = parseFloat(entryPrice);
      const exit = parseFloat(exitPrice);
      const positionSize = parseFloat(size);
      
      pnl = (exit - entry) * positionSize * (type === 'LONG' ? 1 : -1);
      
      if (pnl > 0) status = 'WIN';
      else if (pnl < 0) status = 'LOSS';
      else status = 'BREAKEVEN';
    }
  
    try {
      await db.update(trades).set({
        symbol: symbol.toUpperCase(),
        type,
        strategy, // <--- NUEVO: Actualizar estrategia
        entryPrice,
        exitPrice,
        size,
        pnl: pnl ? pnl.toString() : null,
        stopLoss,
        takeProfit,
        status,
      }).where(eq(trades.id, id));
  
      revalidatePath('/');
      return { success: true };
    } catch (error) {
      console.error('Error updating trade:', error);
      return { success: false, error: 'Failed to update trade' };
    }
  }

export async function deleteTrade(id: number) {
    try {
        await db.delete(trades).where(eq(trades.id, id));
        revalidatePath('/');
        return { success: true };
    } catch(error) {
        return { success: false, error: 'Failed to delete' };
    }
}

// 6. Get Stats (SECURED)
export async function getStats(userId: string, accountId: number) {
  try {
    // A. Get Account Balance SECURELY
    const [account] = await db.select().from(accounts)
      .where(and(
        eq(accounts.id, accountId), 
        eq(accounts.userId, userId)
      ));
    
    if (!account) return { success: false, data: null };
    
    const initialBalance = Number(account.initialBalance);

    // B. Get Trades for THIS account
    const closedTrades = await db.select().from(trades)
      .where(and(eq(trades.userId, userId), eq(trades.accountId, accountId), isNotNull(trades.exitPrice)))
      .orderBy(trades.exitDate);

    // C. Calculate Metrics
    let netPnL = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let wins = 0;
    
    const chartData = [{ date: 'Start', balance: initialBalance, pnl: 0 }];
    let currentBalance = initialBalance;

    closedTrades.forEach(trade => {
      const pnl = Number(trade.pnl);
      netPnL += pnl;
      currentBalance += pnl;

      if (pnl > 0) { grossProfit += pnl; wins++; } 
      else { grossLoss += Math.abs(pnl); }

      chartData.push({
        date: trade.exitDate ? new Date(trade.exitDate).toLocaleDateString() : 'N/A',
        balance: Number(currentBalance.toFixed(2)),
        pnl: pnl
      });
    });

    const totalTrades = closedTrades.length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : (grossProfit > 0 ? 999 : 0);

    return {
      success: true,
      data: {
        totalTrades,
        netPnL: netPnL.toFixed(2),
        winRate: winRate.toFixed(1),
        profitFactor: profitFactor.toFixed(2),
        currentBalance: currentBalance.toFixed(2),
        initialBalance: initialBalance.toString(),
        chartData,
        wins,
        losses: totalTrades - wins
      }
    };
  } catch (error) {
    console.error(error);
    return { success: false, data: null };
  }
}

// 7. Update Initial Balance (Secured)
export async function updateInitialBalance(userId: string, accountId: number, newBalance: string) {
  try {
    await db.update(accounts)
      .set({ initialBalance: newBalance })
      .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)));

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating balance:', error);
    return { success: false, error: 'Failed to update balance' };
  }
}