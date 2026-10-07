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

  // Hedge Mode Fields
  const isHedge = formData.get('isHedge') === 'true';
  const riskPercentage = (formData.get('riskPercentage') as string) || null;
  const riskAmount = (formData.get('riskAmount') as string) || null;
  const hedgeTriggered = isHedge ? formData.get('hedgeTriggered') === 'true' : false;
  const hedgeStatus = isHedge ? ((formData.get('hedgeStatus') as string) || (hedgeTriggered ? 'WIN' : 'NOT_TRIGGERED')) : null;
  const hedgePnl = isHedge && hedgeTriggered ? ((formData.get('hedgePnl') as string) || null) : null;
  const hedgePnlPercent = isHedge && hedgeTriggered ? ((formData.get('hedgePnlPercent') as string) || null) : null;

  let pnl = null;
  let status = 'OPEN';
  let exitDate: Date | null = null;

  if (exitPrice && hedgeStatus !== 'MANAGING') {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const positionSize = parseFloat(size);
    let totalPnl = (exit - entry) * positionSize * (type === 'LONG' ? 1 : -1);

    // Sumar el resultado de la cobertura al PnL total del trade si aplica
    if (isHedge && hedgeTriggered && hedgePnl) {
      const extraHedgePnl = parseFloat(hedgePnl);
      if (!isNaN(extraHedgePnl)) {
        totalPnl += extraHedgePnl;
      }
    }
    
    pnl = totalPnl;
    
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
      exitPrice: hedgeStatus === 'MANAGING' ? null : exitPrice,
      size,
      pnl: hedgeStatus === 'MANAGING' ? null : (pnl !== null ? pnl.toString() : null),
      stopLoss,
      takeProfit,
      status: hedgeStatus === 'MANAGING' ? 'OPEN' : status,
      exitDate: hedgeStatus === 'MANAGING' ? null : exitDate,
      isHedge,
      riskPercentage,
      riskAmount,
      hedgeTriggered,
      hedgeStatus,
      hedgePnl: hedgeStatus === 'MANAGING' ? null : hedgePnl,
      hedgePnlPercent: hedgeStatus === 'MANAGING' ? null : hedgePnlPercent,
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

    // Hedge Mode Fields
    const isHedge = formData.get('isHedge') === 'true';
    const riskPercentage = (formData.get('riskPercentage') as string) || null;
    const riskAmount = (formData.get('riskAmount') as string) || null;
    const hedgeTriggered = isHedge ? formData.get('hedgeTriggered') === 'true' : false;
    const hedgeStatus = isHedge ? ((formData.get('hedgeStatus') as string) || (hedgeTriggered ? 'WIN' : 'NOT_TRIGGERED')) : null;
    const hedgePnl = isHedge && hedgeTriggered ? ((formData.get('hedgePnl') as string) || null) : null;
    const hedgePnlPercent = isHedge && hedgeTriggered ? ((formData.get('hedgePnlPercent') as string) || null) : null;
    
    let pnl = null;
    let status = 'OPEN';
    let exitDate: Date | null = null;

    if (exitPrice && hedgeStatus !== 'MANAGING') {
      const entry = parseFloat(entryPrice);
      const exit = parseFloat(exitPrice);
      const positionSize = parseFloat(size);
      
      let totalPnl = (exit - entry) * positionSize * (type === 'LONG' ? 1 : -1);

      if (isHedge && hedgeTriggered && hedgePnl) {
        const extraHedgePnl = parseFloat(hedgePnl);
        if (!isNaN(extraHedgePnl)) {
          totalPnl += extraHedgePnl;
        }
      }

      pnl = totalPnl;
      
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
        exitPrice: hedgeStatus === 'MANAGING' ? null : exitPrice,
        size,
        pnl: hedgeStatus === 'MANAGING' ? null : (pnl !== null ? pnl.toString() : null),
        stopLoss,
        takeProfit,
        status: hedgeStatus === 'MANAGING' ? 'OPEN' : status,
        exitDate: hedgeStatus === 'MANAGING' ? null : (exitPrice ? exitDate : null),
        isHedge,
        riskPercentage,
        riskAmount,
        hedgeTriggered,
        hedgeStatus,
        hedgePnl: hedgeStatus === 'MANAGING' ? null : hedgePnl,
        hedgePnlPercent: hedgeStatus === 'MANAGING' ? null : hedgePnlPercent,
      };

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

    // Trades currently being managed in Hedge Mode (cobertura activada y en gestión)
    const managingTrades = await db.select().from(trades)
      .where(and(
        eq(trades.userId, userId), 
        eq(trades.accountId, accountId),
        eq(trades.isHedge, true),
        eq(trades.hedgeTriggered, true),
        eq(trades.hedgeStatus, 'MANAGING')
      ));

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

    // Calcular la cantidad congelada que se está perdiendo en coberturas en gestión
    let totalFrozenLoss = 0;
    managingTrades.forEach(trade => {
      let loss = 0;
      if (trade.riskAmount && !isNaN(Number(trade.riskAmount)) && Number(trade.riskAmount) > 0) {
        loss = Number(trade.riskAmount);
      } else if (trade.hedgePnl && !isNaN(Number(trade.hedgePnl)) && Number(trade.hedgePnl) !== 0) {
        loss = Math.abs(Number(trade.hedgePnl));
      } else if (trade.entryPrice && trade.stopLoss && trade.size) {
        const entry = Number(trade.entryPrice);
        const sl = Number(trade.stopLoss);
        const sz = Number(trade.size);
        if (!isNaN(entry) && !isNaN(sl) && !isNaN(sz)) {
          loss = Math.abs(entry - sl) * sz;
        }
      }
      totalFrozenLoss += loss;
    });

    // Descontar la pérdida congelada del saldo actual de la cuenta
    currentBalance -= totalFrozenLoss;

    if (totalFrozenLoss > 0) {
      chartData.push({
        date: 'En Gestión',
        balance: Number(currentBalance.toFixed(2)),
        pnl: -Number(totalFrozenLoss.toFixed(2))
      });
    }

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
        losses: totalTrades - wins,
        totalFrozenLoss: totalFrozenLoss.toFixed(2),
        managingCount: managingTrades.length
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

// 9. Get Hedge Analytics
export async function getHedgeStats(userId: string, accountId: number) {
  try {
    const hedgeTrades = await db.select()
      .from(trades)
      .where(and(
        eq(trades.userId, userId),
        eq(trades.accountId, accountId),
        eq(trades.isHedge, true)
      ))
      .orderBy(desc(trades.entryDate));

    const totalHedgeTrades = hedgeTrades.length;
    let notTriggeredCount = 0;
    let triggeredCount = 0;
    let winCount = 0;
    let lossCount = 0;
    let breakevenCount = 0;
    let managingCount = 0;
    let totalHedgePnl = 0;
    let totalHedgeWinsPnl = 0;
    let totalHedgeLossesPnl = 0;
    let totalManagingFrozenLoss = 0;
    let sumRiskPercent = 0;
    let countRiskPercent = 0;

    hedgeTrades.forEach(trade => {
      if (trade.riskPercentage) {
        const r = parseFloat(trade.riskPercentage);
        if (!isNaN(r)) {
          sumRiskPercent += r;
          countRiskPercent++;
        }
      }

      if (!trade.hedgeTriggered || trade.hedgeStatus === 'NOT_TRIGGERED') {
        notTriggeredCount++;
      } else {
        triggeredCount++;

        if (trade.hedgeStatus === 'MANAGING') {
          managingCount++;
          let loss = 0;
          if (trade.riskAmount && !isNaN(Number(trade.riskAmount)) && Number(trade.riskAmount) > 0) {
            loss = Number(trade.riskAmount);
          } else if (trade.hedgePnl && !isNaN(Number(trade.hedgePnl)) && Number(trade.hedgePnl) !== 0) {
            loss = Math.abs(Number(trade.hedgePnl));
          } else if (trade.entryPrice && trade.stopLoss && trade.size) {
            const entry = Number(trade.entryPrice);
            const sl = Number(trade.stopLoss);
            const sz = Number(trade.size);
            if (!isNaN(entry) && !isNaN(sl) && !isNaN(sz)) {
              loss = Math.abs(entry - sl) * sz;
            }
          }
          totalManagingFrozenLoss += loss;
        } else {
          const pnl = trade.hedgePnl ? parseFloat(trade.hedgePnl) : 0;
          totalHedgePnl += pnl;

          if (trade.hedgeStatus === 'WIN') {
            winCount++;
            totalHedgeWinsPnl += Math.max(0, pnl);
          } else if (trade.hedgeStatus === 'LOSS') {
            lossCount++;
            totalHedgeLossesPnl += Math.abs(Math.min(0, pnl));
          } else if (trade.hedgeStatus === 'BREAKEVEN') {
            breakevenCount++;
          }
        }
      }
    });

    const notTriggeredRate = totalHedgeTrades > 0 ? (notTriggeredCount / totalHedgeTrades) * 100 : 0;
    const triggeredRate = totalHedgeTrades > 0 ? (triggeredCount / totalHedgeTrades) * 100 : 0;
    const resolvedCount = winCount + lossCount + breakevenCount;
    const winRate = resolvedCount > 0 ? (winCount / resolvedCount) * 100 : 0;
    const lossRate = resolvedCount > 0 ? (lossCount / resolvedCount) * 100 : 0;
    const breakevenRate = resolvedCount > 0 ? (breakevenCount / resolvedCount) * 100 : 0;
    const managingRate = totalHedgeTrades > 0 ? (managingCount / totalHedgeTrades) * 100 : 0;
    const avgRiskPercent = countRiskPercent > 0 ? sumRiskPercent / countRiskPercent : 0;

    return {
      success: true,
      data: {
        totalHedgeTrades,
        notTriggeredCount,
        notTriggeredRate: notTriggeredRate.toFixed(1),
        triggeredCount,
        triggeredRate: triggeredRate.toFixed(1),
        winCount,
        lossCount,
        breakevenCount,
        managingCount,
        managingRate: managingRate.toFixed(1),
        winRate: winRate.toFixed(1),
        lossRate: lossRate.toFixed(1),
        breakevenRate: breakevenRate.toFixed(1),
        totalHedgePnl: totalHedgePnl.toFixed(2),
        totalHedgeWinsPnl: totalHedgeWinsPnl.toFixed(2),
        totalHedgeLossesPnl: totalHedgeLossesPnl.toFixed(2),
        totalManagingFrozenLoss: totalManagingFrozenLoss.toFixed(2),
        avgRiskPercent: avgRiskPercent.toFixed(2),
      }
    };
  } catch (error) {
    console.error("Hedge stats error:", error);
    return { success: false, data: null };
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