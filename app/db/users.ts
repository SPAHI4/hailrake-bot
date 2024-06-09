import { pgTable, varchar, real, timestamp, boolean, bigint, primaryKey } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable(
  'users',
  {
    // PK
    id: bigint('id', { mode: 'number' }).notNull(),
    chatId: bigint('chat_id', { mode: 'number' }).notNull(),

    // Telegram data (updated on each message)
    username: varchar('username', { length: 255 }),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }),
    isBot: boolean('is_bot').default(false).notNull(),

    // Commands data
    rating: real('rating').default(1).notNull(),

    // default to day ago
    votedAt: timestamp('voted_at', {
      withTimezone: true,
      mode: 'date',
      precision: 3,
    })
      .default(sql`now() - interval '1 day'`)
      .notNull(),
    playedCasinoAt: timestamp('played_casino_at', {
      withTimezone: true,
      mode: 'date',
      precision: 3,
    })
      .default(sql`now() - interval '1 day'`)
      .notNull(),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date', precision: 3, withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', precision: 3, withTimezone: true })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => {
    return {
      primaryKey: primaryKey({ columns: [table.id, table.chatId] }),
    };
  },
);
