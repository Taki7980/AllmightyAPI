# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

AllmightyAPI is an Express-based Node.js HTTP API using:

- ESM modules with import aliases (see `package.json` `imports` for `#config/*`, `#utils/*`, `#models/*`, `#routes/*`, `#services/*`, `#middleware/*`, `#controllers/*`, `#validations/*`).
- Drizzle ORM with Neon Postgres (`@neondatabase/serverless`) for persistence.
- Arcjet (`@arcjet/node`) for bot detection, shielding, and rate limiting.
- JWT + HTTP-only cookies for authentication.
- Docker + Docker Compose for local development (Neon Local) and production (Neon Cloud).

The main entrypoint is `src/index.js` → `src/server.js` → `src/app.js`.

## Tooling & Commands

### Package manager and setup

- Install dependencies:
  - `pnpm install`

> `package.json` declares `"packageManager": "pnpm@10.21.0"`; use `pnpm` for all scripts.

### Running the API locally (without Docker)

- Start once (respecting `PORT`, default 8000):
  - `pnpm start`
- Start with Node built-in file watching:
  - `pnpm dev`

### Linting and formatting

From the repo root:

- Lint all JS files:
  - `pnpm lint`
- Lint with auto-fix:
  - `pnpm lint:fix`
- Format with Prettier:
  - `pnpm format`
- Check formatting only:
  - `pnpm format:check`

### Database and Drizzle ORM

Drizzle is configured via `drizzle.config.js`, which uses `DATABASE_URL` for Postgres.

Common commands (run from the host, with `DATABASE_URL` set appropriately):

- Generate migrations from models:
  - `pnpm db:generate`
- Apply migrations to the database:
  - `pnpm db:migrate`
- Launch Drizzle Studio (DB UI):
  - `pnpm db:studio`

When running via Docker, see the Docker sections below for running these inside the app container against Neon Local or Neon Cloud.

### Docker-based development (Neon Local)

The development stack is defined in `docker-compose.dev.yml` and uses a Neon Local proxy container plus an app container.

Key environment:

- `.env.development` (required) with at least:
  - `NEON_API_KEY`
  - `NEON_PROJECT_ID`
  - `PARENT_BRANCH_ID`

#### Pnpm scripts (recommended)

From the repo root:

- Start dev stack with logs (foreground):
  - `pnpm docker:dev`
- Start dev stack detached (background):
  - `pnpm docker:dev:d`
- Stop dev stack and remove containers (and ephemeral Neon branch):
  - `pnpm docker:dev:down`
- Tail dev logs:
  - `pnpm docker:dev:logs`
- Restart dev containers:
  - `pnpm docker:dev:restart`

Common DB operations executed inside the dev app container:

- Apply migrations against Neon Local from inside the container:
  - `docker compose -f docker-compose.dev.yml exec app pnpm run db:migrate`
- Generate migrations inside the container:
  - `docker compose -f docker-compose.dev.yml exec app pnpm run db:generate`

See `DOCKER_QUICKSTART.md` and `DOCKER_SCRIPTS.md` for additional Docker workflows and troubleshooting.

#### Bash startup script workflow

Under `scripts/` there are interactive helpers that wrap the Docker dev/prod flows:

- Start development environment with Neon Local:
  - `pnpm start:dev`
- Start production-like environment with Neon Cloud:
  - `pnpm start:prod`

These scripts:

- Validate the relevant `.env.*` file exists.
- Ensure Docker is running.
- Offer attached vs detached modes.
- Stop existing containers before starting new ones.

See `scripts/README.md` for detailed behavior, usage on different platforms, and troubleshooting.

### Docker-based production (Neon Cloud)

Production stack is defined in `docker-compose.prod.yml` and uses the same Dockerfile `runner` stage.

Key environment:

- `.env.production` (required) with at least:
  - `DATABASE_URL` (Neon Cloud connection string)
  - `NODE_ENV=production`
  - `PORT=8000`

#### Pnpm scripts

- Start prod stack with logs (foreground):
  - `pnpm docker:prod`
- Start prod stack detached (background):
  - `pnpm docker:prod:d`
- Stop prod stack:
  - `pnpm docker:prod:down`
- Tail prod logs:
  - `pnpm docker:prod:logs`
- Restart prod app container:
  - `pnpm docker:prod:restart`

Common DB operations executed inside the prod app container (typically on a server):

- Apply migrations:
  - `docker compose -f docker-compose.prod.yml exec app pnpm run db:migrate`

See `DOCKER_SETUP.md` for full production deployment guidance, including reverse proxy examples and Neon configuration details.

### Direct Docker Compose usage

Equivalent commands without the pnpm wrappers (development):

- Start with logs:
  - `docker compose -f docker-compose.dev.yml up`
- Start detached:
  - `docker compose -f docker-compose.dev.yml up -d`
- Stop and clean up:
  - `docker compose -f docker-compose.dev.yml down`

For production:

- Start detached:
  - `docker compose -f docker-compose.prod.yml up -d`
- View logs:
  - `docker compose -f docker-compose.prod.yml logs -f`

Refer to the DOCKER\_\* docs for additional Compose commands and workflows.

## High-level Architecture

### Runtime and entrypoints

- `src/index.js`
  - Loads environment variables via `dotenv/config`.
  - Imports and executes `src/server.js`.
- `src/server.js`
  - Imports the Express app from `src/app.js`.
  - Reads `PORT` from environment (default 8000).
  - Calls `app.listen` and logs a simple startup message.
- `src/app.js`
  - Creates the Express app instance and wires all middleware and routes.
  - Registers health and root endpoints:
    - `GET /` – simple "hello world" response with logging.
    - `GET /health` – JSON health check used by Docker healthchecks.
    - `GET /api` – basic API heartbeat endpoint.
  - Mounts feature routes:
    - `app.use('/api/auth', authRouter)`
    - `app.use('/api/users', UserRouter)`

### HTTP API layering

The code follows a conventional layered architecture:

- **Routes** (`src/routes/*.routes.js`)
  - Use Express routers to define HTTP endpoints.
  - Delegate business logic to controllers.
  - Examples:
    - `auth.routes.js`: `POST /sign-up`, `POST /sign-in`, `POST /sign-out`.
    - `user.routes.js`: `GET /`, `GET /:id`, `PUT /:id`, `DELETE /:id` (only the collection GET currently uses a real service).

- **Controllers** (`src/controllers/*.controller.js`)
  - Orchestrate request handling: validation, calling services, setting cookies, shaping responses.
  - `auth.controller.js`:
    - Uses Zod (`signupSchema`, `signinSchema`) to validate payloads.
    - Delegates persistence to services (`createUser`, `findUserByEmail`).
    - Uses `jwttoken` and `cookies` utilities to issue and clear auth cookies.
  - `user.controller.js`:
    - Calls `getAllUsersService` to fetch users from the DB.

- **Services** (`src/services/*.js`)
  - Contain business logic and data access through Drizzle.
  - `auth.service.js`:
    - `hashedPassword` wraps `bcrypt.hash` with logging.
    - `createUser` ensures email uniqueness, hashes passwords, inserts into `users` table, and returns a shaped user object.
    - `findUserByEmail` performs a select by email.
  - `user.services.js`:
    - `getAllUsersService` selects a subset of columns from the `users` table for listing.

- **Models** (`src/models/*.model.js`)
  - Drizzle schema definitions for Postgres.
  - `user.model.js` defines the `users` table with fields like `id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`.

- **Validations** (`src/validations/*.validations.js`)
  - Zod schemas to validate incoming request payloads.
  - `auth.validations.js` contains `signupSchema` and `signinSchema` used by the auth controller.

- **Utilities** (`src/utils/*.js`)
  - `jwt.js`: wraps `jsonwebtoken` with `sign` and `verify`, using `JWT_SECRET` (or a fallback) and a default expiry.
  - `cookies.js`: centralizes cookie options and provides `set`, `clear`, and `get` helpers.
  - `format.js`: converts Zod validation errors into client-friendly strings.

When adding new features, prefer to follow this route → controller → service → model → utils pattern and use the existing import aliases (e.g., `#services/...`) instead of deep relative imports.

### Configuration, security, and logging

- **Logging** – `src/config/logger.js`
  - Uses `winston` with JSON logs by default.
  - Writes to `logs/error.log` and `logs/combined.log`.
  - In non-production environments, also logs to the console with colorized/simple output.

- **Database** – `src/config/database.js`
  - Uses Neon serverless driver (`@neondatabase/serverless`) and Drizzle.
  - In development (`NODE_ENV === 'development'`), configures the driver to talk to the `neon-local` proxy container (`fetchEndpoint`, `useSecureWebSocket`, `poolQueryViaFetch`).
  - Exports both the raw `sql` function and Drizzle `db` instance for queries.

- **Arcjet / security middleware**
  - `src/config/arcjet.js` defines a base Arcjet client with:
    - `shield` for baseline protection.
    - `detectBot` with a live mode that blocks suspected bots (while allowing known search engines).
    - A global `slidingWindow` rule.
  - `src/middleware/security.middleware.js` wraps Arcjet for request-level decisions:
    - Derives a `role` (`admin`, `user`, `guest`) from `req.user?.role || 'guest'` and adjusts rate limits accordingly.
    - Adds an additional `slidingWindow` rule per role.
    - Logs and returns 403s for bot, shield, or rate-limit denials.
    - On errors, responds with a 501 and a generic security middleware error message.
  - This middleware is registered early in the stack in `app.js` (`app.use(securityMiddleware)`), before CORS and cookies.

### Environment and configuration

Key environment variables used across the codebase and Docker:

- `NODE_ENV` – controls dev vs production behavior (logging, Neon config, cookie security, etc.).
- `PORT` – HTTP port for the Express server (mirrored in Docker Compose port mappings).
- `DATABASE_URL` – Postgres connection string used by Drizzle and Drizzle CLI.
- `LOG_LEVEL` – logging verbosity (used by the winston logger and reflected in Docker Compose defaults).
- `JWT_SECRET` – secret for signing JWTs (defaults to a hardcoded value if not set; consider overriding it in all real environments).
- Arcjet-related:
  - `ARCJET_KEY` – used in `src/config/arcjet.js` to initialize the Arcjet client.
- Neon-related (primarily via Docker/Neon Local):
  - `NEON_API_KEY`, `NEON_PROJECT_ID`, `PARENT_BRANCH_ID`, etc., as detailed in the DOCKER\_\* docs.

For a complete matrix of environment variables and recommended values per environment, reference `DOCKER_SETUP.md` ("Configuration Reference" section).

## Notes for Warp Agents

- Prefer using the existing `#...` import aliases when creating or moving files; update `package.json` `imports` if new top-level areas are introduced under `src/`.
- When adding new API endpoints, follow the existing pattern:
  - Define routes in `src/routes/*.routes.js`.
  - Add controllers in `src/controllers/`.
  - Put DB/business logic in `src/services/` and schemas in `src/models/`/`src/validations/` as needed.
- If you change the database schema (Drizzle models), ensure corresponding migrations are generated and applied, and, if relevant, update any Docker/Neon documentation references.
- When modifying security or rate-limiting behavior, update both `src/config/arcjet.js` and `src/middleware/security.middleware.js` coherently, and verify that the `/health` endpoint remains fast and available since it is used by healthchecks in Docker and the Dockerfile.
- There is currently no dedicated test runner or test script defined in `package.json`; if you introduce one (e.g., Jest/Vitest), document the commands here and wire any necessary scripts into `package.json` so future agents can run single tests reliably.
