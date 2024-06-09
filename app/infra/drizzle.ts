import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { env } from '../config/env.js';
import * as schema from '../db/schema.js';

const queryClient = postgres(env.PG_URL);

export const db = drizzle(queryClient, {
  logger: true,
  schema,
});
