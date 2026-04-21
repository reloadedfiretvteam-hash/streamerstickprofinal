import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import type { Env } from '../index';

const TOKEN_EXPIRY = 24 * 60 * 60;
const FALLBACK_ADMIN_USERNAME = 'admin';
const FALLBACK_ADMIN_PASSWORD = 'admin123';
const FALLBACK_JWT_SECRET = 'streamstickpro';

function isProduction(env: Env): boolean {
  return (env.NODE_ENV || '').toLowerCase() === 'production';
}

function getJwtSecret(env: Env): string {
  return env.JWT_SECRET?.trim() || FALLBACK_JWT_SECRET;
}

function getAdminCredentials(env: Env) {
  return {
    username: env.ADMIN_USERNAME?.trim() || FALLBACK_ADMIN_USERNAME,
    password: env.ADMIN_PASSWORD?.trim() || FALLBACK_ADMIN_PASSWORD,
  };
}

async function hashPassword(password: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string, secret: string): Promise<boolean> {
  const computedHash = await hashPassword(password, secret);
  return computedHash === hash;
}

export function createAuthRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.post('/login', async (c) => {
    try {
      const body = await c.req.json();
      const { username, password } = body;

      if (!username || !password) {
        return c.json({ error: 'Username and password are required' }, 400);
      }

      const jwtSecret = getJwtSecret(c.env);
      const { username: adminUsername, password: adminPassword } = getAdminCredentials(c.env);

      if (username === adminUsername && password === adminPassword) {
        const token = await sign(
          { 
            sub: username, 
            role: 'admin',
            exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY 
          }, 
          jwtSecret
        );
        
        return c.json({ success: true, token });
      }

      return c.json({ error: 'Invalid username or password' }, 401);
    } catch (error: any) {
      console.error('Login error:', error);
      return c.json({ error: 'Login failed' }, 500);
    }
  });

  app.post('/verify', async (c) => {
    try {
      const authHeader = c.req.header('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ valid: false, error: 'No token provided' }, 401);
      }

      const token = authHeader.substring(7);
      const jwtSecret = getJwtSecret(c.env);
      
      try {
        const payload = await verify(token, jwtSecret);
        return c.json({ valid: true, user: payload.sub, role: payload.role });
      } catch {
        return c.json({ valid: false, error: 'Invalid or expired token' }, 401);
      }
    } catch (error: any) {
      console.error('Token verification error:', error);
      return c.json({ valid: false, error: 'Verification failed' }, 500);
    }
  });

  app.post('/logout', async (c) => {
    return c.json({ success: true, message: 'Logged out successfully' });
  });

  app.post('/generate-hash', async (c) => {
    if ((c.env.NODE_ENV || '').toLowerCase() === 'production') {
      return c.json({ error: 'Not found' }, 404);
    }

    try {
      const body = await c.req.json();
      const { password } = body;

      if (!password) {
        return c.json({ error: 'Password is required' }, 400);
      }

      const jwtSecret = getJwtSecret(c.env);
      const hash = await hashPassword(password, jwtSecret);
      return c.json({ 
        hash,
        instructions: 'Set this hash as ADMIN_PASSWORD_HASH in your Cloudflare environment variables'
      });
    } catch (error: any) {
      console.error('Hash generation error:', error);
      return c.json({ error: 'Failed to generate hash' }, 500);
    }
  });

  return app;
}

export async function authMiddleware(c: any, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const token = authHeader.substring(7);
  const jwtSecret = getJwtSecret(c.env);
  
  try {
    const payload = await verify(token, jwtSecret);
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
}
