# GitHub Setup Guide

This guide explains how to push your Golden Star School Management System to GitHub and keep it synchronized.

## 📋 Prerequisites

- GitHub account (free at github.com)
- Git installed on your computer
- SSH key configured (or use HTTPS with personal access token)

## 🚀 Initial Setup (First Time)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Enter repository name: `golden-star-school`
3. Add description: "School Management System - React + Supabase"
4. Choose visibility: **Private** (recommended for school data)
5. Click "Create repository"

### Step 2: Configure Git Locally

```bash
cd /home/ubuntu/golden-star-school

# Configure git user (one-time setup)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Golden Star School Management System"

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/golden-star-school.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 3: Verify Upload

1. Go to your GitHub repository URL
2. Verify all files are uploaded
3. Check that `.env.local` is NOT uploaded (should be in `.gitignore`)

---

## 🔄 Regular Workflow (After Initial Setup)

### Making Changes

```bash
cd /home/ubuntu/golden-star-school

# See what changed
git status

# Stage specific files
git add client/src/pages/Home.tsx

# Or stage all changes
git add .

# Commit with descriptive message
git commit -m "Add new exam feature"

# Push to GitHub
git push origin main
```

### Commit Message Best Practices

Use clear, descriptive commit messages:

```
✅ Good:
git commit -m "Add Results Manager with Excel export"
git commit -m "Fix student dashboard exam list loading"
git commit -m "Update RLS policies for better security"

❌ Bad:
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
```

---

## 🔐 Sensitive Data Protection

### What NOT to Commit

Never commit these files:

```
.env.local              # Local environment variables
.env.production.local   # Production secrets
node_modules/           # Dependencies (use pnpm install)
dist/                   # Build output
.manus-logs/            # Logs
.DS_Store               # macOS files
*.log                   # Log files
```

These are already in `.gitignore` - verify they're not committed:

```bash
# Check what would be committed
git status

# If accidentally added, remove from git
git rm --cached .env.local
git commit -m "Remove .env.local from git"
```

### Environment Variables for Deployment

For deployment platforms (Vercel, Netlify, etc.), add secrets through their UI:

1. **Vercel**: Project Settings → Environment Variables
2. **Netlify**: Site Settings → Build & Deploy → Environment
3. **Railway**: Project → Variables
4. **Manus**: Automatically injected (no setup needed)

---

## 👥 Collaboration (Multiple Developers)

### Clone Repository

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/golden-star-school.git
cd golden-star-school

# Install dependencies
pnpm install

# Create local .env.local file
cp client/.env.example client/.env.local
# Edit .env.local with your Supabase credentials
```

### Pull Latest Changes

```bash
# Before starting work, pull latest changes
git pull origin main

# Install any new dependencies
pnpm install
```

### Create Feature Branch (Recommended)

```bash
# Create new branch for your feature
git checkout -b feature/add-payment-gateway

# Make changes and commit
git add .
git commit -m "Add Stripe payment integration"

# Push branch to GitHub
git push origin feature/add-payment-gateway

# Create Pull Request on GitHub
# Then merge after review
```

### Merge Pull Request

```bash
# Switch to main branch
git checkout main

# Pull latest main
git pull origin main

# Delete local feature branch
git branch -d feature/add-payment-gateway
```

---

## 🔄 Sync with Manus

If using Manus for deployment:

### Option 1: Automatic Sync (Recommended)

Manus can automatically sync with GitHub:

1. Go to Manus Dashboard → Settings → GitHub
2. Connect your GitHub account
3. Select repository
4. Manus automatically pulls changes on push

### Option 2: Manual Sync

```bash
# After pushing to GitHub
# Go to Manus Management UI → Settings → GitHub
# Click "Sync" or "Pull Latest"
```

---

## 📊 Useful Git Commands

### View History

```bash
# See recent commits
git log --oneline -10

# See changes in last commit
git show HEAD

# See diff between branches
git diff main feature/my-feature
```

### Undo Changes

```bash
# Discard local changes (careful!)
git checkout -- client/src/pages/Home.tsx

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Revert a specific commit
git revert abc1234
```

### Stash Changes

```bash
# Save changes temporarily
git stash

# List stashed changes
git stash list

# Apply stashed changes
git stash pop
```

---

## 🚀 CI/CD with GitHub Actions

### Automatic Testing on Push

Create `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm check
      - run: pnpm build
```

### Automatic Deployment on Push

For Vercel/Netlify, they automatically deploy when you push to main.

---

## 🆘 Troubleshooting

### "Permission denied (publickey)"

**Solution**: Setup SSH key

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to GitHub
# Go to GitHub Settings → SSH and GPG keys → New SSH key
# Paste public key from ~/.ssh/id_ed25519.pub

# Update remote to use SSH
git remote set-url origin git@github.com:YOUR_USERNAME/golden-star-school.git
```

### "fatal: not a git repository"

**Solution**: Initialize git

```bash
cd /home/ubuntu/golden-star-school
git init
git remote add origin https://github.com/YOUR_USERNAME/golden-star-school.git
```

### "Your branch is ahead of 'origin/main'"

**Solution**: Push your changes

```bash
git push origin main
```

### "Merge conflict"

**Solution**: Resolve conflicts

```bash
# See conflicts
git status

# Edit conflicted files manually
# Then stage and commit
git add .
git commit -m "Resolve merge conflict"
git push origin main
```

---

## 📚 Resources

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Help**: https://docs.github.com
- **GitHub Guides**: https://guides.github.com
- **Manus Documentation**: https://docs.manus.im

---

## ✅ Checklist for Production

Before deploying to production:

- [ ] All code committed to GitHub
- [ ] `.env.local` is in `.gitignore` (not committed)
- [ ] No API keys or secrets in code
- [ ] All tests passing
- [ ] README.md is up to date
- [ ] DEPLOYMENT.md reviewed
- [ ] Database backups enabled
- [ ] Monitoring set up
- [ ] Team has access to repository

---

**Happy coding! 🚀**
