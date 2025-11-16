# 🚀 Quick Start: Upload to GitHub

## ⚡ Fastest Method (Automated Script)

1. **Open PowerShell** in your project folder
2. **Run the script:**
   ```powershell
   .\upload-to-github.ps1
   ```
3. **Follow the prompts** - the script will guide you through everything!

---

## 📋 Manual Method (Step-by-Step)

### 1️⃣ Install Git
- Download: https://git-scm.com/download/win
- Install with default settings

### 2️⃣ Create GitHub Repository
- Go to: https://github.com/new
- Name it: `streamerstickprofinal`
- Click "Create repository"
- **Don't** initialize with README

### 3️⃣ Open PowerShell in Project Folder
```powershell
cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"
```

### 4️⃣ Run These Commands

```powershell
# Initialize git
git init

# Configure your identity (one-time setup)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/streamerstickprofinal.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 5️⃣ Authentication
- **Username:** Your GitHub username
- **Password:** Use a **Personal Access Token** (not your password)
  - Create token: https://github.com/settings/tokens
  - Select `repo` scope
  - Copy and paste the token when prompted

---

## ✅ Success Checklist

- [ ] Git installed
- [ ] GitHub account created
- [ ] Repository created on GitHub
- [ ] Git initialized in project
- [ ] Files committed
- [ ] Remote added
- [ ] Files pushed to GitHub
- [ ] Can see files on GitHub website

---

## 🔄 Updating Files Later

```powershell
git add .
git commit -m "Your update message"
git push
```

---

## 📚 Need More Help?

See **GITHUB_SETUP_GUIDE.md** for detailed instructions and troubleshooting.


