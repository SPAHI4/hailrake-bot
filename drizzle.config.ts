import fs from 'node:fs';

import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

const schemaDir = './app/db';

// issues with module resolution if it contains nested imports
const files = fs
  .readdirSync(schemaDir)
  .filter((file) => file.endsWith('.ts') && file !== 'schema.ts')
  .map((file) => `${schemaDir}/${file}`);

export default defineConfig({
  schema: files,
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env['PG_URL']!,
  },
  verbose: true,
  strict: true,
});
