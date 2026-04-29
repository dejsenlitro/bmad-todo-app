---
title: 'Story 1.2: Database & Docker Compose'
type: 'feature'
created: '2026-04-29'
status: 'in-progress'
baseline_commit: '0b0a4e1'
context:
  - '_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The application has no database, no Docker containers, and cannot run via `docker-compose up`. Story 1.1 delivered scaffolds that run locally with npm scripts, but the architecture requires PostgreSQL, multi-stage Dockerfiles, Nginx reverse proxy, and dev/test Docker Compose profiles.

**Approach:** Create the database init script, add pg.Pool database config to the server, wire the health endpoint to verify DB connectivity, create multi-stage Dockerfiles for client (Nginx) and server (Node), build docker-compose.yml with 3 containers, and add dev/test override files.

## Boundaries & Constraints

**Always:**
- PostgreSQL 16 with `db/init.sql` schema creation
- `pg.Pool` configured via `DATABASE_URL` environment variable
- Multi-stage Dockerfiles with non-root users and HEALTHCHECK
- Nginx serves static files and proxies `/api` to server container
- Docker Compose: client (port 80), server (port 3001), db (port 5432)
- Dev override: volume mounts, Vite HMR, tsx --watch
- Test override: separate test DB, Playwright-ready
- CSP headers on server responses
- CORS restricted to frontend origin
- Health endpoint checks database connectivity

**Ask First:**
- Adding any dependency not in architecture doc
- Changing container ports or network topology

**Never:**
- No todo CRUD logic — that's Story 2.1
- No frontend component changes
- No test files (Story 3.x)

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Health (DB up) | `GET /api/health` | `{"status":"ok"}` HTTP 200 | N/A |
| Health (DB down) | `GET /api/health`, DB unreachable | `{"status":"error"}` HTTP 503 | Graceful degradation |
| Docker up | `docker-compose up` | 3 containers healthy | Containers restart on failure |
| Dev mode | `docker-compose -f ... -f docker-compose.dev.yml up` | HMR + watch mode active | N/A |

</frozen-after-approval>

## Code Map

- `db/init.sql` -- PostgreSQL schema creation (todos table)
- `server/src/config/database.ts` -- pg.Pool setup from DATABASE_URL
- `server/src/routes/health-routes.ts` -- Update to check DB connectivity
- `server/src/app.ts` -- Register CSP headers hook
- `client/Dockerfile` -- Multi-stage: build → Nginx
- `client/nginx.conf` -- Static files + /api proxy
- `server/Dockerfile` -- Multi-stage: build → Node runtime
- `docker-compose.yml` -- Production/default 3-container orchestration
- `docker-compose.dev.yml` -- Dev overrides (volumes, HMR, watch)
- `docker-compose.test.yml` -- Test overrides (test DB, Playwright)
- `.env.example` -- Update with all Docker-relevant vars

## Tasks & Acceptance

**Execution:**
- [ ] `db/init.sql` -- Create todos table with UUID pk, text, completed, created_at
- [ ] `server/src/config/database.ts` -- Export pg.Pool configured from DATABASE_URL env var
- [ ] `server/src/routes/health-routes.ts` -- Update health endpoint to query DB (`SELECT 1`) and return 503 if unreachable
- [ ] `server/src/app.ts` -- Add CSP headers via onSend hook, register graceful shutdown for pool
- [ ] `client/Dockerfile` + `client/nginx.conf` -- Multi-stage Dockerfile (build with Node, serve with Nginx), nginx config proxying /api to server:3001
- [ ] `server/Dockerfile` -- Multi-stage Dockerfile (build with Node, run with Node slim), non-root user, HEALTHCHECK
- [ ] `docker-compose.yml` -- 3 services (client, server, db), networking, volumes, env, health checks
- [ ] `docker-compose.dev.yml` -- Dev overrides: source mounts, Vite dev server, tsx watch, exposed ports
- [ ] `docker-compose.test.yml` -- Test overrides: separate test DB, Playwright service placeholder
- [ ] `.env.example` -- Update with Docker-relevant env vars
- [ ] Git commit -- Commit all Story 1.2 changes

**Acceptance Criteria:**
- Given a fresh clone, when `docker-compose up --build` is run, then 3 containers start and `curl localhost/api/health` returns `{"status":"ok"}`
- Given the dev override is used, when `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up` is run, then source volumes are mounted and hot reload works
- Given the database is running, when `db/init.sql` is inspected, then it contains the todos table schema
- Given the health endpoint is called with DB down, then it returns HTTP 503 with `{"status":"error"}`
- Given Dockerfiles are inspected, then both use multi-stage builds, run as non-root users, and include HEALTHCHECK

## Verification

**Commands:**
- `docker-compose up --build -d && sleep 5 && curl -s http://localhost/api/health && docker-compose down` -- expected: `{"status":"ok"}`
- `docker-compose config` -- expected: valid compose file, no errors
