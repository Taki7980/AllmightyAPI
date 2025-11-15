# Docker + Neon Quick Start Guide

## 🚀 Get Started in 3 Minutes

### 1. Configure Environment

```powershell
# Edit .env.development with your Neon credentials
notepad .env.development
```

Add your credentials:

```env
NEON_API_KEY=neon_api_your_key_here
NEON_PROJECT_ID=ep-xxxxx-xxxxx
PARENT_BRANCH_ID=br-xxxxx-xxxxx
```

### 2. Start Development

```powershell
# Using pnpm script (recommended)
pnpm docker:dev:d

# Or using docker compose directly
docker compose -f docker-compose.dev.yml up --build
```

### 3. Verify

```powershell
# Check status
docker ps

# Test API
curl http://localhost:8000/health
```

---

## 📝 Common Commands

### Development (Using pnpm scripts - Recommended)

```powershell
# Start (background)
pnpm docker:dev:d

# Start (with logs)
pnpm docker:dev

# Stop (deletes ephemeral branch)
pnpm docker:dev:down

# View logs
pnpm docker:dev:logs

# Restart containers
pnpm docker:dev:restart

# Run migrations
docker compose -f docker-compose.dev.yml exec app pnpm run db:migrate

# Open shell in container
docker compose -f docker-compose.dev.yml exec app sh
```

### Development (Using docker compose directly)

```powershell
# Start (with logs)
docker compose -f docker-compose.dev.yml up

# Start (background)
docker compose -f docker-compose.dev.yml up -d

# Stop (deletes ephemeral branch)
docker compose -f docker-compose.dev.yml down

# View logs
docker compose -f docker-compose.dev.yml logs -f app

# Rebuild after code changes
docker compose -f docker-compose.dev.yml up --build
```

### Production (Using pnpm scripts - Recommended)

```bash
# Start production stack
pnpm docker:prod:d

# View logs
pnpm docker:prod:logs

# Stop production
pnpm docker:prod:down

# Restart app
pnpm docker:prod:restart

# Run migrations
docker compose -f docker-compose.prod.yml exec app pnpm run db:migrate
```

### Production (Using docker compose directly)

```bash
# Start production stack
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Run migrations
docker compose -f docker-compose.prod.yml exec app pnpm run db:migrate

# Restart app
docker compose -f docker-compose.prod.yml restart app
```

---

## 🔧 Troubleshooting

### Connection Issues

```powershell
# Check if containers are running
docker ps

# Check Neon Local logs
docker compose -f docker-compose.dev.yml logs neon-local

# Test network connectivity
docker compose -f docker-compose.dev.yml exec app ping neon-local
```

### Port Already in Use

If port 5432 or 8000 is taken:

```yaml
# Edit docker-compose.dev.yml
ports:
  - '5433:5432' # Change host port
  - '8001:8000' # Change host port
```

### See All Logs

```powershell
docker compose -f docker-compose.dev.yml logs --tail=100 -f
```

---

## 🗃️ Database Access

### Via Drizzle Studio

```powershell
$env:DATABASE_URL="postgres://neon:npg@localhost:5432/allmightyapi?sslmode=require"
pnpm run db:studio
```

### Via psql

```bash
psql postgres://neon:npg@localhost:5432/allmightyapi?sslmode=require
```

### Connection Details

- **Host**: localhost
- **Port**: 5432
- **User**: neon
- **Password**: npg
- **Database**: allmightyapi
- **SSL**: require

---

## 📚 Full Documentation

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for complete documentation including:

- Architecture details
- Production deployment
- SSL configuration
- Migration strategies
- Troubleshooting guide

---

## 🎯 Environment Variables

### Required for Development

- `NEON_API_KEY` - From Neon Console → Account Settings → API Keys
- `NEON_PROJECT_ID` - From Project Settings → General
- `PARENT_BRANCH_ID` - From Branches tab → Main branch ID

### Required for Production

- `DATABASE_URL` - From Dashboard → Connection Details

---

## 🔄 Common Workflows

### Fresh Start

```powershell
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up --build
```

### Apply New Migrations

```powershell
# Generate migrations
docker compose -f docker-compose.dev.yml exec app pnpm run db:generate

# Apply migrations
docker compose -f docker-compose.dev.yml exec app pnpm run db:migrate
```

### Clean Everything

```powershell
docker compose -f docker-compose.dev.yml down -v --rmi all
```

---

## ⚡ Performance Tips

### Persistent Branches (faster restarts)

Edit `docker-compose.dev.yml`:

```yaml
neon-local:
  environment:
    DELETE_BRANCH: 'false'
  volumes:
    - ./.neon_local/:/tmp/.neon_local
    - ./.git/HEAD:/tmp/.git/HEAD:ro,consistent
```

### Hot Reload (live code changes)

1. Uncomment volumes in `docker-compose.dev.yml`:

```yaml
app:
  volumes:
    - ./src:/usr/src/app/src:delegated
```

2. Install nodemon:

```powershell
pnpm add -D nodemon
```

3. Update package.json:

```json
"scripts": {
  "dev": "nodemon --watch src src/index.js"
}
```
