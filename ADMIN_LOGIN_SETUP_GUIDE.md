# 🔐 ADMIN LOGIN SETUP - Step-by-Step Guide for Beginners

## 📋 What You Need
1. A text editor (Notepad, VS Code, or any text editor)
2. Access to your project folder
3. (Optional) Access to Supabase dashboard for database method

---

## 🎯 METHOD 1: Using Environment Variables (EASIEST - RECOMMENDED)

### Step 1: Find Your Project Root Folder
Your project folder is located at:
```
C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal
```

This folder should contain:
- `package.json`
- `src` folder
- `public` folder
- `node_modules` folder

### Step 2: Create the .env File

**Option A: Using Windows File Explorer**
1. Open File Explorer
2. Navigate to your project folder: `C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal`
3. Right-click in an empty space
4. Click "New" → "Text Document"
5. Name it exactly: `.env` (including the dot at the beginning)
   - If Windows asks "Are you sure you want to change the file extension?", click "Yes"
   - If you can't see the file extension, go to View → Show → File name extensions (check this box)

**Option B: Using VS Code (Recommended)**
1. Open VS Code
2. Open your project folder: `File` → `Open Folder` → Select `streamerstickprofinal`
3. In the left sidebar, right-click in an empty space
4. Click "New File"
5. Name it: `.env`

**Option C: Using Command Line**
1. Open Command Prompt or PowerShell
2. Type: `cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"`
3. Press Enter
4. Type: `echo. > .env`
5. Press Enter

### Step 3: Add Your Login Credentials

Open the `.env` file you just created and type these lines EXACTLY:

```env
VITE_ADMIN_DEFAULT_USER=admin
VITE_ADMIN_DEFAULT_PASSWORD=admin123
VITE_ADMIN_DEFAULT_EMAIL=reloadedfirestvteam@gmail.com
```

**IMPORTANT:**
- Replace `admin123` with your own secure password (you'll use this to log in)
- Replace `admin` with your preferred username (or leave it as `admin`)
- Replace the email with your actual email (or leave it as is)
- **NO SPACES** around the `=` sign
- **NO QUOTES** needed around the values
- Each line must be on a separate line

### Step 4: Save the File
- Press `Ctrl + S` to save
- Make sure the file is saved in the root folder (same folder as `package.json`)

### Step 5: Restart Your Development Server

If your website is running:
1. Stop it by pressing `Ctrl + C` in the terminal
2. Start it again with: `npm run dev`

The environment variables will now work!

### Step 6: Test Login
1. Open your website in a browser
2. Scroll to the footer
3. Click "Admin Login"
4. Enter your username (from .env file)
5. Enter your password (from .env file)
6. Click "Login"

✅ **You should now be logged in!**

---

## 🗄️ METHOD 2: Using Database (For Production)

This method stores credentials in your Supabase database.

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Log in to your account
3. Select your project

### Step 2: Go to SQL Editor
1. In the left sidebar, click "SQL Editor"
2. Click "New query"

### Step 3: Create Admin Credentials Table (If Not Exists)

Copy and paste this SQL code:

```sql
-- Create admin credentials table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'admin',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default admin account (if it doesn't exist)
INSERT INTO admin_credentials (username, password_hash, email, role)
VALUES ('admin', 'admin', 'reloadedfirestvteam@gmail.com', 'superadmin')
ON CONFLICT (username) DO NOTHING;
```

### Step 4: Run the SQL
1. Click "Run" button (or press `Ctrl + Enter`)
2. You should see "Success. No rows returned"

### Step 5: Verify the Account
1. Go to "Table Editor" in Supabase
2. Find the `admin_credentials` table
3. You should see one row with:
   - username: `admin`
   - password_hash: `admin`
   - email: `reloadedfirestvteam@gmail.com`

### Step 6: Test Login
1. Go to your website
2. Click "Admin Login" in footer
3. Enter:
   - Username: `admin`
   - Password: `admin`
4. Click "Login"

✅ **You should now be logged in!**

---

## 🔒 Security: Changing Your Password

### If Using Environment Variables (.env):
1. Open the `.env` file
2. Change `VITE_ADMIN_DEFAULT_PASSWORD=admin123` to your new password
3. Save the file
4. Restart your development server (`Ctrl + C` then `npm run dev`)

### If Using Database:
1. Go to Supabase → Table Editor → `admin_credentials`
2. Click on the admin row
3. Change the `password_hash` field to your new password
4. Click "Save"

**Note:** The login system checks the `password_hash` column directly (not hashed yet for simplicity).

---

## 🚨 Troubleshooting

### Problem: "Login failed" error
**Solutions:**
1. Check your `.env` file is in the root folder (same folder as `package.json`)
2. Make sure there are NO spaces around the `=` sign
3. Make sure the file is named exactly `.env` (with the dot)
4. Restart your development server after creating/changing `.env`
5. Check that you're using the correct username and password

### Problem: ".env file not found"
**Solutions:**
1. Make sure you created it in the correct folder
2. Make sure it's named `.env` (not `.env.txt` or `env`)
3. In File Explorer, make sure "Show file extensions" is enabled

### Problem: Can't create .env file
**Solutions:**
1. Try creating it with VS Code or a text editor
2. Make sure you have write permissions in the folder
3. Try running your text editor as Administrator

### Problem: Database login not working
**Solutions:**
1. Check Supabase connection is working
2. Verify the `admin_credentials` table exists
3. Check the username and password_hash match what you're entering
4. Make sure the row has `is_active = true`

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `.env` file exists in the root folder
- [ ] `.env` file contains all three variables:
  - [ ] `VITE_ADMIN_DEFAULT_USER=...`
  - [ ] `VITE_ADMIN_DEFAULT_PASSWORD=...`
  - [ ] `VITE_ADMIN_DEFAULT_EMAIL=...`
- [ ] No spaces around `=` signs
- [ ] Development server has been restarted
- [ ] Can access `/admin` route
- [ ] Can see login form
- [ ] Can log in with credentials

---

## 📍 File Location Reference

Your `.env` file should be here:
```
C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal\.env
```

It should be in the same folder as:
- `package.json` ✅
- `src/` folder ✅
- `public/` folder ✅

---

## 🎯 Quick Setup (Copy & Paste)

**For Windows Command Prompt:**
```cmd
cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"
echo VITE_ADMIN_DEFAULT_USER=admin > .env
echo VITE_ADMIN_DEFAULT_PASSWORD=admin123 >> .env
echo VITE_ADMIN_DEFAULT_EMAIL=reloadedfirestvteam@gmail.com >> .env
```

**For PowerShell:**
```powershell
cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"
@"
VITE_ADMIN_DEFAULT_USER=admin
VITE_ADMIN_DEFAULT_PASSWORD=admin123
VITE_ADMIN_DEFAULT_EMAIL=reloadedfirestvteam@gmail.com
"@ | Out-File -FilePath .env -Encoding utf8
```

---

## 📞 Still Having Issues?

1. Double-check the file location
2. Verify file name is exactly `.env` (not `.env.txt`)
3. Restart your development server
4. Clear browser cache and try again
5. Check browser console for errors (F12 → Console tab)

---

**Remember:** The `.env` file should NEVER be committed to Git (it's in `.gitignore`). Keep your credentials safe!

