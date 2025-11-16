# Complete Guide: Uploading Your Project to GitHub

This guide will walk you through the entire process of uploading your StreamStickPro project to GitHub.

## Prerequisites

### Step 1: Install Git (if not already installed)

1. **Download Git for Windows:**
   - Visit: https://git-scm.com/download/win
   - Download the latest version
   - Run the installer
   - Use default settings (recommended)

2. **Verify Installation:**
   - Open PowerShell or Command Prompt
   - Type: `git --version`
   - You should see something like: `git version 2.x.x`

### Step 2: Create a GitHub Account (if you don't have one)

1. Go to: https://github.com
2. Click "Sign up"
3. Follow the registration process

### Step 3: Create a New Repository on GitHub

1. Log in to GitHub
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in:
   - **Repository name:** `streamerstickprofinal` (or your preferred name)
   - **Description:** (optional) "Premium IPTV subscriptions and jailbroken Fire Stick e-commerce platform"
   - **Visibility:** Choose Public or Private
   - **DO NOT** check "Initialize this repository with a README" (you already have files)
5. Click "Create repository"

## Uploading Your Files

### Step 4: Initialize Git in Your Project

Open PowerShell or Command Prompt in your project folder and run:

```bash
# Navigate to your project folder (if not already there)
cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

# Initialize git repository
git init

# Configure your git identity (replace with your name and email)
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Step 5: Add All Files to Git

```bash
# Add all files to staging
git add .

# Check what will be committed
git status
```

### Step 6: Create Your First Commit

```bash
# Commit all files
git commit -m "Initial commit: StreamStickPro project"
```

### Step 7: Connect to GitHub Repository

After creating the repository on GitHub, you'll see a page with setup instructions. Use the commands for "push an existing repository":

```bash
# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/streamerstickprofinal.git

# Verify the remote was added
git remote -v
```

### Step 8: Push to GitHub

```bash
# Push to GitHub (main branch)
git branch -M main
git push -u origin main
```

**Note:** You'll be prompted for your GitHub username and password. For password, you'll need to use a **Personal Access Token** (not your regular password).

### Step 9: Create a Personal Access Token (if needed)

If you're asked for a password:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "StreamStickPro Upload"
4. Select scopes: Check `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)
7. Use this token as your password when pushing

## Updating Files in the Future

Once your repository is set up, to update files in the future:

```bash
# Check what files have changed
git status

# Add changed files
git add .

# Or add specific files
git add path/to/file

# Commit changes
git commit -m "Description of your changes"

# Push to GitHub
git push
```

## Quick Reference Commands

```bash
# Check status
git status

# Add all files
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull

# View commit history
git log
```

## Troubleshooting

### If you get "fatal: not a git repository"
- Make sure you're in the project folder
- Run `git init` first

### If you get authentication errors
- Make sure you're using a Personal Access Token, not your password
- Check that your token has the `repo` scope

### If you want to update the remote URL
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/REPOSITORY_NAME.git
```

### If you want to see your remote repositories
```bash
git remote -v
```

## Video Recording Tips

If you're recording a video tutorial:

1. **Start with:** Showing the project folder structure
2. **Show:** Opening PowerShell/Command Prompt
3. **Demonstrate:** Each git command step by step
4. **Show:** The GitHub website when creating the repository
5. **Show:** The final result on GitHub after pushing

## Next Steps

After uploading:
- ✅ Your code is now backed up on GitHub
- ✅ You can share it with others
- ✅ You can access it from any computer
- ✅ You can track changes and collaborate

---

**Need Help?** 
- Git Documentation: https://git-scm.com/doc
- GitHub Help: https://docs.github.com

