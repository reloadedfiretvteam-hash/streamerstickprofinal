import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

export function createDb(databaseUrl: string) {
  const client = postgres(databaseUrl, {
    ssl: 'require',
    max: 1,
    idle_timeout: 0,
    connect_timeout: 30,
    prepare: false,
    fetch_types: false,
  });
  return drizzle(client, { schema });
}

export { schema };
