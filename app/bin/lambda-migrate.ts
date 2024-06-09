import { Handler } from 'aws-lambda';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import { env } from '../config/env.js';

export const handler: Handler = async () => {
  const sql = postgres(env.PG_URL, { max: 1 });
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: 'drizzle' });
  await sql.end();
};
