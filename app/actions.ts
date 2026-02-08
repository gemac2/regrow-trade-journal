// app/actions.ts
'use server';

import { db } from '@/app/lib/db';
// CORRECCIÓN: Quitamos 'user' de los imports. Solo usamos tus tablas de negocio.
import { trades, accounts, userProfiles } from '@/db/schema';
import { desc, eq, and, isNotNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// --- ACCOUNT ACTIONS ---

export async function getAccounts(userId: string) {
  try {
    const data = await db.select().from(accounts).where(eq(accounts.userId, userId));
    return { success: true, data };
  } catch (error) {
    return { success: false, data: [] };
  }
}

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

export async function createTrade(formData: FormData) {
  const userId = formData.get('userId') as string;
  const accountId = Number(formData.get('accountId'));
  const symbol = formData.get('symbol') as string;
  const type = formData.get('type') as string;
  const strategy = formData.get('strategy') as string || null;
  const entryPrice = formData.get('entryPrice') as string;
  const size = formData.get('size') as string;
  
  const exitPrice = formData.get('exitPrice') as string || null;
  const stopLoss = formData.get('stopLoss') as string || null;
  const takeProfit = formData.get('takeProfit') as string || null;

  let pnl = null;
  let status = 'OPEN';
  let exitDate = null;

  if (exitPrice) {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const positionSize = parseFloat(size);
    pnl = (exit - entry) * positionSize * (type === 'LONG' ? 1 : -1);
    
    if (pnl > 0) status = 'WIN';
    else if (pnl < 0) status = 'LOSS';
    else status = 'BREAKEVEN';

    exitDate = new Date();
  }

  try {
    await db.insert(trades).values({
      userId,
      accountId,
      symbol: symbol.toUpperCase(),
      type,
      strategy,
      entryPrice,
      exitPrice,
      size,
      pnl: pnl ? pnl.toString() : null,
      stopLoss,
      takeProfit,
      status,
      exitDate,
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Create trade error:", error);
    return { success: false, error: 'Failed to create trade' };
  }
}

export async function updateTrade(formData: FormData) {
    const id = Number(formData.get('tradeId'));
    const symbol = formData.get('symbol') as string;
    const type = formData.get('type') as string;
    const strategy = formData.get('strategy') as string || null;
    const entryPrice = formData.get('entryPrice') as string;
    const size = formData.get('size') as string;
    
    const exitPrice = formData.get('exitPrice') as string || null;
    const stopLoss = formData.get('stopLoss') as string || null;
    const takeProfit = formData.get('takeProfit') as string || null;
    
    let pnl = null;
    let status = 'OPEN';
    let exitDate = null;

    if (exitPrice) {
      const entry = parseFloat(entryPrice);
      const exit = parseFloat(exitPrice);
      const positionSize = parseFloat(size);
      
      pnl = (exit - entry) * positionSize * (type === 'LONG' ? 1 : -1);
      
      if (pnl > 0) status = 'WIN';
      else if (pnl < 0) status = 'LOSS';
      else status = 'BREAKEVEN';

      exitDate = new Date();
    }
  
    try {
      const updateData: any = {
        symbol: symbol.toUpperCase(),
        type,
        strategy,
        entryPrice,
        exitPrice,
        size,
        pnl: pnl ? pnl.toString() : null,
        stopLoss,
        takeProfit,
        status,
      };

      if (exitDate) {
         updateData.exitDate = exitDate;
      }

      await db.update(trades).set(updateData).where(eq(trades.id, id));
  
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

// 6. Get Stats
export async function getStats(userId: string, accountId: number) {
  try {
    const [account] = await db.select().from(accounts)
      .where(and(
        eq(accounts.id, accountId), 
        eq(accounts.userId, userId)
      ));
    
    if (!account) return { success: false, data: null };
    
    const initialBalance = Number(account.initialBalance);

    const closedTrades = await db.select().from(trades)
      .where(and(eq(trades.userId, userId), eq(trades.accountId, accountId), isNotNull(trades.exitPrice)))
      .orderBy(trades.exitDate);

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

export async function getCalendarData(userId: string, accountId: number) {
  try {
    const closedTrades = await db.select({
      exitDate: trades.exitDate,
      pnl: trades.pnl
    })
    .from(trades)
    .where(and(
      eq(trades.userId, userId),
      eq(trades.accountId, accountId),
      isNotNull(trades.exitDate),
      isNotNull(trades.pnl)
    ));

    const dailyData: Record<string, number> = {};

    closedTrades.forEach(trade => {
      if (!trade.exitDate) return;
      const dateKey = new Date(trade.exitDate).toISOString().split('T')[0];
      if (!dailyData[dateKey]) dailyData[dateKey] = 0;
      dailyData[dateKey] += Number(trade.pnl);
    });

    const result = Object.entries(dailyData).map(([date, pnl]) => ({
      date,
      pnl
    }));

    return { success: true, data: result };

  } catch (error) {
    console.error("Calendar data error:", error);
    return { success: false, data: [] };
  }
}

export async function getStrategyStats(userId: string, accountId: number) {
  try {
    const winningTrades = await db.select({
      strategy: trades.strategy,
      pnl: trades.pnl
    })
    .from(trades)
    .where(and(
      eq(trades.userId, userId),
      eq(trades.accountId, accountId),
      isNotNull(trades.pnl),
      isNotNull(trades.strategy)
    ));

    const strategyMap: Record<string, number> = {};

    winningTrades.forEach(t => {
      const pnl = Number(t.pnl);
      if (pnl <= 0) return; 
      const strat = t.strategy || "Unknown";
      if (!strategyMap[strat]) strategyMap[strat] = 0;
      strategyMap[strat] += pnl;
    });

    const result = Object.entries(strategyMap)
      .map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2))
      }))
      .sort((a, b) => b.value - a.value);

    return { success: true, data: result };

  } catch (error) {
    console.error("Strategy stats error:", error);
    return { success: false, data: [] };
  }
}

// --- PROFILE ACTIONS (SIN TABLA USER) ---

// 10. Get User Profile (SOLO PERFIL EXTENDIDO)
export async function getUserProfile(userId: string) {
  try {
    // Solo consultamos userProfiles. 
    // El nombre y email los debes sacar de useAuth() en el cliente.
    const [profile] = await db.select().from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    // Devolvemos lo que encontramos (o null si es nuevo)
    // El cliente mezclará esto con los datos de la sesión.
    if (!profile) return { success: false, data: null };

    return { success: true, data: profile };
  } catch (error) {
    console.error("Get profile error:", error);
    return { success: false, data: null };
  }
}

// 11. Update User Profile (SOLO PERFIL EXTENDIDO)
export async function updateUserProfile(formData: FormData) {
  const userId = formData.get('userId') as string;
  // Nota: Ya no actualizamos el 'name' aquí porque está en la tabla 'user' que no importamos.
  // Si quieres cambiar el nombre, usa authClient.updateUser() en el cliente.
  const bio = formData.get('bio') as string;
  const tradingStyle = formData.get('tradingStyle') as string;
  const location = formData.get('location') as string;

  try {
    // Solo hacemos Upsert en userProfiles
    await db.insert(userProfiles).values({
      userId: userId,
      bio,
      tradingStyle,
      location,
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        bio,
        tradingStyle,
        location,
        updatedAt: new Date()
      }
    });

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}