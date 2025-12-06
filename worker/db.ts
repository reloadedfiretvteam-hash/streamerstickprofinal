import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema';

neonConfig.pipelineConnect = false;

export function createDb(databaseUrl: string) {
  const cleanUrl = databaseUrl.trim().replace(/[\r\n]/g, '');
  
  try {
    new URL(cleanUrl);
  } catch (urlError: any) {
    throw new Error(`Invalid database URL format: ${urlError.message}. URL length: ${cleanUrl.length}, starts with: ${cleanUrl.substring(0, 20)}`);
  }
  
  const pool = new Pool({ connectionString: cleanUrl });
  return drizzle(pool, { schema });
}

export { schema };
