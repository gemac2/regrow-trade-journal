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

// --- TRADE ACTIONS (UPDATED) ---

// 3. Get Trades (Now filtered by Account ID)
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

// 4. Create Trade (Receives Account ID)
export async function createTrade(formData: FormData) {
  const userId = formData.get('userId') as string;
  const accountId = Number(formData.get('accountId')); // Critical Update
  const symbol = formData.get('symbol') as string;
  const type = formData.get('type') as string;
  const entryPrice = formData.get('entryPrice') as string;
  const size = formData.get('size') as string;
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
    status = pnl > 0 ? 'WIN' : (pnl < 0 ? 'LOSS' : 'BE');
  }

  try {
    await db.insert(trades).values({
      userId,
      accountId, // Link to account
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
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed' };
  }
}

// 5. Update Trade (Logic remains mostly same, just ensure imports are correct)
export async function updateTrade(formData: FormData) {
    const id = Number(formData.get('tradeId'));
    // ... (Copia la lógica de updateTrade que ya tenías, no cambia mucho)
    // Solo asegúrate de recalcular PnL si hay exitPrice
    // ...
    // Aquí pondré una versión simplificada, usa la tuya completa
    const exitPrice = formData.get('exitPrice') as string;
    // ... calculos ...
    await db.update(trades).set({ /* campos */ }).where(eq(trades.id, id));
    revalidatePath('/');
    return { success: true };
}

export async function deleteTrade(id: number) {
    await db.delete(trades).where(eq(trades.id, id));
    revalidatePath('/');
    return { success: true };
}

// 6. Get Stats (UPDATED to use Account Initial Balance)
export async function getStats(userId: string, accountId: number) {
  try {
    // A. Get Account Balance
    const [account] = await db.select().from(accounts).where(eq(accounts.id, accountId));
    if (!account) return { success: false, data: null };
    
    const initialBalance = Number(account.initialBalance);

    // B. Get Trades for THIS account
    const closedTrades = await db.select().from(trades)
      .where(and(eq(trades.userId, userId), eq(trades.accountId, accountId), isNotNull(trades.exitPrice)))
      .orderBy(trades.exitDate);

    // C. Calculate
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
    return { success: false, data: null };
  }
}

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