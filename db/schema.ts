// db/schema.ts
import { pgTable, serial, text, numeric, timestamp, varchar, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// -----------------------------------------------------------------------------
// 1. BUSINESS TABLES (Tablas de Negocio)
// -----------------------------------------------------------------------------

// ACCOUNTS TABLE
export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  // Eliminamos .references() porque no tenemos la tabla 'user' definida aquí.
  // Solo guardamos el string del ID.
  userId: text('user_id').notNull(), 
  name: varchar('name', { length: 50 }).notNull(),
  initialBalance: numeric('initial_balance').notNull().default('0'),
  createdAt: timestamp('created_at').defaultNow(),
});

// TRADES TABLE
export const trades = pgTable('trades', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), 
  
  // RELACIÓN INTERNA: Un Trade SÍ pertenece a una Account (esto está perfecto)
  accountId: integer('account_id').references(() => accounts.id, { onDelete: 'cascade' }).notNull(), 
  
  symbol: varchar('symbol', { length: 20 }).notNull(),
  type: varchar('type', { length: 5 }).notNull(),
  status: varchar('status', { length: 10 }).default('OPEN'),

  strategy: varchar('strategy', { length: 50 }),
  
  entryPrice: numeric('entry_price').notNull(),
  exitPrice: numeric('exit_price'),
  size: numeric('size').notNull(),
  pnl: numeric('pnl'),
  
  stopLoss: numeric('stop_loss'),
  takeProfit: numeric('take_profit'),
  
  entryDate: timestamp('entry_date').defaultNow().notNull(),
  exitDate: timestamp('exit_date'),
});

// -----------------------------------------------------------------------------
// 2. USER PROFILES
// -----------------------------------------------------------------------------

export const userProfiles = pgTable('user_profiles', {
  // El ID del perfil ES el mismo ID del usuario (String).
  // Quitamos .references() para evitar errores si la tabla 'user' no está definida aquí.
  userId: text('user_id').primaryKey(), 
  
  bio: text('bio'),
  tradingStyle: varchar('trading_style', { length: 50 }).default('Day Trader'),
  location: varchar('location', { length: 100 }),
  
  updatedAt: timestamp('updated_at').defaultNow(),
});

// -----------------------------------------------------------------------------
// 3. RELATIONS (Solo entre tus tablas de negocio)
// -----------------------------------------------------------------------------

export const accountsRelations = relations(accounts, ({ many }) => ({
  trades: many(trades),
}));

export const tradesRelations = relations(trades, ({ one }) => ({
  account: one(accounts, {
    fields: [trades.accountId],
    references: [accounts.id],
  }),
}));