// db/schema.ts
import { pgTable, serial, text, numeric, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';

export const trades = pgTable('trades', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // Para vincular el trade con el usuario de Neon Auth
  
  // Detalles del Trade
  symbol: varchar('symbol', { length: 20 }).notNull(), // Ej: BTCUSDT
  type: varchar('type', { length: 5 }).notNull(), // LONG o SHORT
  status: varchar('status', { length: 10 }).default('OPEN'), // OPEN, CLOSED, BE (Break Even)
  
  // Datos Financieros (Usamos numeric para precisión monetaria)
  entryPrice: numeric('entry_price').notNull(),
  exitPrice: numeric('exit_price'), // Puede ser null si el trade sigue abierto
  size: numeric('size').notNull(), // Tamaño de la posición (Margen o cantidad)
  pnl: numeric('pnl'), // Profit and Loss realizado
  
  // Gestión de Riesgo
  stopLoss: numeric('stop_loss'),
  takeProfit: numeric('take_profit'),
  
  // Metadata
  notes: text('notes'),
  entryDate: timestamp('entry_date').defaultNow().notNull(),
  exitDate: timestamp('exit_date'),
  
  createdAt: timestamp('created_at').defaultNow(),
});

export const userSettings = pgTable('user_settings', {
  userId: text('user_id').primaryKey(), // Un registro por usuario
  initialBalance: numeric('initial_balance').notNull().default('1000'), // Por defecto $1000
});

// Tipo inferido para usar en TypeScript en toda la app
export type Trade = typeof trades.$inferSelect;
export type NewTrade = typeof trades.$inferInsert;