---
title: 'Story 1.1: Project Scaffold & Dev Environment'
type: 'feature'
created: '2026-04-29'
status: 'in-progress'
baseline_commit: 'NO_VCS'
context:
  - '_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** No application code exists yet. The repository contains only BMAD framework files and docs. A working dev environment with frontend scaffold, backend scaffold, health endpoint, and Tailwind CSS is needed before any feature work can begin.

**Approach:** Scaffold the frontend with Vite react-ts template, manually set up the Fastify backend with 3-layer structure, create root workspace files (.gitignore, .env.example, README.md, root package.json), add Tailwind CSS v4 to the client, implement the health endpoint, and initialize git.

## Boundaries & Constraints

**Always:**
- TypeScript 5.x with ESM (`"type": "module"`) in both packages
- Fastify 5.x for backend, React 19.x + Vite 8.x for frontend
- Node.js 22 LTS as target runtime
- 3-layer backend: `routes/` → `services/` → `repositories/`
- App factory pattern: `server/src/app.ts` exports buildApp(), `server/src/index.ts` calls it
- Tailwind CSS v4 (not v3)
- kebab-case files, PascalCase components, camelCase functions
- Co-located test structure (even though no tests written yet in this story)

**Ask First:**
- Adding any dependency not listed in architecture doc
- Changing the project directory structure from architecture spec

**Never:**
- No ORM — raw SQL with pg only (added in Story 1.2)
- No database connectivity in this story — health endpoint returns static response
- No Docker — that's Story 1.2
- No application features — no todo CRUD

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Health check | `GET /api/health` | `{"status":"ok"}` with HTTP 200 | N/A |
| Unknown route | `GET /api/unknown` | Fastify default 404 JSON response | N/A |
| Vite dev server | `npm run dev` in client/ | Serves React app on port 5173 | N/A |
| Backend dev server | `npx tsx src/index.ts` in server/ | Fastify listens on port 3001 | N/A |

</frozen-after-approval>

## Code Map

- `package.json` -- root workspace scripts only (no deps)
- `.gitignore` -- Node/IDE/env ignores
- `.env.example` -- template for env vars (PORT, DATABASE_URL placeholders)
- `README.md` -- project overview and setup instructions
- `client/package.json` -- Vite + React + TypeScript + Tailwind deps
- `client/tsconfig.json` -- TS config for React
- `client/vite.config.ts` -- Vite config with /api proxy to localhost:3001
- `client/index.html` -- Vite entry point
- `client/src/main.tsx` -- React root render
- `client/src/App.tsx` -- Root component (minimal placeholder)
- `client/src/index.css` -- Tailwind CSS directives
- `server/package.json` -- Fastify + TypeScript deps
- `server/tsconfig.json` -- TS config for Node/ESM
- `server/src/index.ts` -- Server entry: imports buildApp, listens on PORT
- `server/src/app.ts` -- App factory: Fastify instance, registers plugins + routes
- `server/src/routes/health-routes.ts` -- GET /api/health handler
- `server/src/types/todo.ts` -- Todo interface (empty placeholder for Story 2.1)

## Tasks & Acceptance

**Execution:**
- [ ] `client/` -- Scaffold with `npm create vite@latest client -- --template react-ts`, install Tailwind CSS v4, configure vite.config.ts with /api proxy, replace default CSS with Tailwind directives in index.css, set up minimal App.tsx
- [ ] `server/package.json` + `server/tsconfig.json` -- Initialize backend package with `npm init -y`, install fastify, @fastify/cors, @fastify/sensible, pg, typescript, @types/node, @types/pg, tsx, vitest as deps/devDeps, configure tsconfig for ESM + NodeNext
- [ ] `server/src/app.ts` + `server/src/index.ts` -- Create app factory exporting buildApp() that registers @fastify/cors and @fastify/sensible, registers health routes. index.ts imports buildApp, starts listening on PORT env var (default 3001)
- [ ] `server/src/routes/health-routes.ts` -- Implement GET /api/health returning `{"status":"ok"}` with 200
- [ ] `server/src/types/todo.ts` -- Create Todo interface placeholder (id, text, completed, createdAt)
- [ ] Root files: `package.json`, `.gitignore`, `.env.example`, `README.md` -- Create root package.json with workspace scripts, comprehensive .gitignore, env template, basic README
- [ ] `git init` + initial commit -- Initialize git repo and make initial commit

**Acceptance Criteria:**
- Given the repo is freshly cloned, when `cd client && npm install && npm run dev` is run, then Vite serves the React app on port 5173
- Given the server deps are installed, when `cd server && npx tsx src/index.ts` is run, then Fastify starts on port 3001 and `GET /api/health` returns `{"status":"ok"}` with HTTP 200
- Given both are running, when the Vite dev server proxies /api, then requests to localhost:5173/api/health reach the backend
- Given the project root is inspected, then .gitignore, .env.example, README.md, and root package.json exist
- Given client/src/index.css is inspected, then it contains Tailwind CSS v4 directives

## Verification

**Commands:**
- `cd client && npm install && npm run build` -- expected: builds without errors
- `cd server && npm install && npx tsc --noEmit` -- expected: no type errors
- `cd server && npx tsx src/index.ts &; sleep 2; curl -s http://localhost:3001/api/health; kill %1` -- expected: `{"status":"ok"}`
