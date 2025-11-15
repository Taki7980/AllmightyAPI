# Docker Scripts Reference

Quick reference for the Docker management scripts added to `package.json`.

---

## 🚀 Development Scripts

### Start Development Environment

```powershell
# Start with logs (foreground)
pnpm docker:dev

# Start in detached mode (background)
pnpm docker:dev:d
```

**What it does:**

- Builds the Docker image (if needed)
- Starts Neon Local container (creates ephemeral branch)
- Starts your application container
- Shows live logs (with `docker:dev`) or runs in background (with `docker:dev:d`)

### Stop Development Environment

```powershell
pnpm docker:dev:down
```

**What it does:**

- Stops all containers
- Deletes the ephemeral Neon branch
- Removes the Docker network

### View Logs

```powershell
pnpm docker:dev:logs
```

**What it does:**

- Shows live logs from all containers
- Press `Ctrl+C` to exit (containers keep running)

### Restart Containers

```powershell
pnpm docker:dev:restart
```

**What it does:**

- Restarts both app and Neon Local containers
- Useful after configuration changes
- Does NOT rebuild the image

---

## 🚢 Production Scripts

### Start Production Environment

```powershell
# Start with logs (foreground)
pnpm docker:prod

# Start in detached mode (background)
pnpm docker:prod:d
```

**What it does:**

- Builds the production Docker image
- Starts your application container
- Connects directly to Neon Cloud (no Neon Local)

### Stop Production Environment

```powershell
pnpm docker:prod:down
```

**What it does:**

- Stops the application container
- Removes the Docker network

### View Logs

```powershell
pnpm docker:prod:logs
```

**What it does:**

- Shows live logs from the application
- Press `Ctrl+C` to exit (container keeps running)

### Restart Container

```powershell
pnpm docker:prod:restart
```

**What it does:**

- Restarts the application container
- Useful for applying environment variable changes

---

## 📋 Complete Script List

| Script                     | Description                       |
| -------------------------- | --------------------------------- |
| `pnpm docker:dev`          | Start dev (foreground with logs)  |
| `pnpm docker:dev:d`        | Start dev (detached/background)   |
| `pnpm docker:dev:down`     | Stop dev containers               |
| `pnpm docker:dev:logs`     | View dev logs                     |
| `pnpm docker:dev:restart`  | Restart dev containers            |
| `pnpm docker:prod`         | Start prod (foreground with logs) |
| `pnpm docker:prod:d`       | Start prod (detached/background)  |
| `pnpm docker:prod:down`    | Stop prod containers              |
| `pnpm docker:prod:logs`    | View prod logs                    |
| `pnpm docker:prod:restart` | Restart prod container            |

---

## 🔄 Common Workflows

### Daily Development

```powershell
# Morning: Start development
pnpm docker:dev:d

# Check everything is running
docker ps

# View logs if needed
pnpm docker:dev:logs

# Evening: Stop everything
pnpm docker:dev:down
```

### After Code Changes

```powershell
# Rebuild and restart
pnpm docker:dev:down
pnpm docker:dev:d
```

### Debugging

```powershell
# Start with live logs
pnpm docker:dev

# Or view logs of running containers
pnpm docker:dev:logs
```

### Production Deployment

```powershell
# Configure .env.production first, then:
pnpm docker:prod:d

# Check status
docker ps

# View logs
pnpm docker:prod:logs
```

---

## 💡 Tips

### When to use foreground vs background?

**Foreground (`docker:dev`):**

- ✅ First time running
- ✅ Debugging issues
- ✅ Want to see logs immediately
- ✅ Easy to stop with `Ctrl+C`

**Background (`docker:dev:d`):**

- ✅ Daily development
- ✅ Long-running sessions
- ✅ Free up your terminal
- ✅ Professional setup

### When to rebuild?

You need to rebuild (using `--build` flag, which is included in the scripts) when:

- ✅ You change Dockerfile
- ✅ You add/remove dependencies in package.json
- ✅ You want to ensure latest code is in the image

You DON'T need to rebuild for:

- ❌ Environment variable changes (just restart)
- ❌ Source code changes (if using volume mounts for hot reload)

---

## 🔍 Troubleshooting

### Script not found?

Make sure you're in the project root directory:

```powershell
cd D:\prog\devops\AllmightyAPI
```

### Port already in use?

Stop existing containers first:

```powershell
pnpm docker:dev:down
```

### Image not updating?

Force rebuild:

```powershell
pnpm docker:dev:down
docker system prune -f
pnpm docker:dev:d
```

---

## 🎯 Quick Reference Card

```powershell
# 🟢 START
pnpm docker:dev          # Dev with logs
pnpm docker:dev:d        # Dev background

# 🔴 STOP
pnpm docker:dev:down     # Stop everything

# 📋 LOGS
pnpm docker:dev:logs     # View logs

# 🔄 RESTART
pnpm docker:dev:restart  # Quick restart

# 🚀 PRODUCTION
pnpm docker:prod:d       # Start prod
pnpm docker:prod:down    # Stop prod
```

---

## 🔗 Related Documentation

- **DOCKER_QUICKSTART.md** - Quick start guide
- **DOCKER_SETUP.md** - Complete documentation
- **SETUP_NOTES.md** - Current setup status

---

**Pro Tip:** Add these to your daily workflow:

1. Morning: `pnpm docker:dev:d`
2. Work on your code
3. Evening: `pnpm docker:dev:down`

Simple and clean! 🎉
