# Epic 1 Context: Project Foundation & Infrastructure

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Deliver a "zero to running" foundation so that a developer can clone the repo, run `docker-compose up`, and have a healthy, empty system with all infrastructure ready for feature development. This epic covers project scaffolding, dev tooling, database schema, Docker orchestration, and the health endpoint.

## Stories

- Story 1.1: Project Scaffold & Dev Environment
- Story 1.2: Database & Docker Compose

## Requirements & Constraints

- Health endpoint: `GET /api/health` returns `{"status":"ok"}` with HTTP 200 when service and database are healthy.
- Application must run via `docker-compose up` with zero manual setup beyond clone + run.
- Dockerfiles use multi-stage builds, run as non-root users, include HEALTHCHECK directives.
- Docker Compose supports dev and test profiles via override files and environment variables.
- Codebase structured for readability — clear separation of concerns.
- Frontend and backend independently deployable and testable.
- Layered backend design: routes → services → repositories.
- Application free of XSS/injection vulnerabilities: parameterized queries, CSP headers, CORS whitelist.

## Technical Decisions

- **Frontend:** Vite 8.x + React 19.x + TypeScript 5.x, scaffolded via `npm create vite@latest client -- --template react-ts`. Tailwind CSS v4 added post-scaffold.
- **Backend:** Fastify 5.x + TypeScript 5.x, manually set up. ESM modules (`"type": "module"`). Node.js 22 LTS runtime. `tsx` for dev, `tsc` for production.
- **Database:** PostgreSQL 16 via Docker. Single `todos` table with UUID primary keys (`gen_random_uuid()`). Schema via `db/init.sql`. `pg` (node-postgres) with `pg.Pool`, parameterized queries only.
- **Backend structure:** 3-layer — `routes/` (JSON Schema validation) → `services/` (business logic) → `repositories/` (SQL queries, snake→camel mapping). App factory pattern in `app.ts` for testability.
- **Testing:** Vitest for unit/integration (both packages), Playwright for E2E. Co-located test files. c8/istanbul for coverage.
- **Docker:** 3 containers — client (Nginx, port 80), server (Node, port 3001), db (PostgreSQL, port 5432). Nginx proxies `/api` to server. Dev mode: Vite HMR + `tsx --watch` with volume mounts. Test mode: separate test DB + Playwright.
- **Logging:** Pino via Fastify built-in (structured JSON).
- **Security:** `@fastify/cors` with origin whitelist, CSP headers, parameterized SQL only.
- **Naming:** DB snake_case, API camelCase, files kebab-case, components PascalCase, constants UPPER_SNAKE_CASE.
- **Environment:** `.env` files + Docker Compose env. `.env.example` template.

## Cross-Story Dependencies

- Story 1.1 scaffolds both packages, installs all dependencies, creates the health endpoint, and sets up Tailwind. Story 1.2 depends on 1.1 being complete to add database connectivity, Docker Compose, and init.sql.
