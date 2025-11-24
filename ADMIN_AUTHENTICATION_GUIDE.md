# Admin Authentication Guide

## Overview
The application uses a custom admin authentication system that verifies credentials against the `admin_credentials` table in Supabase.

## Default Admin Credentials

**Username:** `Starevan11$`  
**Password:** `Starevan11$`  
**Email:** `reloadedfirestvteam@gmail.com`

⚠️ **IMPORTANT**: Change these credentials immediately after first login in production!

## Admin Access URLs

- **Main Admin Panel**: `/admin` or `/admin/dashboard`
- **Custom Admin Dashboard**: `/custom-admin/dashboard`

## How Authentication Works

### Login Flow
1. User visits `/admin`
2. `UnifiedAdminLogin` component displays login form
3. User enters username/email and password
4. System queries `admin_credentials` table in Supabase
5. Credentials are verified (username or email + password match)
6. On success:
   - Session token stored in localStorage: `custom_admin_token`
   - User info stored: `custom_admin_user`
   - Last login timestamp updated in database
   - User redirected to admin dashboard

### Session Management
- Sessions persist in localStorage
- Token key: `custom_admin_token`
- Value: `'authenticated'`
- No automatic expiration (manual logout required)

### Protected Routes
Routes protected by authentication check in `AppRouter.tsx`:
- `/admin`
- `/admin/dashboard`
- `/custom-admin/dashboard`

If not authenticated, user sees login page or is redirected to homepage.

## Database Schema

### admin_credentials Table

```sql
CREATE TABLE admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text,
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);
```

### Row Level Security (RLS)
- Table has RLS enabled
- Authenticated users can view all credentials
- Authenticated users can update credentials
- Public users have no access

## Security Considerations

### Current Implementation Status

✅ **Implemented:**
- Database-backed authentication
- Protected admin routes
- Session token storage
- Last login tracking
- RLS policies on credentials table

⚠️ **Known Issues:**

1. **Plain Text Passwords**
   - Current implementation stores passwords as plain text in `password_hash` field
   - Direct string comparison during login
   - **Risk**: Database breach would expose passwords
   - **Recommendation**: Implement proper password hashing (bcrypt, argon2)

2. **No Password Validation**
   - No minimum password length
   - No complexity requirements
   - **Recommendation**: Add password strength validation

3. **No Rate Limiting**
   - Unlimited login attempts allowed
   - **Risk**: Brute force attacks possible
   - **Recommendation**: Implement rate limiting or lockout after failed attempts

4. **Session Never Expires**
   - Token persists indefinitely in localStorage
   - **Recommendation**: Add token expiration and refresh logic

5. **No Multi-Factor Authentication**
   - Single factor (password only)
   - **Recommendation**: Consider adding 2FA for production

### Recommended Security Improvements

#### Priority 1 (Critical)
- [ ] Implement password hashing (bcrypt or argon2)
- [ ] Add rate limiting to login endpoint
- [ ] Add password complexity requirements

#### Priority 2 (Important)
- [ ] Add session expiration (e.g., 24 hours)
- [ ] Implement refresh token mechanism
- [ ] Add login attempt tracking and alerts

#### Priority 3 (Nice to Have)
- [ ] Add 2FA support
- [ ] Add password reset flow
- [ ] Add email verification on account creation
- [ ] Add IP-based restrictions

## Managing Admin Users

### Adding a New Admin

Run this SQL in Supabase:

```sql
INSERT INTO admin_credentials (username, email, password_hash)
VALUES ('newadmin', 'admin@example.com', 'temporary-password')
ON CONFLICT (username) DO NOTHING;
```

⚠️ Remember: Passwords are currently plain text. Instruct admin to change immediately.

### Updating Admin Password

```sql
UPDATE admin_credentials
SET password_hash = 'new-password-here'
WHERE username = 'admin-username';
```

### Removing Admin Access

```sql
DELETE FROM admin_credentials
WHERE username = 'admin-to-remove';
```

### Listing All Admins

```sql
SELECT id, username, email, last_login, created_at
FROM admin_credentials
ORDER BY created_at DESC;
```

## Migration to Proper Password Hashing

### Step 1: Add Hashing Library

```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

### Step 2: Create Password Hash Function

```typescript
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Step 3: Update Login Logic

```typescript
// In UnifiedAdminLogin.tsx
const { data: admin } = await supabase
  .from('admin_credentials')
  .select('*')
  .or(`username.eq.${username},email.eq.${username}`)
  .maybeSingle();

if (!admin) {
  setError('Invalid credentials');
  return;
}

const isValidPassword = await verifyPassword(password, admin.password_hash);
if (!isValidPassword) {
  setError('Invalid credentials');
  return;
}

// Continue with login...
```

### Step 4: Hash Existing Passwords

Create a one-time migration script to hash all existing passwords.

## Troubleshooting

### Cannot Login with Correct Credentials

1. **Check Supabase connection**
   - Verify `VITE_SUPABASE_URL` in .env
   - Verify `VITE_SUPABASE_ANON_KEY` in .env

2. **Check credentials in database**
   ```sql
   SELECT username, email, password_hash 
   FROM admin_credentials;
   ```

3. **Check RLS policies**
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'admin_credentials';
   ```

4. **Check browser console**
   - Look for Supabase errors
   - Check network tab for failed requests

### "Custom admin token" Not Persisting

- Check browser localStorage is enabled
- Check for localStorage quotas
- Try incognito/private browsing mode

### Infinite Redirect Loop

- Clear localStorage: `localStorage.clear()`
- Check AppRouter.tsx logic
- Verify authentication state

### RLS Blocking Access

If RLS is too restrictive, temporarily disable for testing:

```sql
ALTER TABLE admin_credentials DISABLE ROW LEVEL SECURITY;
```

Remember to re-enable after testing:

```sql
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;
```

## Production Deployment Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Review and test RLS policies
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Set up monitoring for failed login attempts
- [ ] Document admin credentials securely (password manager)
- [ ] Test admin login from production domain
- [ ] Consider implementing rate limiting
- [ ] Consider implementing session expiration
- [ ] Back up admin_credentials table

## Support

For authentication issues:
1. Check Supabase dashboard for database connection
2. Review browser console for errors
3. Check network tab for failed API calls
4. Verify environment variables are set correctly

For Supabase Auth documentation:
https://supabase.com/docs/guides/auth
