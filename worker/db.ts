import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema';

neonConfig.fetchConnectionCache = true;

export function createDb(databaseUrl: string) {
  const cleanUrl = databaseUrl.trim().replace(/[\r\n\s]/g, '');
  const sql = neon(cleanUrl);
  return drizzle(sql, { schema });
}

export { schema };
