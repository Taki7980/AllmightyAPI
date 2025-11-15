# Startup Scripts

This folder contains bash scripts for starting your AllmightyAPI in different environments.

---

## 📁 Scripts Overview

| Script          | Purpose                                       | Environment |
| --------------- | --------------------------------------------- | ----------- |
| `start-dev.sh`  | Start development environment with Neon Local | Development |
| `start-prod.sh` | Start production environment with Neon Cloud  | Production  |

---

## 🚀 Quick Start

### Development

```bash
# Using pnpm (recommended)
pnpm start:dev

# Or directly
bash scripts/start-dev.sh
```

### Production

```bash
# Using pnpm (recommended)
pnpm start:prod

# Or directly
bash scripts/start-prod.sh
```

---

## 📋 What Each Script Does

### `start-dev.sh`

**Features:**

- ✅ Checks if `.env.development` exists
- ✅ Verifies Docker is running
- ✅ Interactive mode selection (attached/detached)
- ✅ Stops existing containers before starting
- ✅ Starts Neon Local + Application containers
- ✅ Displays helpful information after startup
- ✅ Color-coded output for better readability

**Output:**

```
================================
  AllmightyAPI - Dev Startup
================================

How do you want to start the containers?
  1) Detached mode (background) - Recommended for daily use
  2) Attached mode (with logs) - Good for debugging

🚀 Starting development environment...

✅ Containers started successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Development environment is ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Application:    http://localhost:8000
🗄️  Database:       postgres://neon:npg@localhost:5432/neondb
🌿 Neon Branch:    Ephemeral (auto-created)
```

### `start-prod.sh`

**Features:**

- ✅ Checks if `.env.production` exists
- ✅ Verifies Docker is running
- ✅ **Safety confirmation** before starting production
- ✅ Interactive mode selection (attached/detached)
- ✅ Stops existing containers before starting
- ✅ Starts production application container
- ✅ Displays deployment checklist
- ✅ Color-coded warnings for safety

**Output:**

```
================================
  AllmightyAPI - Prod Startup
================================

⚠️  WARNING: You are about to start the PRODUCTION environment!

This will:
  - Connect to Neon Cloud production database
  - Run the application in production mode
  - Expose the application on port 80

Are you sure you want to continue? (yes/no)

🚀 Starting production environment...

✅ Container started successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Production environment is ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Application:    http://localhost (or your domain)
🗄️  Database:       Neon Cloud (production)
🔒 Environment:    Production mode
```

---

## 🔧 Requirements

### For All Scripts

- **Bash** - Available through:
  - Git Bash (recommended for Windows)
  - WSL (Windows Subsystem for Linux)
  - Native bash on Linux/macOS
- **Docker** - Must be running
- **Docker Compose** - Version 2+

### For Development Script

- `.env.development` file with:
  - `NEON_API_KEY`
  - `NEON_PROJECT_ID`
  - `PARENT_BRANCH_ID`

### For Production Script

- `.env.production` file with:
  - `DATABASE_URL` (Neon Cloud connection)
  - `NODE_ENV=production`
  - `PORT=8000`

---

## 💡 Usage Tips

### Running on Windows

**Option 1: Git Bash (Recommended)**

```bash
# Open Git Bash in project root
pnpm start:dev
```

**Option 2: WSL**

```bash
# In WSL terminal
pnpm start:dev
```

**Option 3: PowerShell with Git Bash**

```powershell
# In PowerShell
bash -c "pnpm start:dev"
```

### Running on Linux/macOS

```bash
# Direct execution
./scripts/start-dev.sh

# Or via pnpm
pnpm start:dev
```

### Interactive Mode Options

When you run the scripts, you'll be asked:

**Option 1: Detached mode (background)**

- Containers run in the background
- Your terminal is free for other commands
- Good for daily development
- Use `pnpm docker:dev:logs` to see logs later

**Option 2: Attached mode (with logs)**

- See live logs from all containers
- Press `Ctrl+C` to stop
- Good for debugging and first-time setup

---

## 🔍 Troubleshooting

### "bash: command not found" (Windows)

**Solution:** Install Git for Windows which includes Git Bash

- Download: https://git-scm.com/download/win
- Or use WSL: `wsl --install`

### "Permission denied"

**On Linux/macOS:**

```bash
chmod +x scripts/*.sh
```

**On Windows (Git Bash):**

```bash
# Should already be executable, but if not:
icacls scripts\start-dev.sh /grant Everyone:RX
icacls scripts\start-prod.sh /grant Everyone:RX
```

### ".env.development not found"

1. Copy the example file:

   ```bash
   cp .env.EXAMPLE .env.development
   ```

2. Edit `.env.development` and add your Neon credentials

### "Docker is not running"

1. Start Docker Desktop
2. Wait for it to fully initialize
3. Run the script again

### Script stops at "Enter your choice"

- The script is waiting for your input
- Type `1` or `2` and press Enter
- Or just press Enter to use the default (option 1)

---

## 🎯 Script Architecture

Both scripts follow this flow:

```
1. Display banner
2. Check prerequisites (.env file, Docker)
3. Ask for user confirmation/choice
4. Stop existing containers (if any)
5. Start containers (detached or attached)
6. Display status and helpful information
```

---

## 🔗 Related Commands

After starting with the scripts, you can use these commands:

```bash
# View logs
pnpm docker:dev:logs

# Stop containers
pnpm docker:dev:down

# Restart containers
pnpm docker:dev:restart

# Run migrations
docker compose -f docker-compose.dev.yml exec app pnpm run db:migrate
```

---

## 📚 Additional Documentation

- **../DOCKER_SCRIPTS.md** - All Docker pnpm scripts
- **../DOCKER_QUICKSTART.md** - Quick reference guide
- **../DOCKER_SETUP.md** - Complete Docker setup documentation

---

## 🛡️ Safety Features

### Development Script

- ✅ Checks for required environment file
- ✅ Verifies Docker is running
- ✅ Gracefully handles existing containers

### Production Script

- ✅ All development checks PLUS:
- ✅ **Explicit confirmation required** ("yes")
- ✅ Clear warning about production deployment
- ✅ Post-deployment checklist
- ✅ Default answer is "no" (safe)

---

## 🎨 Color Coding

Scripts use colors to make output clearer:

- 🔵 **Blue** - Questions/prompts
- 🟢 **Green** - Success messages
- 🟡 **Yellow** - Warnings
- 🔴 **Red** - Errors
- 🔷 **Cyan** - Information

---

**Pro Tip:** Add these scripts to your daily workflow for a consistent, error-free startup experience! 🚀
