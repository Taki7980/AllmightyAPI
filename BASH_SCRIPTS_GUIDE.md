# Bash Scripts Guide

Complete guide for using the interactive startup scripts for AllmightyAPI.

---

## 🎯 Overview

In addition to direct Docker commands and pnpm shortcuts, you now have **interactive bash scripts** that provide a guided, user-friendly way to start your application.

---

## 📁 What Was Created

### Scripts

```
scripts/
├── start-dev.sh          # Interactive development startup
├── start-prod.sh         # Interactive production startup
└── README.md             # Detailed scripts documentation
```

### pnpm Commands

```json
"start:dev": "bash ./scripts/start-dev.sh"
"start:prod": "bash ./scripts/start-prod.sh"
```

---

## 🚀 Quick Start

### Development

```bash
pnpm start:dev
```

This will:

1. ✅ Check if `.env.development` exists
2. ✅ Verify Docker is running
3. ❓ Ask if you want detached or attached mode
4. 🚀 Start containers
5. 📊 Show status and helpful info

### Production

```bash
pnpm start:prod
```

This will:

1. ✅ Check if `.env.production` exists
2. ✅ Verify Docker is running
3. ⚠️ Show safety warning
4. ❓ Ask for explicit confirmation
5. ❓ Ask if you want detached or attached mode
6. 🚀 Start container
7. 📋 Display deployment checklist

---

## 💡 Why Use These Scripts?

### Compared to Direct Docker Commands

**Before:**

```bash
docker compose -f docker-compose.dev.yml up --build -d
```

**Now:**

```bash
pnpm start:dev
```

**Benefits:**

- ✅ **Guided experience** - Interactive prompts
- ✅ **Error prevention** - Validates prerequisites
- ✅ **Helpful output** - Clear, color-coded messages
- ✅ **Easier to remember** - Simple command names
- ✅ **Safety checks** - Especially for production

### Compared to pnpm docker:\* Commands

Both are useful! Use what fits your workflow:

| Use Case               | Recommended Command                | Why                         |
| ---------------------- | ---------------------------------- | --------------------------- |
| **First time running** | `pnpm start:dev`                   | Guided, explains everything |
| **Daily development**  | `pnpm docker:dev:d`                | Faster, no prompts          |
| **Debugging**          | `pnpm start:dev` → Choose option 2 | See logs immediately        |
| **Quick restart**      | `pnpm docker:dev:restart`          | No rebuild needed           |
| **Production deploy**  | `pnpm start:prod`                  | Safety confirmation         |

---

## 📋 Interactive Features

### Development Script (`start-dev.sh`)

```
================================
  AllmightyAPI - Dev Startup
================================

How do you want to start the containers?
  1) Detached mode (background) - Recommended for daily use
  2) Attached mode (with logs) - Good for debugging

Enter your choice (1 or 2) [default: 1]:
```

**Option 1 (Detached):**

- Containers run in background
- Terminal is free
- Use `pnpm docker:dev:logs` to view logs later

**Option 2 (Attached):**

- See live logs
- Press Ctrl+C to stop
- Good for debugging

### Production Script (`start-prod.sh`)

```
================================
  AllmightyAPI - Prod Startup
================================

⚠️  WARNING: You are about to start the PRODUCTION environment!

This will:
  - Connect to Neon Cloud production database
  - Run the application in production mode
  - Expose the application on port 80

Are you sure you want to continue? (yes/no) [default: no]:
```

**Safety Features:**

- Requires explicit "yes" confirmation
- Default is "no" (safe)
- Shows clear warning
- Displays post-deployment checklist

---

## 🖥️ Platform Support

### Windows

**Option 1: Git Bash (Recommended)**

```bash
# Install Git for Windows (includes Git Bash)
# Download: https://git-scm.com/download/win

# Then run in Git Bash:
pnpm start:dev
```

**Option 2: WSL**

```bash
# Install WSL if not already installed
wsl --install

# Then run in WSL:
pnpm start:dev
```

**Option 3: PowerShell**

```powershell
# Run via bash
bash -c "pnpm start:dev"
```

### Linux/macOS

```bash
# Native bash support
pnpm start:dev

# Or direct execution
./scripts/start-dev.sh
```

---

## 🎨 Output Examples

### Successful Dev Startup

```bash
$ pnpm start:dev

> AllmightyAPI@1.0.0 start:dev
> bash ./scripts/start-dev.sh

================================
  AllmightyAPI - Dev Startup
================================

How do you want to start the containers?
  1) Detached mode (background) - Recommended for daily use
  2) Attached mode (with logs) - Good for debugging

Enter your choice (1 or 2) [default: 1]: 1

🚀 Starting development environment...

Starting in detached mode...

✅ Containers started successfully!

Running containers:
NAMES                     STATUS              PORTS
allmightyapi-neon-local   Up (healthy)        0.0.0.0:5432->5432/tcp
allmightyapi-dev          Up (healthy)        0.0.0.0:8000->8000/tcp

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Development environment is ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Application:    http://localhost:8000
🗄️  Database:       postgres://neon:npg@localhost:5432/neondb
🌿 Neon Branch:    Ephemeral (auto-created)

Useful commands:
  pnpm docker:dev:logs     - View logs
  pnpm docker:dev:restart  - Restart containers
  pnpm docker:dev:down     - Stop containers
```

### Production Startup with Safety Check

```bash
$ pnpm start:prod

> AllmightyAPI@1.0.0 start:prod
> bash ./scripts/start-prod.sh

================================
  AllmightyAPI - Prod Startup
================================

⚠️  WARNING: You are about to start the PRODUCTION environment!

This will:
  - Connect to Neon Cloud production database
  - Run the application in production mode
  - Expose the application on port 80

Are you sure you want to continue? (yes/no) [default: no]: yes

How do you want to start the container?
  1) Detached mode (background) - Recommended for production
  2) Attached mode (with logs) - Good for initial deployment

Enter your choice (1 or 2) [default: 1]: 1

🚀 Starting production environment...

✅ Container started successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Production environment is ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Application:    http://localhost (or your domain)
🗄️  Database:       Neon Cloud (production)
🔒 Environment:    Production mode

⚠️  Remember to:
  - Set up a reverse proxy (Nginx, Traefik) for SSL/TLS
  - Configure monitoring and alerting
  - Set up log aggregation
  - Configure backups for your Neon database
```

---

## 🔧 Troubleshooting

### "bash: command not found"

**Windows:**

```powershell
# Install Git for Windows
# Download from: https://git-scm.com/download/win
```

**Or use WSL:**

```powershell
wsl --install
```

### ".env.development not found"

```bash
# Copy the example
cp .env.EXAMPLE .env.development

# Edit and add your Neon credentials
notepad .env.development  # Windows
nano .env.development      # Linux/macOS
```

### "Docker is not running"

1. Open Docker Desktop
2. Wait for it to fully start
3. Run the script again

### Script hangs at prompt

- The script is waiting for your input
- Type `1` or `2` and press Enter
- Or just press Enter for the default option

---

## 📊 Command Comparison

| Task           | Bash Script           | pnpm Docker               | Direct Docker                                      |
| -------------- | --------------------- | ------------------------- | -------------------------------------------------- |
| **Start dev**  | `pnpm start:dev`      | `pnpm docker:dev:d`       | `docker compose -f docker-compose.dev.yml up -d`   |
| **Start prod** | `pnpm start:prod`     | `pnpm docker:prod:d`      | `docker compose -f docker-compose.prod.yml up -d`  |
| **View logs**  | N/A (shown in script) | `pnpm docker:dev:logs`    | `docker compose -f docker-compose.dev.yml logs -f` |
| **Stop**       | N/A                   | `pnpm docker:dev:down`    | `docker compose -f docker-compose.dev.yml down`    |
| **Restart**    | N/A                   | `pnpm docker:dev:restart` | `docker compose -f docker-compose.dev.yml restart` |

**Choose based on your needs:**

- **Bash scripts** → Guided, safe, educational
- **pnpm docker:** → Fast, scriptable, automation
- **Direct Docker** → Full control, advanced usage

---

## 🎓 Best Practices

### Daily Development Workflow

```bash
# Morning - use bash script for first start
pnpm start:dev

# During day - use quick commands
pnpm docker:dev:restart      # Quick restart
pnpm docker:dev:logs         # Check logs

# Evening
pnpm docker:dev:down         # Stop everything
```

### Production Deployment

```bash
# Always use the bash script for production
pnpm start:prod

# It forces you to:
# 1. Confirm you want to deploy to production
# 2. Choose the right mode
# 3. Review the deployment checklist
```

### Team Onboarding

New team members can use the bash scripts to:

- ✅ Get guided through setup
- ✅ Learn what's happening at each step
- ✅ See helpful next-step commands
- ✅ Avoid common mistakes

---

## 📚 Complete Command Reference

### All Available Commands

```bash
# Bash scripts (interactive)
pnpm start:dev              # Interactive dev startup
pnpm start:prod             # Interactive prod startup

# Docker shortcuts (fast)
pnpm docker:dev             # Start dev (with logs)
pnpm docker:dev:d           # Start dev (background)
pnpm docker:dev:down        # Stop dev
pnpm docker:dev:logs        # View dev logs
pnpm docker:dev:restart     # Restart dev

pnpm docker:prod            # Start prod (with logs)
pnpm docker:prod:d          # Start prod (background)
pnpm docker:prod:down       # Stop prod
pnpm docker:prod:logs       # View prod logs
pnpm docker:prod:restart    # Restart prod

# Direct script execution
bash ./scripts/start-dev.sh
bash ./scripts/start-prod.sh
```

---

## 🔗 Related Documentation

- **scripts/README.md** - Detailed scripts documentation
- **DOCKER_SCRIPTS.md** - All pnpm docker commands
- **DOCKER_QUICKSTART.md** - Quick reference
- **DOCKER_SETUP.md** - Complete setup guide

---

## ✨ Key Features

### Development Script

✅ Prerequisites check  
✅ Interactive mode selection  
✅ Color-coded output  
✅ Status display  
✅ Helpful next-step commands

### Production Script

✅ All development features PLUS:  
✅ Safety confirmation required  
✅ Production warning  
✅ Deployment checklist  
✅ Default "no" for safety

---

**Recommendation:** Start with `pnpm start:dev` to learn the workflow, then use `pnpm docker:dev:d` for daily speed! 🚀
