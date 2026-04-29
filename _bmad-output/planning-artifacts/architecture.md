---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - docs/requirements.md
workflowType: 'architecture'
project_name: 'todo-app'
user_name: 'Arin'
date: '2026-04-29'
lastStep: 8
status: 'complete'
completedAt: '2026-04-29'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (12 FRs):**

| Area | FRs | Architectural Implication |
|------|-----|---------------------------|
| Todo CRUD | FR-1 to FR-5 | Single resource REST API, one database table |
| RESTful API | FR-6 to FR-8, FR-12 | Standard CRUD endpoints + health check. JSON error format defined. |
| UI States | FR-9 to FR-11 | Frontend state management: loading, empty, error. Optimistic updates per UX spec. |

This is a **single-entity CRUD app** — one resource type (`Todo`), four operations (create, read, update-status, delete), one API consumer (the SPA).

**Non-Functional Requirements (17 NFRs) — Architectural Drivers:**

| NFR | Constraint | Architecture Impact |
|-----|-----------|---------------------|
| NFR-1/2/3 | 200ms UI, 500ms API p95, 2s page load | Simple stack, no heavy frameworks. Optimistic UI. |
| NFR-6 | Frontend + backend independently deployable | Separate containers, no SSR monolith |
| NFR-9 | Layered design (routes/logic/data) | 3-layer backend: routes → service → repository |
| NFR-12/13/14 | Docker Compose, multi-stage, non-root, profiles | Multi-container orchestration with dev/test profiles |
| NFR-15/16 | 70% coverage, 5+ Playwright E2E tests | Test infrastructure baked into project structure |
| NFR-17 | XSS/injection free | Input sanitization, parameterized queries, CSP headers |

### Scale & Complexity

- **Primary domain:** Full-stack web application (SPA + REST API + database)
- **Complexity level:** Low — single entity, no auth, no real-time, no multi-tenancy
- **Estimated architectural components:** 3 (frontend SPA, backend API, database)
- **Data model:** 1 table, 4 columns (id, text, completed, created_at)
- **API surface:** 5 endpoints (GET list, POST, PATCH, DELETE, GET health)

### Technical Constraints & Dependencies

1. **Docker Compose required** — `docker-compose up` must be zero-config (NFR-12)
2. **Multi-stage Dockerfiles** — non-root users, health checks (NFR-13)
3. **Dev/test profiles** — environment variable driven (NFR-14)
4. **Testing stack mandated** — Jest/Vitest + Playwright (from requirements.md)
5. **Browser matrix** — latest 2 versions of Chrome, Firefox, Safari, Edge (NFR-10)
6. **WCAG 2.1 AA** — keyboard nav, screen reader, focus management (NFR-11)
7. **Layered architecture** — must support future auth/multi-user without restructure (NFR-9)

### Cross-Cutting Concerns

| Concern | Spans | Notes |
|---------|-------|-------|
| **Error handling** | Frontend + Backend | Consistent JSON error format, user-facing messages without internals |
| **Input validation** | Frontend + Backend | Client: empty/whitespace rejection. Server: 1–255 char enforcement, sanitization |
| **Security** | Frontend + Backend | XSS prevention (output encoding), SQL injection prevention (parameterized queries), CSP headers |
| **Testing** | All layers | Unit + integration + E2E across frontend, backend, and Docker |
| **Health monitoring** | Backend + Docker | `/health` endpoint consumed by Docker health check |
| **Environment config** | All containers | Dev/test profiles via env vars and compose profiles |

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application (SPA + REST API + PostgreSQL) based on project requirements analysis.

**Tech stack selected:** TypeScript, React, Fastify, PostgreSQL.

### Starter Options Considered

| Option | Description | Verdict |
|--------|------------|--------|
| **create-vite (react-ts)** | Official Vite scaffold for React + TypeScript | Best for frontend — minimal, fast, no opinions beyond build tooling |
| **fastify-cli generate** | Fastify's official scaffold | Generates JS by default, opinionated plugin structure — more setup than needed |
| **Manual Fastify + TypeScript** | Hand-built from `npm init` | Better fit — full control over layered architecture (routes/service/repository) |
| **T3 Stack / create-t3-app** | Next.js + tRPC + Prisma | Wrong paradigm — SSR monolith, not separate SPA + API containers |
| **Turborepo** | Monorepo tooling | Overkill for 2 packages in a simple todo app |

### Selected Approach

**Frontend:** `npm create vite@latest client -- --template react-ts`
**Backend:** Manual TypeScript + Fastify setup

**Rationale:** No single full-stack starter covers TypeScript + React + Fastify + PostgreSQL well. Two lightweight starters composed in a flat folder structure gives full control over the layered backend architecture (NFR-9) and separate Dockerfiles per service (NFR-6, NFR-12) with no unnecessary abstractions.

**Initialization Commands:**

```bash
# Frontend (Vite + React + TypeScript)
npm create vite@latest client -- --template react-ts

# Backend (manual setup)
mkdir -p server/src/{routes,services,repositories}
cd server && npm init -y
npm i fastify @fastify/cors @fastify/sensible pg
npm i -D typescript @types/node @types/pg tsx vitest
```

### Architectural Decisions Provided by Starters

**Language & Runtime:**
- TypeScript 5.x across both packages
- Node.js 22.x (LTS) runtime for backend
- ESM modules (`"type": "module"`)

**Frontend (Vite + React):**
- Vite 8.x dev server with HMR
- React 19.x with functional components
- Tailwind CSS v4 (added post-scaffold)
- Build output: static files served by Nginx or Vite preview

**Backend (Fastify):**
- Fastify 5.x with built-in JSON Schema validation
- `@fastify/cors` for cross-origin SPA requests
- `pg` (node-postgres) — raw SQL with parameterized queries (no ORM)
- 3-layer structure: routes → services → repositories (NFR-9)
- `tsx` for development, `tsc` for production build

**Database:**
- PostgreSQL 16 via Docker container
- Single `todos` table, parameterized queries for injection prevention

**Testing:**
- Vitest for unit + integration tests (both frontend and backend)
- Playwright for E2E tests
- c8/istanbul coverage reporting

**Project Structure:**

```
todo-app/
├── client/                 # Vite + React + TypeScript
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Fastify + TypeScript
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── repositories/
│   ├── Dockerfile
│   └── package.json
├── e2e/                    # Playwright E2E tests
│   └── package.json
├── docker-compose.yml
└── package.json            # Root scripts only
```

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
All critical decisions are made — tech stack, data model, API contract, deployment strategy.

**Deferred Decisions (Post-MVP):**
- Authentication method (JWT vs. session) — when auth is added
- Caching strategy — not needed for single-user, single-table
- Rate limiting — not needed without public API exposure
- CI/CD pipeline — can be added after Docker Compose works locally

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|----------|
| Database | PostgreSQL 16 | Robust, widely supported, Docker-ready |
| Driver | `pg` (node-postgres) | Raw SQL, no ORM overhead, parameterized queries for security |
| Primary key | UUID v4 (`gen_random_uuid()`) | No enumeration attack surface, future-proof for multi-user |
| Migrations | SQL init script (`init.sql`) | Single table — no migration framework needed |
| Connection pooling | `pg.Pool` (built-in) | Default pool size sufficient for single-user app |

**Schema:**

```sql
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text VARCHAR(255) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|----------|
| Authentication | None (MVP) | Out of scope per PRD |
| Input sanitization | Server-side text trimming + length validation | Prevent XSS at API boundary |
| SQL injection | Parameterized queries only | `pg` supports `$1, $2` placeholders natively |
| XSS prevention | React's default escaping + CSP headers | React escapes by default; CSP as defense-in-depth |
| CORS | `@fastify/cors` with origin whitelist | Allow only the frontend origin |

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|----------|
| API style | REST with `/api` prefix | Simple CRUD, no complex relationships |
| Validation | Fastify JSON Schema | Built-in, zero-dependency, generates type-safe handlers |
| Error format | `{ error: string, statusCode: number }` | Per FR-8, human-readable, no stack traces |
| Serialization | Fastify response schemas | Auto-strips unexpected fields from responses |
| API docs | None (MVP) | 5 endpoints, documented in architecture doc |

**API Contract:**

| Method | Path | Request Body | Response | Status |
|--------|------|-------------|----------|--------|
| `GET` | `/api/todos` | — | `Todo[]` | 200 |
| `POST` | `/api/todos` | `{ text: string }` | `Todo` | 201 |
| `PATCH` | `/api/todos/:id` | `{ completed: boolean }` | `Todo` | 200 |
| `DELETE` | `/api/todos/:id` | — | — | 204 |
| `GET` | `/api/health` | — | `{ status: "ok" }` | 200 |

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|----------|
| State management | `useState` + custom `useTodos` hook | Single array of todos — no external state library needed |
| HTTP client | Native `fetch` API | No axios dependency; modern browsers all support it |
| Routing | None | Single page, no navigation — no router needed |
| CSS approach | Tailwind CSS v4, utility classes | Per UX design spec, no component library |
| Build output | Static files | Served by Nginx in production container |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|----------|
| Container orchestration | Docker Compose | Per NFR-12, zero-config `docker-compose up` |
| Frontend serving | Nginx (production), Vite dev server (dev) | Static file serving + API reverse proxy |
| Backend runtime | Node.js 22 LTS | Long-term support, ESM native |
| Dev mode | `tsx --watch` (backend), Vite HMR (frontend) | Fast feedback loops |
| Logging | Pino (via Fastify built-in) | JSON structured logs, zero config |
| Health checks | `GET /api/health` + Docker HEALTHCHECK | Per FR-12, NFR-13 |
| Environment config | `.env` files + Docker Compose env | Per NFR-14, dev/test profiles |

### Decision Impact Analysis

**Implementation sequence:**
1. Database schema (init.sql) → 2. Backend API (routes/services/repositories) → 3. Frontend SPA → 4. Docker Compose → 5. E2E tests

**Cross-component dependencies:**
- Frontend depends on API contract (table above)
- Docker Compose depends on both Dockerfiles
- E2E tests depend on full stack running
- Health check spans backend + database connectivity

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database:**

| Element | Convention | Example |
|---------|-----------|--------|
| Tables | lowercase plural | `todos` |
| Columns | snake_case | `created_at` |
| Primary key | `id` | `id UUID` |

**API:**

| Element | Convention | Example |
|---------|-----------|--------|
| Endpoints | lowercase plural, `/api` prefix | `/api/todos` |
| Route params | `:paramName` (camelCase) | `/api/todos/:id` |
| JSON fields | camelCase | `{ createdAt, completed }` |

**Note:** Database uses `snake_case` (`created_at`), API responses use `camelCase` (`createdAt`). The repository layer handles the mapping.

**TypeScript code:**

| Element | Convention | Example |
|---------|-----------|--------|
| Files | kebab-case | `todo-repository.ts` |
| React components | PascalCase file + export | `TodoItem.tsx` → `export function TodoItem()` |
| Functions | camelCase | `createTodo()`, `getTodos()` |
| Interfaces/types | PascalCase, no `I` prefix | `Todo`, `CreateTodoRequest` |
| Constants | UPPER_SNAKE_CASE | `MAX_TODO_LENGTH` |
| Env vars | UPPER_SNAKE_CASE | `DATABASE_URL`, `PORT` |

### Structure Patterns

**Tests:** Co-located with source files.

```
server/src/routes/todo-routes.ts
server/src/routes/todo-routes.test.ts
client/src/components/TodoItem.tsx
client/src/components/TodoItem.test.tsx
```

**Backend organization (3-layer):**

```
server/src/
├── index.ts              # Fastify setup, plugin registration
├── routes/
│   ├── todo-routes.ts    # Route handlers, JSON Schema validation
│   └── health-routes.ts  # Health check endpoint
├── services/
│   └── todo-service.ts   # Business logic (validation, transforms)
├── repositories/
│   └── todo-repository.ts # Database queries (pg.Pool)
├── config/
│   └── database.ts       # Pool setup, connection config
└── types/
    └── todo.ts           # Shared TypeScript interfaces
```

**Frontend organization (by type):**

```
client/src/
├── App.tsx               # Root component
├── main.tsx              # Entry point
├── components/
│   ├── TodoInput.tsx
│   ├── TodoItem.tsx
│   ├── TodoList.tsx
│   ├── EmptyState.tsx
│   └── ErrorBanner.tsx
├── hooks/
│   └── useTodos.ts       # API calls + state management
├── api/
│   └── todo-api.ts       # fetch wrappers for /api/todos
└── types/
    └── todo.ts           # Shared types (mirrors server)
```

### Format Patterns

**API responses — no wrapper object:**

```typescript
// GET /api/todos → 200
[{ id: "uuid", text: "Buy milk", completed: false, createdAt: "2026-04-29T..." }]

// POST /api/todos → 201
{ id: "uuid", text: "Buy milk", completed: false, createdAt: "2026-04-29T..." }

// DELETE /api/todos/:id → 204 (no body)

// Error → 400/404/500
{ error: "Todo text is required", statusCode: 400 }
```

**Dates:** ISO 8601 strings in API responses (`2026-04-29T12:00:00.000Z`). Stored as `TIMESTAMPTZ` in PostgreSQL.

**Booleans:** `true`/`false` (never `1`/`0`).

**Null:** Avoid nulls in API responses. Use empty strings or omit optional fields.

### Process Patterns

**Error handling — backend:**

- Routes catch service errors and map to HTTP responses
- Services throw descriptive errors
- Repositories throw only database-related errors
- Fastify's error handler formats all errors to `{ error, statusCode }`

**Error handling — frontend:**

- `useTodos` hook wraps all API calls in try/catch
- Errors set an error state string
- ErrorBanner component renders when error state is non-null
- Error auto-clears after 5s or on next successful action

**Optimistic updates — frontend:**

1. Update local state immediately
2. Fire API call
3. On success: reconcile (replace temp ID, etc.)
4. On failure: revert local state + set error message

**Validation timing:**

- Client: validate on submit only (empty/whitespace check)
- Server: validate in route handler via JSON Schema (text: 1–255 chars, trimmed)
- Database: NOT NULL constraints as last defense

### Enforcement Guidelines

**All AI agents MUST:**

1. Follow the naming conventions above — no exceptions
2. Place new code in the correct layer (routes/services/repositories)
3. Use parameterized queries (`$1, $2`) — never string interpolation for SQL
4. Co-locate tests with source files
5. Return camelCase JSON from API (map from snake_case in repository)
6. Use Fastify JSON Schema for all route validation
7. Handle errors at the appropriate layer (repository → service → route)

**Anti-patterns (never do):**

- `any` type in TypeScript — use explicit types
- Direct database access from routes — always go through service → repository
- `innerHTML` or `dangerouslySetInnerHTML` — React's default escaping is sufficient
- String concatenation for SQL — always parameterized queries
- Console.log for logging — use Fastify's built-in Pino logger

## Project Structure & Boundaries

### Complete Project Directory Structure

```
todo-app/
├── .gitignore
├── .env.example                    # Template for env vars
├── docker-compose.yml              # Production/default compose
├── docker-compose.dev.yml          # Dev overrides (volume mounts, hot reload)
├── docker-compose.test.yml         # Test overrides (test DB, Playwright)
├── package.json                    # Root: workspace scripts only
├── README.md
│
├── client/                         # FRONTEND — React + Vite + Tailwind
│   ├── Dockerfile                  # Multi-stage: build → Nginx
│   ├── nginx.conf                  # Serve static + reverse proxy /api → server
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts              # Dev proxy: /api → localhost:3001
│   ├── index.html                  # Vite entry point
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── main.tsx                # React root render
│       ├── App.tsx                 # Root component
│       ├── index.css               # Tailwind directives
│       ├── components/
│       │   ├── TodoInput.tsx       # FR-1: create todo form
│       │   ├── TodoInput.test.tsx
│       │   ├── TodoItem.tsx        # FR-4: display + toggle + delete
│       │   ├── TodoItem.test.tsx
│       │   ├── TodoList.tsx        # FR-3: display all todos
│       │   ├── TodoList.test.tsx
│       │   ├── EmptyState.tsx      # FR-10: empty list message
│       │   ├── EmptyState.test.tsx
│       │   ├── ErrorBanner.tsx     # FR-11: error display
│       │   └── ErrorBanner.test.tsx
│       ├── hooks/
│       │   ├── useTodos.ts         # State + optimistic updates
│       │   └── useTodos.test.ts
│       ├── api/
│       │   ├── todo-api.ts         # fetch wrappers for /api/todos
│       │   └── todo-api.test.ts
│       └── types/
│           └── todo.ts             # Todo interface (mirrors server)
│
├── server/                         # BACKEND — Fastify + TypeScript
│   ├── Dockerfile                  # Multi-stage: build → Node runtime
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                # Fastify setup, plugin registration, listen
│       ├── app.ts                  # App factory (for testing)
│       ├── routes/
│       │   ├── todo-routes.ts      # FR-1–5: CRUD endpoints
│       │   ├── todo-routes.test.ts
│       │   ├── health-routes.ts    # FR-12: GET /api/health
│       │   └── health-routes.test.ts
│       ├── services/
│       │   ├── todo-service.ts     # Business logic, validation
│       │   └── todo-service.test.ts
│       ├── repositories/
│       │   ├── todo-repository.ts  # pg.Pool queries, snake→camel mapping
│       │   └── todo-repository.test.ts
│       ├── config/
│       │   └── database.ts         # pg.Pool setup, env-based config
│       ├── schemas/
│       │   └── todo-schemas.ts     # Fastify JSON Schema definitions
│       └── types/
│           └── todo.ts             # Todo, CreateTodoRequest, etc.
│
├── e2e/                            # E2E — Playwright
│   ├── package.json
│   ├── playwright.config.ts
│   └── tests/
│       ├── todo-create.spec.ts     # UJ-2: add todo
│       ├── todo-complete.spec.ts   # UJ-3: complete todo
│       ├── todo-delete.spec.ts     # UJ-4: delete todo
│       ├── todo-empty.spec.ts      # UJ-1: empty state
│       └── todo-error.spec.ts      # FR-11: error handling
│
└── db/                             # DATABASE — PostgreSQL init
    └── init.sql                    # CREATE TABLE todos
```

### Architectural Boundaries

**API Boundary (server ↔ client):**

- All communication through REST endpoints at `/api/*`
- Client never accesses database directly
- Server returns camelCase JSON; database stores snake_case
- CORS restricts to frontend origin only

**Layer Boundaries (within server):**

```
Routes          → receive HTTP, validate via JSON Schema, call service, return response
    ↓ calls
Services        → business logic, input sanitization, error wrapping
    ↓ calls
Repositories    → SQL queries via pg.Pool, snake→camel mapping, return typed objects
    ↓ uses
Database (pg)   → PostgreSQL connection pool
```

- Routes never import from repositories
- Repositories never import from routes
- Services are the only bridge between routes and repositories

**Container Boundaries (Docker):**

| Container | Port | Exposes | Depends On |
|-----------|------|---------|------------|
| `client` (Nginx) | 80 | Static files + `/api` proxy | `server` |
| `server` (Node) | 3001 | REST API | `db` |
| `db` (PostgreSQL) | 5432 | Database | — |

### Requirements to Structure Mapping

| Requirement | Component | File(s) |
|-------------|-----------|----------|
| FR-1 (Create todo) | Frontend + Backend | `TodoInput.tsx`, `todo-routes.ts`, `todo-service.ts`, `todo-repository.ts` |
| FR-3 (View todos) | Frontend + Backend | `TodoList.tsx`, `TodoItem.tsx`, `todo-routes.ts` (GET) |
| FR-4 (Complete todo) | Frontend + Backend | `TodoItem.tsx`, `todo-routes.ts` (PATCH) |
| FR-5 (Delete todo) | Frontend + Backend | `TodoItem.tsx`, `todo-routes.ts` (DELETE) |
| FR-8 (Error responses) | Backend | `todo-routes.ts`, Fastify error handler in `app.ts` |
| FR-10 (Empty state) | Frontend | `EmptyState.tsx` |
| FR-11 (Error state) | Frontend | `ErrorBanner.tsx` |
| FR-12 (Health check) | Backend + Docker | `health-routes.ts`, `Dockerfile` HEALTHCHECK |
| NFR-9 (Layered arch) | Backend | `routes/` → `services/` → `repositories/` |
| NFR-12 (Docker) | Infrastructure | `docker-compose.yml`, `Dockerfile` × 2 |
| NFR-15 (70% coverage) | All | `.test.ts` files co-located with source |
| NFR-16 (5 E2E tests) | E2E | `e2e/tests/*.spec.ts` (5 files) |
| NFR-17 (Security) | Backend | Parameterized queries, JSON Schema validation, CSP |

### Data Flow

```
User action → React component → useTodos hook → todo-api.ts (fetch)
    → /api/todos → todo-routes.ts → todo-service.ts → todo-repository.ts
    → PostgreSQL → response back up the chain → UI update
```

### Development Workflow

**Dev mode** (`docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`):

- Client: Vite dev server on port 5173, HMR, proxy `/api` → server:3001
- Server: `tsx --watch src/index.ts`, auto-restart on changes
- DB: PostgreSQL on port 5432, init.sql runs on first start
- Source volumes mounted for hot reload

**Test mode** (`docker-compose -f docker-compose.yml -f docker-compose.test.yml up`):

- Separate test database
- Playwright runs against the full stack
- Coverage reports generated

**Production mode** (`docker-compose up`):

- Client: Nginx serves built static files, proxies `/api`
- Server: Compiled JS, Node.js runtime
- DB: PostgreSQL with persistent volume

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** All choices are compatible.

- TypeScript 5.x + React 19.x + Vite 8.x — fully supported combination
- Fastify 5.x + `pg` — native ESM, no compatibility issues
- PostgreSQL 16 + Docker — standard pairing
- Vitest works with both Vite frontend and Node backend
- Tailwind CSS v4 integrates with Vite natively

**Pattern Consistency:** No contradictions found.

- Naming: snake_case (DB) → camelCase (API/code) mapping is explicit and in one place (repository layer)
- Structure: 3-layer backend matches both naming and enforcement rules
- Tests: co-location rule applies uniformly to both client and server

**Structure Alignment:** Project tree fully supports all decisions.

- Every architectural layer has a directory
- Every component from UX spec has a file
- Every E2E test maps to a user journey

### Requirements Coverage

**Functional Requirements — 12/12 covered:**

| FR | Covered By | Status |
|----|-----------|--------|
| FR-1 (Create) | `TodoInput.tsx` → `POST /api/todos` → `todo-repository.ts` | ✅ |
| FR-2 (Data model) | `init.sql` schema, `todo.ts` types | ✅ |
| FR-3 (View list) | `TodoList.tsx` → `GET /api/todos` | ✅ |
| FR-4 (Complete) | `TodoItem.tsx` → `PATCH /api/todos/:id` | ✅ |
| FR-5 (Delete) | `TodoItem.tsx` → `DELETE /api/todos/:id` | ✅ |
| FR-6 (REST API) | `todo-routes.ts` with 5 endpoints | ✅ |
| FR-7 (Persistence) | PostgreSQL + `todo-repository.ts` | ✅ |
| FR-8 (Error format) | Fastify error handler → `{ error, statusCode }` | ✅ |
| FR-9 (Loading state) | `useTodos.ts` loading state | ✅ |
| FR-10 (Empty state) | `EmptyState.tsx` | ✅ |
| FR-11 (Error state) | `ErrorBanner.tsx` | ✅ |
| FR-12 (Health) | `health-routes.ts` + Docker HEALTHCHECK | ✅ |

**Non-Functional Requirements — 17/17 covered:**

| NFR | Architectural Support | Status |
|-----|----------------------|--------|
| NFR-1 (200ms UI) | Optimistic updates in `useTodos.ts` | ✅ |
| NFR-2 (500ms API p95) | Simple queries, connection pooling | ✅ |
| NFR-3 (2s page load) | Vite build optimization, no heavy deps | ✅ |
| NFR-4 (320–1920px) | Tailwind responsive, max-w-[640px] | ✅ |
| NFR-5 (Maintainability) | Clear 3-layer structure, co-located tests | ✅ |
| NFR-6 (Independent deploy) | Separate Dockerfiles, separate packages | ✅ |
| NFR-7 (Client errors) | `ErrorBanner.tsx`, no stack traces | ✅ |
| NFR-8 (Server errors) | Fastify error handler, JSON format | ✅ |
| NFR-9 (Layered design) | routes → services → repositories | ✅ |
| NFR-10 (Browser support) | Vite targets Baseline Widely Available | ✅ |
| NFR-11 (WCAG AA) | UX spec: ARIA, focus, keyboard, contrast | ✅ |
| NFR-12 (Docker Compose) | `docker-compose.yml` | ✅ |
| NFR-13 (Multi-stage) | Multi-stage Dockerfiles, non-root, health | ✅ |
| NFR-14 (Dev/test profiles) | `docker-compose.dev.yml`, `.test.yml` | ✅ |
| NFR-15 (70% coverage) | Vitest + co-located tests | ✅ |
| NFR-16 (5 E2E tests) | 5 Playwright spec files | ✅ |
| NFR-17 (XSS/injection) | Parameterized SQL, React escaping, CSP | ✅ |

### Implementation Readiness

| Check | Status |
|-------|--------|
| All tech versions specified | ✅ |
| API contract defined (methods, paths, bodies, statuses) | ✅ |
| Database schema defined | ✅ |
| Project tree with every file listed | ✅ |
| Naming conventions for DB, API, code | ✅ |
| Layer boundaries documented with enforcement rules | ✅ |
| Error handling pattern per layer | ✅ |
| Anti-patterns listed | ✅ |
| Dev/test/prod workflow documented | ✅ |

### Gap Analysis

**Critical gaps:** None.

**Minor observations (non-blocking):**

- Environment variable names (DATABASE_URL, PORT, etc.) will be defined in `.env.example` during implementation
- UX spec intentionally omits loading spinner — list appears once data arrives

### Architecture Completeness Checklist

- [x] Project context analyzed (12 FRs, 17 NFRs)
- [x] Scale assessed (low complexity, single entity)
- [x] Tech stack selected with versions (TS, React 19, Fastify 5, PostgreSQL 16)
- [x] Starter approach chosen (Vite scaffold + manual Fastify)
- [x] Data architecture decided (UUID, raw SQL, pg.Pool)
- [x] API contract defined (5 endpoints, JSON Schema validation)
- [x] Security addressed (parameterized queries, CSP, CORS, no auth)
- [x] Frontend architecture decided (useState, fetch, Tailwind, no router)
- [x] Infrastructure defined (Docker Compose, Nginx, 3 containers)
- [x] Naming conventions established (DB, API, code)
- [x] Structure patterns defined (co-located tests, 3-layer backend)
- [x] Process patterns defined (error handling, optimistic updates, validation)
- [x] Complete project tree with FR mapping
- [x] Architectural boundaries documented
- [x] All 12 FRs verified covered
- [x] All 17 NFRs verified covered

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — every requirement has a concrete file/component mapping.

**First Implementation Priority:** Project initialization — scaffold client with `npm create vite@latest`, set up server manually, create `docker-compose.yml` and `init.sql`.
