# Story 2.2: Todo UI — List, Create, & Design System

## Status: done

## Story

As a user,
I want to see my todos and add new ones through a clean, responsive interface,
So that I can start managing tasks immediately.

## Acceptance Criteria

1. **Given** the Tailwind design system is implemented, **When** the app is inspected, **Then** the 10 semantic color tokens, system font stack, and 4px spacing scale from UX-DR1 are applied (UX-DR1)

2. **Given** the app loads in a browser, **When** the page renders, **Then** TodoInput is displayed with auto-focused text input and visible "Add" button, placeholder "Add a new todo...", `aria-label="Add a new todo"`, `autocomplete="off"` (UX-DR2, FR-9)

3. **Given** the input is focused and the user types a task and presses Enter (or clicks Add), **When** the form submits, **Then** the todo appears in the list instantly via optimistic update, input clears and refocuses (FR-1, UX-DR2, UX-DR7)

4. **Given** the user submits empty or whitespace-only text, **When** the form validates, **Then** the input shakes briefly (300ms), text is preserved, focus remains — no API call is made (UX-DR2)

5. **Given** todos exist, **When** the page renders, **Then** TodoList displays all items in creation order using bordered cards (Direction B), with 8px gap between cards, inside a `<ul>` with `aria-live="polite"` (FR-3, UX-DR4, UX-DR11)

6. **Given** no todos exist, **When** the list is empty, **Then** EmptyState component shows "Your todo list is empty. Start by adding a task!" centered in gray-400 (FR-10, UX-DR5)

7. **Given** the page is loading, **When** the API call is in flight, **Then** a loading state is shown (FR-9)

8. **Given** the layout is responsive, **When** viewed at 320px–639px, **Then** input and button stack vertically, full-width with 16px padding (UX-DR8)

9. **Given** the viewport is 640px+, **When** the layout renders, **Then** content is centered with max-width 640px, input and button side-by-side, 24px padding (UX-DR8)

## Tasks / Subtasks

- [x] Task 1: Set up Tailwind design tokens and base styles (AC: #1)
  - [x] Add CSS custom properties for 10 semantic color tokens in `client/src/index.css`
  - [x] Configure system font stack
  - [x] Verify 4px spacing scale works with Tailwind v4 defaults

- [x] Task 2: Create Todo type and API client (AC: #3, #7)
  - [x] Create `client/src/types/todo.ts` — Todo interface matching API response
  - [x] Create `client/src/api/todo-api.ts` — fetch wrappers for GET /api/todos, POST /api/todos

- [x] Task 3: Create `useTodos` hook with optimistic updates (AC: #3, #7)
  - [x] `useTodos()` returns `{ todos, isLoading, error, addTodo }`
  - [x] Fetch todos on mount via GET /api/todos
  - [x] `addTodo(text)` — optimistic: add with temp ID, call POST, replace temp ID on success, revert+error on failure
  - [x] Loading state management (isLoading flag)
  - [x] Error state management (error string, clearable)

- [x] Task 4: Create TodoInput component (AC: #2, #3, #4, #8, #9)
  - [x] `<form>` wrapper with `onSubmit` handler
  - [x] Text input: border-2, rounded-lg, px-4 py-3, auto-focus, placeholder "Add a new todo...", aria-label, autocomplete="off", spellcheck="true"
  - [x] Add button: bg-blue-600, text-white, rounded-lg, px-5 py-3, font-semibold, hover:bg-blue-700
  - [x] Shake animation on empty submit (300ms CSS keyframe)
  - [x] Responsive: flex-col below 640px, sm:flex-row at 640px+
  - [x] Clear input and refocus after successful add

- [x] Task 5: Create TodoItem component (AC: #5)
  - [x] Bordered card: border border-gray-200, rounded-lg, px-4 py-3, flex row with gap-3
  - [x] Todo text display (text-base, text-gray-900)
  - [x] Card hover: border-gray-300 + shadow-sm transition
  - [x] Note: checkbox toggle and delete button deferred to Story 2.3

- [x] Task 6: Create TodoList component (AC: #5, #6)
  - [x] `<ul role="list" aria-label="Todo list" aria-live="polite">` container
  - [x] flex flex-col gap-2 layout
  - [x] Map todos to TodoItem `<li>` elements in creation order
  - [x] Render EmptyState when todos array is empty

- [x] Task 7: Create EmptyState component (AC: #6)
  - [x] Centered message: "Your todo list is empty. Start by adding a task!"
  - [x] Styled: text-center py-10 text-gray-400 text-sm

- [x] Task 8: Create loading state (AC: #7)
  - [x] Simple loading indicator while isLoading is true

- [x] Task 9: Integrate in App.tsx (AC: #1, #2, #5, #6, #8, #9)
  - [x] Replace placeholder content with main layout
  - [x] min-h-screen bg-surface, centered max-w-[640px] container
  - [x] Responsive padding: px-4 default, sm:px-6 at 640px+
  - [x] Compose: TodoInput → TodoList (or EmptyState or Loading)

- [x] Task 10: Manual verification
  - [x] Start dev server, verify add todo flow works end-to-end
  - [x] Verify empty state, loading state, responsive layout
  - [x] Verify auto-focus, Enter submit, shake on empty

## Dev Notes

### Architecture

- Frontend follows React 19 + Vite 8 + Tailwind CSS v4 stack
- Component files in `client/src/components/` with kebab-case file names
- Hook files in `client/src/hooks/`
- API client in `client/src/api/`
- Types in `client/src/types/`
- No state management library — React useState/useEffect only (MVP simplicity)
- ESM modules throughout

### Design System (UX-DR1, Direction B)

- **Colors:** bg-primary #FFFFFF, bg-surface #F9FAFB, text-primary #111827, text-secondary #6B7280, text-placeholder #9CA3AF, accent #2563EB, accent-hover #1D4ED8, border #E5E7EB, error #DC2626, error-bg #FEF2F2
- **Typography:** System font stack (ui-sans-serif, system-ui, -apple-system, sans-serif) — Tailwind v4 default
- **Spacing:** 4px base unit — Tailwind v4 default scale
- **Direction B:** Bordered cards with rounded corners (8px), 8px gap between cards

### API Integration

- API base: relative `/api/todos` (Vite proxy handles in dev, Nginx in prod)
- GET /api/todos → `Todo[]` (200)
- POST /api/todos → `{ text: string }` → `Todo` (201)
- Todo shape: `{ id: string, text: string, completed: boolean, createdAt: string }`
- Error shape: `{ error: string, statusCode: number }`

### Optimistic Updates Pattern (UX-DR7)

- Add: generate temp UUID, insert into local state, fire POST, replace temp ID with real ID on success, revert on failure
- Use `crypto.randomUUID()` for temp IDs
- On failure: remove temp item from state, set error message

### Responsive Layout (UX-DR8)

- Mobile-first: full-width, 16px (px-4) horizontal padding
- Single breakpoint sm (640px): centered max-w-[640px], 24px (sm:px-6) padding
- TodoInput: flex-col below 640px, sm:flex-row at 640px+
- Min touch targets: 44×44px for buttons (py-3 + font = ~48px height)

### Existing Code State

- `client/src/App.tsx` — placeholder `<h1>Todo App</h1>` to be replaced
- `client/src/main.tsx` — StrictMode + createRoot, no changes needed

## Completion Notes

### Files Created
- `client/src/types/todo.ts` — Todo interface
- `client/src/api/todo-api.ts` — fetchTodos(), createTodo() API client
- `client/src/hooks/use-todos.ts` — useTodos() hook with optimistic updates
- `client/src/components/todo-input.tsx` — Form with input + Add button
- `client/src/components/todo-item.tsx` — Individual todo card
- `client/src/components/todo-list.tsx` — List container with empty state
- `client/src/components/empty-state.tsx` — Empty state message

### Files Modified
- `client/src/index.css` — Added @theme block with 10 semantic color tokens + shake animation
- `client/src/App.tsx` — Replaced placeholder with full todo UI layout

### Verification
- TypeScript compiles cleanly (`tsc -b --noEmit`)
- Docker stack (client/server/db) starts healthy
- API endpoints respond correctly (GET/POST /api/todos)
- Frontend serves HTTP 200 at root
- 20 server-side tests pass
- `client/src/index.css` — only `@import "tailwindcss"`, will add custom properties
- `client/vite.config.ts` — Vite + React + Tailwind + /api proxy, no changes needed
- Tailwind v4 uses `@import "tailwindcss"` (no directives like @tailwind)

### Story 2.1 Learnings

- 3-layer backend (routes → services → repositories) is complete and tested
- API returns camelCase fields (createdAt not created_at)
- UUID validation is in the API layer — frontend should use UUIDs
- `.js` extension required in ESM imports on server side; client uses bundler resolution (no extensions needed)
- Test DB available on port 5433 via docker-compose.test.yml

### Conventions

- kebab-case file names (e.g., `todo-input.tsx`, `todo-api.ts`)
- PascalCase component names (e.g., `TodoInput`, `TodoList`)
- camelCase for hooks (e.g., `useTodos`)
- Functional components with arrow functions or function declarations
- Export default for components, named exports for hooks/utilities

### What This Story Does NOT Include (Deferred to 2.3 & 2.4)

- Checkbox toggle (complete/uncomplete) — Story 2.3
- Delete button functionality — Story 2.3
- ErrorBanner component — Story 2.3
- Optimistic update for complete/delete — Story 2.3
- Accessibility (keyboard nav, screen reader, focus management) — Story 2.4
- Animations (checkbox fill, delete fade, hover transitions) — Story 2.4
- Skip link — Story 2.4

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component Specifications]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/prd.md#Functional Requirements]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
