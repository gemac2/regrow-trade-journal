// db/schema.ts
import { pgTable, serial, text, numeric, timestamp, varchar, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. ACCOUNTS TABLE (The parent entity)
export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // Owner
  name: varchar('name', { length: 50 }).notNull(), // e.g., "Binance Futures"
  initialBalance: numeric('initial_balance').notNull().default('0'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. TRADES TABLE (Updated with relation)
export const trades = pgTable('trades', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  
  // RELATION: Trade belongs to an Account
  accountId: integer('account_id').references(() => accounts.id).notNull(), 
  
  symbol: varchar('symbol', { length: 20 }).notNull(),
  type: varchar('type', { length: 5 }).notNull(),
  status: varchar('status', { length: 10 }).default('OPEN'),
  
  entryPrice: numeric('entry_price').notNull(),
  exitPrice: numeric('exit_price'),
  size: numeric('size').notNull(),
  pnl: numeric('pnl'),
  
  stopLoss: numeric('stop_loss'),
  takeProfit: numeric('take_profit'),
  
  entryDate: timestamp('entry_date').defaultNow().notNull(),
  exitDate: timestamp('exit_date'),
});

// Relations for Drizzle Queries
export const accountsRelations = relations(accounts, ({ many }) => ({
  trades: many(trades),
}));

export const tradesRelations = relations(trades, ({ one }) => ({
  account: one(accounts, {
    fields: [trades.accountId],
    references: [accounts.id],
  }),
}));