import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema';

neonConfig.pipelineConnect = false;

export function createDb(databaseUrl: string) {
  const pool = new Pool({ connectionString: databaseUrl });
  return drizzle(pool, { schema });
}

export { schema };
