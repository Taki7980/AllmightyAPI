# AllmightyAPI - Docker + Neon Database Setup

Complete guide for running AllmightyAPI with **Neon Database** in both development (with Neon Local) and production (with Neon Cloud) environments.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Environment](#development-environment)
- [Production Environment](#production-environment)
- [Database Migrations](#database-migrations)
- [Troubleshooting](#troubleshooting)
- [Configuration Reference](#configuration-reference)

---

## 🎯 Overview

This project uses **Neon Database** for PostgreSQL storage with two distinct deployment modes:

| Environment     | Database   | Proxy  | Branch Type                      |
| --------------- | ---------- | ------ | -------------------------------- |
| **Development** | Neon Local | ✅ Yes | Ephemeral (auto-created/deleted) |
| **Production**  | Neon Cloud | ❌ No  | Persistent                       |

### How it Works

- **Development**: Your app connects to `neon-local` container → Neon Local creates ephemeral branches → Routes to Neon Cloud
- **Production**: Your app connects directly → Neon Cloud serverless database

All configuration is controlled via environment variables (`DATABASE_URL`), making the codebase environment-agnostic.

---

## 🏗️ Architecture

### Development Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│     App     │────────▶│  Neon Local  │────────▶│ Neon Cloud  │
│  Container  │  5432   │   (Proxy)    │   API   │  (Parent)   │
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                               ├─ Creates ephemeral branch
                               ├─ Routes queries to branch
                               └─ Deletes branch on stop
```

### Production Architecture

```
┌─────────────┐                        ┌─────────────┐
│     App     │───────────────────────▶│ Neon Cloud  │
│  Container  │    Direct Connection   │ (Production) │
└─────────────┘                        └─────────────┘
```

---

## ✅ Prerequisites

### Required Software

- **Docker Desktop** (Windows/macOS) or **Docker Engine** (Linux)
  - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - Minimum version: Docker 20.10+ and Docker Compose v2+

- **Neon Account**
  - [Sign up for free](https://console.neon.tech/signup)
  - Free tier includes 1 compute, 3 GB storage, and 100 hours of compute per month

### Required Neon Credentials

You'll need the following from your [Neon Console](https://console.neon.tech):

1. **NEON_API_KEY**
   - Navigate to: Account Settings → API Keys → Create new API key
   - Save this securely - it won't be shown again

2. **NEON_PROJECT_ID**
   - Navigate to: Your Project → Settings → General
   - Copy the Project ID (format: `ep-xxxxx-xxxxx`)

3. **PARENT_BRANCH_ID** (for development)
   - Navigate to: Your Project → Branches
   - Select your main/prod branch → Copy Branch ID

4. **DATABASE_URL** (for production)
   - Navigate to: Your Project → Dashboard → Connection Details
   - Copy the connection string (starts with `postgres://`)

---

## 🚀 Quick Start

### 1. Clone and Configure

```powershell
# Navigate to project directory
cd D:\prog\devops\AllmightyAPI

# Copy environment template
Copy-Item .env.development .env.development.local
```

### 2. Configure Development Environment

Edit `.env.development` and add your Neon credentials:

```env
# Neon API credentials
NEON_API_KEY=neon_api_xxxxxxxxxxxxxxxxxxxxxxxxxxx
NEON_PROJECT_ID=ep-xxxxx-xxxxx
PARENT_BRANCH_ID=br-xxxxx-xxxxx
```

### 3. Start Development Environment

```powershell
# Build and start both app and Neon Local
docker compose -f docker-compose.dev.yml up --build

# Or run in detached mode
docker compose -f docker-compose.dev.yml up -d --build
```

### 4. Verify Setup

```powershell
# Check container status
docker ps

# View logs
docker compose -f docker-compose.dev.yml logs -f app
docker compose -f docker-compose.dev.yml logs -f neon-local

# Test API endpoint
curl http://localhost:8000/health
```

---

## 🔧 Development Environment

### Starting the Development Stack

```powershell
# Start services
docker compose -f docker-compose.dev.yml up

# Start in background
docker compose -f docker-compose.dev.yml up -d

# Rebuild after code changes
docker compose -f docker-compose.dev.yml up --build
```

### What Happens on Startup?

1. **Neon Local container starts**:
   - Connects to Neon API using `NEON_API_KEY`
   - Creates a new ephemeral branch from `PARENT_BRANCH_ID`
   - Starts proxy on port 5432

2. **App container starts**:
   - Waits for Neon Local to be healthy
   - Connects to `postgres://neon:npg@neon-local:5432/allmightyapi?sslmode=require`
   - All database queries route through Neon Local to the ephemeral branch

### Ephemeral Branches Explained

- **Created**: When `docker compose up` runs
- **Purpose**: Fresh, isolated database for each development session
- **Deleted**: When `docker compose down` runs
- **Benefits**: No manual cleanup, no conflicts between dev sessions

### Accessing the Development Database

**Option 1: Through Neon Console**

- Go to [Neon Console](https://console.neon.tech) → Branches
- You'll see your ephemeral branch (named with timestamp)
- Click to view in Neon SQL Editor

**Option 2: Using Drizzle Studio**

```powershell
# From your host machine (not container)
# First, ensure DATABASE_URL points to localhost
$env:DATABASE_URL="postgres://neon:npg@localhost:5432/allmightyapi?sslmode=require"
pnpm run db:studio
```

**Option 3: Using psql or any Postgres client**

```powershell
# Connection details:
Host: localhost
Port: 5432
User: neon
Password: npg
Database: allmightyapi
SSL Mode: require
```

### Stopping Development Environment

```powershell
# Stop and remove containers (ephemeral branch is deleted)
docker compose -f docker-compose.dev.yml down

# Stop but keep containers (ephemeral branch persists)
docker compose -f docker-compose.dev.yml stop

# Stop and remove volumes
docker compose -f docker-compose.dev.yml down -v
```

### Hot Reload / Live Development

To enable live code changes without rebuilding:

1. Uncomment the volume mounts in `docker-compose.dev.yml`:

```yaml
volumes:
  - ./src:/usr/src/app/src:delegated
  - ./logs:/usr/src/app/logs:delegated
```

2. Update `package.json` to use nodemon:

```json
"scripts": {
  "dev": "nodemon --watch src src/index.js"
}
```

3. Add nodemon to dev dependencies:

```powershell
pnpm add -D nodemon
```

---

## 🚢 Production Environment

### 1. Configure Production Environment

Create and configure `.env.production`:

```env
NODE_ENV=production
PORT=8000
LOG_LEVEL=info

# Get this from Neon Console → Dashboard → Connection Details
DATABASE_URL=postgres://user:password@ep-xxxxx-xxxxx.region.aws.neon.tech/allmightyapi?sslmode=require
```

⚠️ **IMPORTANT**: Never commit `.env.production` with real credentials to version control.

### 2. Production Deployment Options

#### Option A: Docker Compose on Server

```bash
# On your production server
git clone <your-repo>
cd AllmightyAPI

# Set environment variables (preferred method)
export DATABASE_URL="postgres://..."
export NODE_ENV="production"

# Or create .env.production (less secure)
nano .env.production

# Build and start
docker compose -f docker-compose.prod.yml up -d

# Check logs
docker compose -f docker-compose.prod.yml logs -f
```

#### Option B: Using Pre-built Images

1. **Build and push to registry:**

```powershell
# Build production image
docker build -t your-registry.com/allmightyapi:latest .

# Push to registry
docker push your-registry.com/allmightyapi:latest
```

2. **Update `docker-compose.prod.yml`:**

```yaml
services:
  app:
    image: your-registry.com/allmightyapi:latest
    # Remove the 'build' section
```

3. **Deploy on server:**

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

#### Option C: Kubernetes / Cloud Platforms

Use the `Dockerfile` with your platform:

- **AWS ECS**: Use the Docker image with ECS task definitions
- **Google Cloud Run**: Deploy directly from Docker image
- **Azure Container Apps**: Deploy using the Dockerfile
- **Kubernetes**: Create deployment manifests using the image

### 3. Production Best Practices

#### Environment Variables

**Method 1: Platform-specific secrets** (Recommended)

- AWS: Secrets Manager or SSM Parameter Store
- Azure: Key Vault
- GCP: Secret Manager
- Kubernetes: Secrets

**Method 2: Docker secrets**

```yaml
# docker-compose.prod.yml
services:
  app:
    secrets:
      - db_url
    environment:
      DATABASE_URL: /run/secrets/db_url

secrets:
  db_url:
    external: true
```

#### Reverse Proxy Setup

Use Nginx or Traefik in front of your app:

**Nginx Example:**

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Health Checks and Monitoring

Ensure your app has a `/health` endpoint:

```javascript
// src/app.js or src/routes/health.js
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

#### Database Connection Pooling

For production, configure Neon's serverless driver with pooling:

```javascript
// src/config/database.js
import { neon, neonConfig } from '@neondatabase/serverless';

// Enable connection pooling in production
if (process.env.NODE_ENV === 'production') {
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(process.env.DATABASE_URL);
```

---

## 🗃️ Database Migrations

### Running Migrations

**Development:**

```powershell
# Generate migration files
docker compose -f docker-compose.dev.yml exec app pnpm run db:generate

# Apply migrations
docker compose -f docker-compose.dev.yml exec app pnpm run db:migrate

# Or from host (if Neon Local is running)
$env:DATABASE_URL="postgres://neon:npg@localhost:5432/allmightyapi?sslmode=require"
pnpm run db:migrate
```

**Production:**

```bash
# SSH into production server
docker compose -f docker-compose.prod.yml exec app pnpm run db:migrate

# Or run as one-off container
docker compose -f docker-compose.prod.yml run --rm app pnpm run db:migrate
```

### Migration Strategy

1. **Always test migrations in development first**
2. **Back up production database before major migrations**
3. **Use Neon's branching for safe schema changes:**

```bash
# Create a branch for testing migration
neon branches create --name migration-test --parent main

# Test migration on branch
DATABASE_URL=<branch-connection-string> pnpm run db:migrate

# If successful, merge to main or apply to production
```

---

## 🔍 Troubleshooting

### Issue: App can't connect to Neon Local

**Symptoms:**

```
Error: getaddrinfo ENOTFOUND neon-local
```

**Solution:**

1. Ensure Neon Local container is running:

   ```powershell
   docker ps | Select-String "neon-local"
   ```

2. Check container logs:

   ```powershell
   docker compose -f docker-compose.dev.yml logs neon-local
   ```

3. Verify network connectivity:
   ```powershell
   docker compose -f docker-compose.dev.yml exec app ping neon-local
   ```

### Issue: SSL certificate errors

**Symptoms:**

```
Error: self signed certificate
```

**Solution for Node.js `pg` driver:**

Update your database connection config:

```javascript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'development'
      ? { rejectUnauthorized: false }
      : true,
});
```

**Solution for Neon serverless driver:**

```javascript
import { neon, neonConfig } from '@neondatabase/serverless';

// For Neon Local in development
if (process.env.NODE_ENV === 'development') {
  neonConfig.fetchEndpoint = 'http://neon-local:5432/sql';
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(process.env.DATABASE_URL);
```

### Issue: Neon Local fails to create branch

**Symptoms:**

```
Error: Failed to create branch: 401 Unauthorized
```

**Solutions:**

1. Verify `NEON_API_KEY` is correct and active
2. Ensure API key has sufficient permissions
3. Check `PARENT_BRANCH_ID` exists and is accessible
4. Verify project quota hasn't been exceeded (free tier limits)

### Issue: Port 5432 already in use

**Symptoms:**

```
Error: bind: address already in use
```

**Solution:**
Change the host port in `docker-compose.dev.yml`:

```yaml
neon-local:
  ports:
    - '5433:5432' # Use 5433 on host instead
```

Then update connection strings to use `localhost:5433`.

### Issue: Performance issues in development

**Solutions:**

1. **Enable persistent branches per Git branch** to avoid recreation:

```yaml
# docker-compose.dev.yml
neon-local:
  environment:
    DELETE_BRANCH: 'false'
  volumes:
    - ./.neon_local/:/tmp/.neon_local
    - ./.git/HEAD:/tmp/.git/HEAD:ro,consistent
```

2. **Use locally cached node_modules**:
   - Remove volume mount for `node_modules` in compose file

### Viewing All Logs

```powershell
# All services
docker compose -f docker-compose.dev.yml logs -f

# Specific service
docker compose -f docker-compose.dev.yml logs -f app
docker compose -f docker-compose.dev.yml logs -f neon-local

# Last 50 lines
docker compose -f docker-compose.dev.yml logs --tail=50
```

---

## ⚙️ Configuration Reference

### Environment Variables

| Variable       | Required | Default       | Description                |
| -------------- | -------- | ------------- | -------------------------- |
| `NODE_ENV`     | No       | `development` | Runtime environment        |
| `PORT`         | No       | `8000`        | Application port           |
| `LOG_LEVEL`    | No       | `info`        | Logging verbosity          |
| `DATABASE_URL` | **Yes**  | -             | Postgres connection string |

### Neon Local Environment Variables

| Variable           | Required | Default        | Description                          |
| ------------------ | -------- | -------------- | ------------------------------------ |
| `NEON_API_KEY`     | **Yes**  | -              | Your Neon API key                    |
| `NEON_PROJECT_ID`  | **Yes**  | -              | Your Neon project ID                 |
| `PARENT_BRANCH_ID` | No       | Default branch | Parent branch for ephemeral branches |
| `BRANCH_ID`        | No       | -              | Connect to specific existing branch  |
| `DELETE_BRANCH`    | No       | `true`         | Delete ephemeral branch on stop      |

**Note:** `PARENT_BRANCH_ID` and `BRANCH_ID` are mutually exclusive.

### Connection String Formats

**Development (Neon Local):**

```
postgres://neon:npg@neon-local:5432/allmightyapi?sslmode=require
```

**Production (Neon Cloud):**

```
postgres://user:password@ep-xxxxx-xxxxx.region.aws.neon.tech/allmightyapi?sslmode=require
```

### Docker Compose Services

#### Development (`docker-compose.dev.yml`)

- `neon-local`: Neon Local proxy for ephemeral branches
- `app`: Application container

#### Production (`docker-compose.prod.yml`)

- `app`: Application container (connects to Neon Cloud)

### Useful Commands

```powershell
# Build images
docker compose -f docker-compose.dev.yml build

# Start services
docker compose -f docker-compose.dev.yml up -d

# Stop services
docker compose -f docker-compose.dev.yml down

# Restart a service
docker compose -f docker-compose.dev.yml restart app

# Execute command in running container
docker compose -f docker-compose.dev.yml exec app pnpm run db:migrate

# View resource usage
docker stats

# Clean up everything
docker compose -f docker-compose.dev.yml down -v --rmi all
```

---

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon Local Documentation](https://neon.tech/docs/local/neon-local)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

## 🆘 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. View logs: `docker compose -f docker-compose.dev.yml logs`
3. Verify all environment variables are set correctly
4. Ensure Docker and Docker Compose are up to date
5. Check [Neon Status](https://neonstatus.com) for service issues

---

## 📝 License

This project is licensed under the ISC License.
