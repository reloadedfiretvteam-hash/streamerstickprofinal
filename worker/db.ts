import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema';

function sanitizeDbUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    return url.trim();
  }
}

export function createDb(databaseUrl: string) {
  const sanitizedUrl = sanitizeDbUrl(databaseUrl);
  const sql = neon(sanitizedUrl);
  return drizzle(sql, { schema });
}

export { schema };
