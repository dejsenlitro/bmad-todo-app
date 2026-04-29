# Story 2.1: Todo API — CRUD Endpoints

## Status: review

## Story

As a user,
I want a backend API that can create, list, update, and delete todos,
So that my task data is reliably stored and available across sessions.

## Acceptance Criteria

1. **Given** the server is running with a connected database, **When** `POST /api/todos` is called with `{ "text": "Buy milk" }`, **Then** a new todo is created and returned as `{ id, text, completed: false, createdAt }` with HTTP 201 (FR-1, FR-2, FR-6)

2. **Given** a todo with text shorter than 1 char or longer than 255 chars is submitted, **When** `POST /api/todos` is called, **Then** the response is `{ "error": "...", "statusCode": 400 }` with HTTP 400 (FR-8)

3. **Given** todos exist in the database, **When** `GET /api/todos` is called, **Then** all todos are returned as a JSON array with camelCase fields (`createdAt`, not `created_at`) with HTTP 200 (FR-3, FR-6, FR-7)

4. **Given** a todo exists, **When** `PATCH /api/todos/:id` is called with `{ "completed": true }`, **Then** the todo is updated and returned with `completed: true` and HTTP 200 (FR-4, FR-6)

5. **Given** a todo exists, **When** `DELETE /api/todos/:id` is called, **Then** the todo is permanently removed and HTTP 204 is returned (FR-5, FR-6)

6. **Given** a non-existent UUID is used, **When** `PATCH` or `DELETE` is called with that ID, **Then** the response is `{ "error": "...", "statusCode": 404 }` with HTTP 404 (FR-8)

7. **Given** an unexpected server error occurs, **When** any API call fails internally, **Then** the response is `{ "error": "...", "statusCode": 500 }` with no stack traces (FR-8, NFR-8)

8. **Given** the 3-layer architecture is required, **When** the code is inspected, **Then** `todo-routes.ts` calls `todo-service.ts` which calls `todo-repository.ts`, with JSON Schema validation in routes and snake→camel mapping in the repository (NFR-9)

## Tasks/Subtasks

- [x] Task 1: Create `server/src/repositories/todo-repository.ts`
  - [x] Implement `findAll()` — SELECT all todos, return camelCase
  - [x] Implement `findById(id)` — SELECT by UUID, return camelCase or null
  - [x] Implement `create(text)` — INSERT with text, return created todo
  - [x] Implement `update(id, fields)` — UPDATE completed, return updated todo or null
  - [x] Implement `remove(id)` — DELETE by id, return boolean (found or not)
  - [x] Snake→camel field mapping helper (created_at → createdAt)
- [x] Task 2: Create `server/src/services/todo-service.ts`
  - [x] `listTodos()` — calls repository.findAll()
  - [x] `createTodo(text)` — trims text, validates length 1-255, calls repository.create()
  - [x] `updateTodo(id, completed)` — calls repository.update(), throws 404 if not found
  - [x] `deleteTodo(id)` — calls repository.remove(), throws 404 if not found
- [x] Task 3: Create `server/src/routes/todo-routes.ts`
  - [x] JSON Schema definitions for request/response validation
  - [x] `GET /api/todos` — calls service.listTodos()
  - [x] `POST /api/todos` — validates body, calls service.createTodo(), returns 201
  - [x] `PATCH /api/todos/:id` — validates body+params, calls service.updateTodo()
  - [x] `DELETE /api/todos/:id` — validates params, calls service.deleteTodo(), returns 204
  - [x] Error handling: 400 validation, 404 not found, 500 internal
- [x] Task 4: Register todo routes in `server/src/app.ts`
- [x] Task 5: Verify build, test all endpoints via curl/docker

## Dev Notes

### Architecture

- 3-layer: routes → services → repositories (NFR-9)
- Repository handles snake_case (DB) → camelCase (API) mapping
- Routes use Fastify JSON Schema validation for request bodies and params
- Use `@fastify/sensible` httpErrors for 404 responses
- Parameterized SQL queries only (security)
- UUID params should be validated as UUID format

### Existing Code

- `server/src/config/database.ts` — exports pg.Pool
- `server/src/types/todo.ts` — Todo, CreateTodoRequest, UpdateTodoRequest interfaces
- `server/src/app.ts` — Fastify app factory with CORS, CSP, sensible plugin
- `db/init.sql` — todos table schema (id UUID, text VARCHAR(255), completed BOOLEAN, created_at TIMESTAMPTZ)

### Conventions

- ESM modules with .js extensions in imports
- kebab-case file names
- Co-located test files (\*.test.ts next to source)

## Dev Agent Record

### Implementation Plan

- Create repository layer with parameterized queries and field mapping
- Create service layer with validation and error handling
- Create routes layer with JSON Schema and HTTP status codes
- Register in app.ts
- Test via docker compose

### Debug Log

(none)

### Completion Notes

- 3-layer architecture implemented: routes → services → repositories
- All 5 CRUD endpoints verified via Docker: GET list, POST create (201), PATCH update (200), DELETE (204)
- Error handling verified: 400 validation (empty text), 404 not found, 500 internal (no stack traces)
- Snake→camel field mapping in repository layer
- JSON Schema validation on all request bodies and UUID params
- Parameterized SQL queries throughout (security)

## File List

- server/src/repositories/todo-repository.ts (new)
- server/src/services/todo-service.ts (new)
- server/src/routes/todo-routes.ts (new)
- server/src/app.ts (modified — registered todoRoutes)
- \_bmad-output/implementation-artifacts/spec-2-1-todo-api-crud-endpoints.md (new)
- \_bmad-output/implementation-artifacts/sprint-status.yaml (modified)

## Change Log

- 2026-04-29: Story 2.1 implemented — CRUD API endpoints with 3-layer architecture
