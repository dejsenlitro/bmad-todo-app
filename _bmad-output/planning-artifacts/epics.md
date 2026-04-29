---
stepsCompleted: [1, 2, 3, 4]
status: "complete"
completedAt: "2026-04-29"
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# todo-app - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for todo-app, decomposing the requirements from the PRD, UX Design Specification, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-1: Users can create a todo by providing a short text description (1–300 characters).
FR-2: Each todo stores: text description, completion status (boolean), and creation timestamp.
FR-3: Users can view all todos in a single list upon opening the application.
FR-4: Users can mark a todo as complete; completed todos are visually distinguishable from active todos.
FR-5: Users can delete a todo, permanently removing it from the list and backend storage.
FR-6: Backend exposes a RESTful API supporting CRUD operations for todo items.
FR-7: API ensures data consistency and durability — todos persist across user sessions.
FR-8: API returns JSON error responses with HTTP 400 for validation errors, 404 for missing resources, and 500 for server errors.
FR-9: Application displays a loading state while fetching todos.
FR-10: Application displays an empty state when no todos exist.
FR-11: Application displays an error state when API requests fail, without disrupting the user's ability to retry.
FR-12: Backend exposes a `GET /health` endpoint returning JSON `{"status": "ok"}` with HTTP 200 when the service and its database connection are healthy.

### NonFunctional Requirements

NFR-1: UI interactions (add, complete, delete) reflect visually within 200ms under normal network conditions, as measured by browser Performance API timestamps.
NFR-2: API responses return within 500ms for 95th percentile under normal load, as measured by server-side request logging.
NFR-3: Initial page load (including todo list fetch) completes within 2 seconds on a standard broadband connection.
NFR-4: UI renders correctly and is fully usable on viewports from 320px (mobile) to 1920px (desktop).
NFR-5: Codebase is structured for readability — a new developer can understand the project structure within 30 minutes.
NFR-6: Frontend and backend are independently deployable and testable.
NFR-7: Client-side errors display a human-readable message without exposing stack traces or internals.
NFR-8: Server-side errors return JSON responses with an error message and the correct HTTP status code (400, 404, or 500).
NFR-9: Architecture uses a layered design (separate API routes, business logic, and data access) enabling addition of authentication and multi-user features without restructuring.
NFR-10: Application functions correctly in the latest two major versions of Chrome, Firefox, Safari, and Edge.
NFR-11: Application meets WCAG 2.1 Level AA for all core interactions (create, complete, delete), including keyboard navigation and screen reader compatibility.
NFR-12: Application runs via `docker-compose up` with no manual setup steps beyond cloning the repository and running the command.
NFR-13: Dockerfiles use multi-stage builds, run as non-root users, and include health checks.
NFR-14: Docker Compose supports dev and test environment profiles via environment variables.
NFR-15: Test coverage meets a minimum of 70% meaningful code coverage.
NFR-16: Minimum 5 passing Playwright E2E tests covering all core user journeys (create, complete, delete, empty state, error handling).
NFR-17: Application is free of common vulnerabilities (XSS, injection) as verified by code review and automated scanning.

### Additional Requirements

- **Starter template:** Vite `react-ts` scaffold for frontend + manual Fastify setup for backend (Architecture Step 2)
- TypeScript 5.x across both packages with ESM modules (`"type": "module"`)
- Node.js 22 LTS runtime for backend
- React 19.x with Vite 8.x (frontend framework)
- Fastify 5.x with built-in JSON Schema validation (backend framework)
- PostgreSQL 16 with UUID v4 primary keys (`gen_random_uuid()`), single `todos` table, `init.sql` for schema creation
- `pg` (node-postgres) with parameterized queries only, `pg.Pool` for connection pooling
- `@fastify/cors` for cross-origin frontend requests (origin whitelist)
- Tailwind CSS v4 (added post-scaffold)
- Vitest for unit + integration tests (both client and server)
- Playwright for E2E tests with 5 spec files mapped to user journeys
- c8/istanbul for coverage reporting
- Docker Compose with 3 containers: client (Nginx), server (Node), db (PostgreSQL)
- Multi-stage Dockerfiles with non-root users and `HEALTHCHECK` directives
- Nginx reverse proxy: serve static files + proxy `/api` to server container
- Vite dev server with HMR and `/api` proxy for development
- `tsx --watch` for backend hot-reload in development
- Pino structured JSON logging via Fastify built-in
- 3-layer backend architecture: routes → services → repositories (NFR-9)
- Repository layer handles `snake_case` (DB) → `camelCase` (API) field mapping
- Co-located test files (`.test.ts` next to source)
- Fastify app factory pattern (`app.ts`) for testable server instantiation
- Environment configuration via `.env` files and Docker Compose env
- Dev/test/prod workflows via `docker-compose.dev.yml` and `docker-compose.test.yml` override files
- `.env.example` template for environment variable documentation
- CSP headers for defense-in-depth XSS prevention

### UX Design Requirements

UX-DR1: Implement Tailwind CSS design token system — color palette with 10 semantic tokens (bg-primary #FFFFFF, bg-surface #F9FAFB, text-primary #111827, text-secondary #6B7280, text-placeholder #9CA3AF, accent #2563EB, accent-hover #1D4ED8, border #E5E7EB, error #DC2626, error-bg #FEF2F2), system font stack (ui-sans-serif, system-ui, -apple-system, sans-serif), 4px base spacing scale.

UX-DR2: Build TodoInput component — text input (border-2, rounded-lg, px-4 py-3) + visible Add button (bg-blue-600, rounded-lg, px-5 py-3, font-semibold), side-by-side in flex row. Auto-focus on page load and after successful add. Enter-to-submit and button-to-submit parity via `<form>` wrapper. Shake animation (300ms CSS) on empty/whitespace submit. Placeholder "Add a new todo..." in gray-400. `aria-label="Add a new todo"` on input. `autocomplete="off"`, `spellcheck="true"`.

UX-DR3: Build TodoItem component — bordered card (border-gray-200, rounded-lg, px-4 py-3, gap-3) with square checkbox (22×22px, border-2, rounded, fills blue-600 when checked), todo text (text-base, text-gray-900), and delete button (text-gray-300, hover:text-red-600, hover:bg-red-50). Completed state: strikethrough + text-gray-400 + opacity-70. Card hover: border-gray-300 + shadow-sm. `aria-label="Mark [task] as complete"` on checkbox, `aria-label="Delete [task]"` on delete. Focus-visible ring on all interactive elements.

UX-DR4: Build TodoList component — `<ul role="list" aria-label="Todo list" aria-live="polite">` container with `flex flex-col gap-2`. Renders TodoItem `<li>` elements when populated, EmptyState when empty. Items displayed in creation order.

UX-DR5: Build EmptyState component — centered message "Your todo list is empty. Start by adding a task!" styled with `text-center py-10 text-gray-400 text-sm`. Displayed when todo count is zero.

UX-DR6: Build ErrorBanner component — inline banner below input with `role="alert"`, styled `bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3` with ⚠ icon. Auto-dismisses after 5 seconds or on next successful action. Not rendered in DOM when hidden.

UX-DR7: Implement optimistic update pattern in `useTodos` hook — update local state immediately on add/complete/delete, fire API call, reconcile on success (replace temp ID), revert state + show error banner on failure.

UX-DR8: Implement responsive layout — mobile-first single-column design, max-width 640px centered. Single breakpoint at `sm` (640px): below = full-width 16px padding, above = centered with 24px padding. Input row stacks vertically (`flex-col`) below 640px, side-by-side (`sm:flex-row`) at 640px+. All touch targets minimum 44×44px.

UX-DR9: Implement keyboard accessibility — Tab order: input → Add → checkbox₁ → delete₁ → checkbox₂ → delete₂ → ..., focus-visible rings (`focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2`), skip link to input, focus management after add (refocus input) and delete (next item or input if empty). Screen reader support via `aria-label`, `aria-live`, `role="alert"`.

UX-DR10: Implement state transition animations — checkbox fill 200ms ease-in-out, text strikethrough 200ms ease-in-out, item delete fade 150ms ease-out, card hover shadow 150ms ease-in-out, button hover color 150ms ease-in-out, error banner appear 200ms ease-out / dismiss 300ms ease-in, input shake 300ms ease-in-out. All wrapped in `motion-safe:` Tailwind variant. Reduced to 0ms for `prefers-reduced-motion: reduce`.

UX-DR11: Implement Direction B (Bordered Cards) visual design — individual bordered cards per todo with rounded corners (8px), 8px gap between cards, square checkboxes (border-radius 4px), always-visible delete button in subdued gray (no hover-dependency), subtle elevation on hover (box-shadow), blue accent (#2563EB) for active checkbox fill and focus rings.

### FR Coverage Map

| FR    | Epic   | Description                                   |
| ----- | ------ | --------------------------------------------- |
| FR-1  | Epic 2 | Create todo (1–300 chars)                     |
| FR-2  | Epic 2 | Todo data model (text, completed, created_at) |
| FR-3  | Epic 2 | View all todos on load                        |
| FR-4  | Epic 2 | Mark todo complete (visual distinction)       |
| FR-5  | Epic 2 | Delete todo (permanent removal)               |
| FR-6  | Epic 2 | RESTful CRUD API                              |
| FR-7  | Epic 2 | Data persistence across sessions              |
| FR-8  | Epic 2 | JSON error responses (400/404/500)            |
| FR-9  | Epic 2 | Loading state UI                              |
| FR-10 | Epic 2 | Empty state UI                                |
| FR-11 | Epic 2 | Error state UI with retry                     |
| FR-12 | Epic 1 | Health endpoint                               |

## Epic List

### Epic 1: Project Foundation & Infrastructure

Users (developers) can clone the repo, run `docker-compose up`, and have a running application with an empty, healthy system. This is the "zero to running" epic — it delivers the starter scaffolds, Docker containers, database schema, health endpoint, and dev workflow.
**FRs covered:** FR-12
**NFRs addressed:** NFR-5, NFR-6, NFR-9, NFR-12, NFR-13, NFR-14, NFR-17

### Epic 2: Core Todo Management

Users can create, view, complete, and delete todos with full backend persistence and a polished, accessible UI. This is the complete product experience — API endpoints, data layer, all 5 frontend components, optimistic updates, loading/empty/error states, responsive layout, and keyboard/screen reader accessibility.
**FRs covered:** FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-8, FR-9, FR-10, FR-11
**NFRs addressed:** NFR-1, NFR-2, NFR-3, NFR-4, NFR-7, NFR-8, NFR-10, NFR-11
**UX-DRs addressed:** UX-DR1 through UX-DR11

### Epic 3: Quality Assurance & E2E Testing

The application has verified quality — 70%+ code coverage via Vitest unit/integration tests and 5 passing Playwright E2E tests covering all core user journeys (create, complete, delete, empty state, error handling).
**FRs covered:** (verification of FR-1 through FR-11)
**NFRs addressed:** NFR-15, NFR-16

## Epic 1: Project Foundation & Infrastructure

Users (developers) can clone the repo, run `docker-compose up`, and have a running application with an empty, healthy system.

### Story 1.1: Project Scaffold & Dev Environment

As a developer,
I want to scaffold the frontend and backend projects with TypeScript, dev tooling, and local dev scripts,
So that I have a working development environment to build features in.

**Acceptance Criteria:**

**Given** the repository is freshly cloned
**When** the frontend is scaffolded with `npm create vite@latest client -- --template react-ts`
**Then** `client/` contains a working Vite + React + TypeScript project with `package.json`, `tsconfig.json`, and `vite.config.ts`

**Given** the backend directory is created
**When** `server/` is initialized with Fastify, TypeScript, and the 3-layer folder structure (`routes/`, `services/`, `repositories/`)
**Then** `server/src/index.ts` starts a Fastify server, `server/src/app.ts` exports an app factory, and all dependencies (`fastify`, `@fastify/cors`, `@fastify/sensible`, `pg`, `typescript`, `tsx`, `vitest`) are installed

**Given** the backend is running
**When** a GET request is made to `/api/health`
**Then** the response is `{"status":"ok"}` with HTTP 200 (FR-12)

**Given** the project root exists
**When** the developer inspects the structure
**Then** `package.json` (root), `.gitignore`, `.env.example`, and `README.md` are present, and the root `package.json` contains workspace scripts only

**Given** Tailwind CSS v4 needs to be added to the frontend
**When** the developer inspects `client/`
**Then** Tailwind CSS v4 is installed and configured, `client/src/index.css` contains Tailwind directives

### Story 1.2: Database & Docker Compose

As a developer,
I want a Dockerized PostgreSQL database and Docker Compose configuration for all services,
So that the entire application runs with a single `docker-compose up` command.

**Acceptance Criteria:**

**Given** the `db/` directory exists
**When** the developer inspects `db/init.sql`
**Then** it contains the `CREATE TABLE IF NOT EXISTS todos` statement with columns `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `text VARCHAR(255) NOT NULL`, `completed BOOLEAN NOT NULL DEFAULT false`, `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

**Given** the server needs database connectivity
**When** `server/src/config/database.ts` is inspected
**Then** it exports a `pg.Pool` instance configured via `DATABASE_URL` environment variable

**Given** Dockerfiles exist for client and server
**When** inspected
**Then** both use multi-stage builds, run as non-root users, and include `HEALTHCHECK` directives (NFR-13)

**Given** `client/Dockerfile` is built
**When** the production image runs
**Then** Nginx serves static files and proxies `/api` requests to the server container via `client/nginx.conf`

**Given** `docker-compose.yml` exists
**When** `docker-compose up` is run on a freshly cloned repo
**Then** three containers start (client on port 80, server on port 3001, db on port 5432), the database initializes with `init.sql`, and `GET /api/health` returns 200 (NFR-12)

**Given** dev and test overrides exist
**When** `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up` is run
**Then** source volumes are mounted, Vite dev server runs with HMR, backend uses `tsx --watch`, and the `/api` proxy works (NFR-14)

**Given** `docker-compose.test.yml` exists
**When** inspected
**Then** it configures a separate test database and Playwright test execution environment (NFR-14)

**Given** the server and database containers are running
**When** the health check endpoint is called
**Then** it verifies database connectivity as part of its health response

**Given** security requirements exist
**When** the server configuration is inspected
**Then** CSP headers are configured, CORS is restricted to the frontend origin, and all SQL uses parameterized queries only (NFR-17)

## Epic 2: Core Todo Management

Users can create, view, complete, and delete todos with full backend persistence and a polished, accessible UI.

### Story 2.1: Todo API — CRUD Endpoints

As a user,
I want a backend API that can create, list, update, and delete todos,
So that my task data is reliably stored and available across sessions.

**Acceptance Criteria:**

**Given** the server is running with a connected database
**When** `POST /api/todos` is called with `{ "text": "Buy milk" }`
**Then** a new todo is created and returned as `{ id, text, completed: false, createdAt }` with HTTP 201 (FR-1, FR-2, FR-6)

**Given** a todo with text shorter than 1 char or longer than 255 chars is submitted
**When** `POST /api/todos` is called
**Then** the response is `{ "error": "...", "statusCode": 400 }` with HTTP 400 (FR-8)

**Given** todos exist in the database
**When** `GET /api/todos` is called
**Then** all todos are returned as a JSON array with camelCase fields (`createdAt`, not `created_at`) with HTTP 200 (FR-3, FR-6, FR-7)

**Given** a todo exists
**When** `PATCH /api/todos/:id` is called with `{ "completed": true }`
**Then** the todo is updated and returned with `completed: true` and HTTP 200 (FR-4, FR-6)

**Given** a todo exists
**When** `DELETE /api/todos/:id` is called
**Then** the todo is permanently removed and HTTP 204 is returned (FR-5, FR-6)

**Given** a non-existent UUID is used
**When** `PATCH` or `DELETE` is called with that ID
**Then** the response is `{ "error": "...", "statusCode": 404 }` with HTTP 404 (FR-8)

**Given** an unexpected server error occurs
**When** any API call fails internally
**Then** the response is `{ "error": "...", "statusCode": 500 }` with no stack traces (FR-8, NFR-8)

**Given** the 3-layer architecture is required
**When** the code is inspected
**Then** `todo-routes.ts` calls `todo-service.ts` which calls `todo-repository.ts`, with JSON Schema validation in routes and snake→camel mapping in the repository (NFR-9)

### Story 2.2: Todo UI — List, Create, & Design System

As a user,
I want to see my todos and add new ones through a clean, responsive interface,
So that I can start managing tasks immediately.

**Acceptance Criteria:**

**Given** the Tailwind design system is implemented
**When** the app is inspected
**Then** the 10 semantic color tokens, system font stack, and 4px spacing scale from UX-DR1 are applied (UX-DR1)

**Given** the app loads in a browser
**When** the page renders
**Then** TodoInput is displayed with auto-focused text input and visible "Add" button, placeholder "Add a new todo...", `aria-label="Add a new todo"`, `autocomplete="off"` (UX-DR2, FR-9)

**Given** the input is focused and the user types a task and presses Enter (or clicks Add)
**When** the form submits
**Then** the todo appears in the list instantly via optimistic update, input clears and refocuses (FR-1, UX-DR2, UX-DR7)

**Given** the user submits empty or whitespace-only text
**When** the form validates
**Then** the input shakes briefly (300ms), text is preserved, focus remains — no API call is made (UX-DR2)

**Given** todos exist
**When** the page renders
**Then** TodoList displays all items in creation order using bordered cards (Direction B), with 8px gap between cards, inside a `<ul>` with `aria-live="polite"` (FR-3, UX-DR4, UX-DR11)

**Given** no todos exist
**When** the list is empty
**Then** EmptyState component shows "Your todo list is empty. Start by adding a task!" centered in gray-400 (FR-10, UX-DR5)

**Given** the page is loading
**When** the API call is in flight
**Then** a loading state is shown (FR-9)

**Given** the layout is responsive
**When** viewed at 320px–639px
**Then** input and button stack vertically, full-width with 16px padding (UX-DR8)

**Given** the viewport is 640px+
**When** the layout renders
**Then** content is centered with max-width 640px, input and button side-by-side, 24px padding (UX-DR8)

### Story 2.3: Todo UI — Complete, Delete, & Error Handling

As a user,
I want to mark todos as complete and delete them, with clear error feedback when something goes wrong,
So that I can manage my task list confidently.

**Acceptance Criteria:**

**Given** an active todo is displayed
**When** the user clicks the checkbox
**Then** the checkbox fills blue-600, text gets strikethrough + text-gray-400 + opacity-70 via optimistic update (200ms transition), and `PATCH` is sent to the API (FR-4, UX-DR3, UX-DR7, UX-DR10)

**Given** a completed todo is displayed
**When** the user clicks the checkbox again
**Then** it toggles back to active state via optimistic update (FR-4, UX-DR7)

**Given** a todo is displayed
**When** the user clicks the delete (×) button
**Then** the item fades out (150ms), `DELETE` is sent to the API, and the item is removed from the list (FR-5, UX-DR3, UX-DR10)

**Given** an API call fails (add, complete, or delete)
**When** the server returns an error
**Then** the optimistic update reverts, and ErrorBanner appears below the input with `role="alert"`, styled red-50/red-200/red-600 with ⚠ icon (FR-11, UX-DR6, UX-DR7)

**Given** an error banner is visible
**When** 5 seconds pass or the next action succeeds
**Then** the error banner auto-dismisses (UX-DR6)

**Given** an error is displayed
**When** the user inspects the message
**Then** it is human-readable (e.g., "Failed to save todo. Please try again.") with no stack traces (NFR-7)

**Given** the delete button is in its default state
**When** the user hovers over it
**Then** it changes from gray-300 to red-600 with red-50 background (UX-DR3)

**Given** the todo card is in its default state
**When** the user hovers
**Then** border changes to gray-300 with subtle shadow-sm (UX-DR11)

### Story 2.4: Accessibility & Motion

As a user with accessibility needs,
I want full keyboard navigation, screen reader support, and motion-safe animations,
So that I can use the app regardless of input method or ability.

**Acceptance Criteria:**

**Given** the page loads
**When** the user navigates via keyboard
**Then** Tab order follows: input → Add → checkbox₁ → delete₁ → checkbox₂ → delete₂ → ... with visible focus rings (`focus-visible:outline-2 outline-blue-600 outline-offset-2`) (UX-DR9, NFR-11)

**Given** a skip link exists
**When** the user presses Tab on first focus
**Then** a "Skip to add todo" link appears, and activating it focuses the input (UX-DR9)

**Given** a todo is added
**When** the add succeeds
**Then** focus returns to the input field (UX-DR9)

**Given** a todo is deleted
**When** the deletion completes
**Then** focus moves to the next item's checkbox, or to the input if the list is now empty (UX-DR9)

**Given** a screen reader is active
**When** the user interacts with components
**Then** checkbox announces "Mark [task] as complete, checkbox, not checked", delete announces "Delete [task], button", todo list uses `aria-live="polite"` for add/remove, error banner uses `role="alert"` (UX-DR9, NFR-11)

**Given** the user has `prefers-reduced-motion: reduce` set
**When** any transition fires
**Then** all animation durations are 0ms — functionality unchanged (UX-DR10)

**Given** the user has no motion preference
**When** transitions fire
**Then** all animations use `motion-safe:` Tailwind variant with specified durations (checkbox 200ms, delete 150ms, hover 150ms, error 200ms/300ms, shake 300ms) (UX-DR10)

**Given** all interactive elements exist
**When** inspected for touch targets
**Then** checkbox and delete button containers meet the minimum 44×44px touch target (UX-DR8, NFR-11)

## Epic 3: Quality Assurance & E2E Testing

The application has verified quality — 70%+ code coverage via Vitest unit/integration tests and 5 passing Playwright E2E tests covering all core user journeys.

### Story 3.1: Unit & Integration Test Coverage

As a developer,
I want comprehensive unit and integration tests across client and server,
So that the codebase has verified quality with 70%+ meaningful coverage.

**Acceptance Criteria:**

**Given** the server codebase exists
**When** Vitest runs on the server
**Then** `todo-routes.test.ts` tests all 5 endpoints (GET list, POST, PATCH, DELETE, GET health) including validation errors (400), not-found (404), and server errors (500)

**Given** the server codebase exists
**When** Vitest runs on the server
**Then** `todo-service.test.ts` tests business logic (text trimming, validation, error wrapping) and `todo-repository.test.ts` tests database queries with a test database or mocked `pg.Pool`

**Given** the client codebase exists
**When** Vitest runs on the client
**Then** `TodoInput.test.tsx` tests form submission, empty validation, and auto-focus; `TodoItem.test.tsx` tests checkbox toggle and delete click; `TodoList.test.tsx` tests list rendering and empty state; `EmptyState.test.tsx` tests message display; `ErrorBanner.test.tsx` tests render/dismiss behavior

**Given** the client hook exists
**When** Vitest runs on the client
**Then** `useTodos.test.ts` tests optimistic update, revert-on-error, and API integration; `todo-api.test.ts` tests fetch wrappers with mocked responses

**Given** all tests pass
**When** coverage is measured with c8/istanbul
**Then** both client and server meet or exceed 70% meaningful code coverage (NFR-15)

**Given** tests are co-located
**When** the project structure is inspected
**Then** every `.test.ts` / `.test.tsx` file is adjacent to its source file

### Story 3.2: Playwright E2E Tests

As a developer,
I want end-to-end tests that validate all core user journeys against the full running stack,
So that I can verify the application works correctly from the user's perspective.

**Acceptance Criteria:**

**Given** the full stack is running via Docker Compose (test profile)
**When** Playwright executes `e2e/tests/todo-create.spec.ts`
**Then** it verifies: user types a task, presses Enter, todo appears in list, persists after page refresh (UJ-2)

**Given** the full stack is running
**When** Playwright executes `e2e/tests/todo-complete.spec.ts`
**Then** it verifies: user clicks checkbox, todo shows strikethrough/dimmed styling, toggles back on second click, state persists after refresh (UJ-3)

**Given** the full stack is running
**When** Playwright executes `e2e/tests/todo-delete.spec.ts`
**Then** it verifies: user clicks delete, todo is removed from list, does not reappear after refresh (UJ-4)

**Given** the full stack is running
**When** Playwright executes `e2e/tests/todo-empty.spec.ts`
**Then** it verifies: on first load with no todos, empty state message is displayed, input is auto-focused (UJ-1 empty state)

**Given** the full stack is running
**When** Playwright executes `e2e/tests/todo-error.spec.ts`
**Then** it verifies: when the API is unreachable or returns an error, an error banner appears with a human-readable message and auto-dismisses (FR-11)

**Given** all 5 spec files pass
**When** the test suite completes
**Then** minimum 5 passing E2E tests are confirmed (NFR-16)

**Given** `e2e/` is set up
**When** inspected
**Then** `playwright.config.ts` is configured to run against the Dockerized app, with proper base URL and test timeouts
