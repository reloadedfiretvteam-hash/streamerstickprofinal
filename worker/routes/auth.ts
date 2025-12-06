import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import type { Env } from '../index';

const DEFAULT_JWT_SECRET = 'streamstickpro-admin-secret-2024';
const TOKEN_EXPIRY = 24 * 60 * 60;

function getJwtSecret(env: Env): string {
  return env.JWT_SECRET || DEFAULT_JWT_SECRET;
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
      const adminUsername = c.env.ADMIN_USERNAME || 'admin';
      const adminPasswordHash = c.env.ADMIN_PASSWORD_HASH;

      if (!adminPasswordHash) {
        const defaultPassword = 'StreamStick2024!';
        const defaultHash = await hashPassword(defaultPassword, jwtSecret);
        
        if (username === adminUsername && password === defaultPassword) {
          const token = await sign(
            { 
              sub: username, 
              role: 'admin',
              exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY 
            }, 
            jwtSecret
          );
          
          return c.json({ 
            success: true, 
            token,
            message: 'Login successful. Please set ADMIN_PASSWORD_HASH in environment for security.',
            defaultPasswordHash: defaultHash
          });
        }
      } else {
        const isValid = await verifyPassword(password, adminPasswordHash, jwtSecret);
        
        if (username === adminUsername && isValid) {
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
  const jwtSecret = c.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  
  try {
    const payload = await verify(token, jwtSecret);
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
}
