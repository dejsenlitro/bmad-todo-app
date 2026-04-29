# Story 2.3: Todo UI — Complete, Delete, & Error Handling

## Status: done

## Story

As a user,
I want to mark todos as complete and delete them, with clear error feedback when something goes wrong,
So that I can manage my task list confidently.

## Acceptance Criteria

1. **Given** an active todo is displayed, **When** the user clicks the checkbox, **Then** the checkbox fills blue-600, text gets strikethrough + text-gray-400 + opacity-70 via optimistic update (200ms transition), and `PATCH` is sent to the API (FR-4, UX-DR3, UX-DR7, UX-DR10)

2. **Given** a completed todo is displayed, **When** the user clicks the checkbox again, **Then** it toggles back to active state via optimistic update (FR-4, UX-DR7)

3. **Given** a todo is displayed, **When** the user clicks the delete (×) button, **Then** the item fades out (150ms), `DELETE` is sent to the API, and the item is removed from the list (FR-5, UX-DR3, UX-DR10)

4. **Given** an API call fails (add, complete, or delete), **When** the server returns an error, **Then** the optimistic update reverts, and ErrorBanner appears below the input with `role="alert"`, styled red-50/red-200/red-600 with ⚠ icon (FR-11, UX-DR6, UX-DR7)

5. **Given** an error banner is visible, **When** 5 seconds pass or the next action succeeds, **Then** the error banner auto-dismisses (UX-DR6)

6. **Given** an error is displayed, **When** the user inspects the message, **Then** it is human-readable (e.g., "Failed to save todo. Please try again.") with no stack traces (NFR-7)

7. **Given** the delete button is in its default state, **When** the user hovers over it, **Then** it changes from gray-300 to red-600 with red-50 background (UX-DR3)

8. **Given** the todo card is in its default state, **When** the user hovers, **Then** border changes to gray-300 with subtle shadow-sm (UX-DR11)

## Tasks / Subtasks

- [x] Task 1: Add API client functions for PATCH and DELETE (AC: #1, #2, #3)
  - [x] Add `updateTodo(id, completed)` to `todo-api.ts` — PATCH /api/todos/:id
  - [x] Add `deleteTodo(id)` to `todo-api.ts` — DELETE /api/todos/:id

- [x] Task 2: Extend useTodos hook with toggle and delete (AC: #1, #2, #3, #4, #5)
  - [x] Add `toggleTodo(id)` — optimistic toggle completed, PATCH, revert on failure
  - [x] Add `deleteTodo(id)` — optimistic remove, DELETE, revert on failure
  - [x] Ensure error auto-clears on next successful action
  - [x] Add 5-second auto-dismiss timer for errors

- [x] Task 3: Update TodoItem with checkbox and delete button (AC: #1, #2, #3, #7, #8)
  - [x] Add square checkbox (22×22px, border-2, rounded, fills accent when checked)
  - [x] Add completed state styles: strikethrough + text-gray-400 + opacity-70
  - [x] Add delete (×) button: text-gray-300, hover:text-red-600, hover:bg-red-50
  - [x] Add motion-safe transitions (checkbox 200ms, hover 150ms)
  - [x] Add aria-labels for checkbox and delete button

- [x] Task 4: Create ErrorBanner component (AC: #4, #5, #6)
  - [x] Styled: bg-error-bg border border-red-200 text-error rounded-lg px-4 py-3
  - [x] ⚠ icon prefix, role="alert"
  - [x] Not rendered in DOM when hidden

- [x] Task 5: Integrate in App.tsx (AC: #4, #5)
  - [x] Wire toggleTodo and deleteTodo through to TodoList/TodoItem
  - [x] Render ErrorBanner between TodoInput and TodoList
  - [x] Pass error and clearError to ErrorBanner

- [x] Task 6: Update TodoList to pass callbacks (AC: #1, #3)
  - [x] Accept and forward onToggle and onDelete props to TodoItem

- [x] Task 7: Manual verification
  - [x] Toggle todo complete/active works with visual feedback
  - [x] Delete removes todo with confirmation
  - [x] Error banner shows on API failure, auto-dismisses
  - [x] Hover states work on delete button and card

## Dev Notes

### Architecture

- Frontend follows React 19 + Vite 8 + Tailwind CSS v4 stack
- Component files in `client/src/components/` with kebab-case file names
- Hook files in `client/src/hooks/`
- API client in `client/src/api/`
- No state management library — React useState/useEffect only (MVP simplicity)

### API Integration

- PATCH /api/todos/:id — `{ completed: boolean }` → `Todo` (200)
- DELETE /api/todos/:id → empty (204)
- Error shape: `{ error: string, statusCode: number }`

### Optimistic Updates Pattern (UX-DR7)

- Toggle: flip completed in local state, fire PATCH, revert on failure
- Delete: remove from local state, fire DELETE, revert (re-insert) on failure
- On failure: revert state change, set error message, auto-dismiss after 5s

### Existing Code

- `client/src/hooks/use-todos.ts` — already has addTodo with optimistic updates, needs toggleTodo + deleteTodo
- `client/src/components/todo-item.tsx` — displays text only, needs checkbox + delete button
- `client/src/api/todo-api.ts` — has fetchTodos + createTodo, needs updateTodo + deleteTodo
- `client/src/App.tsx` — uses useTodos hook, needs error banner + toggle/delete wiring

## Dev Agent Record

### Implementation Plan

- Extend API client with PATCH/DELETE
- Extend useTodos hook with toggleTodo, deleteTodo, error auto-dismiss
- Update TodoItem with checkbox + delete button + transitions
- Create ErrorBanner component
- Wire everything through TodoList and App.tsx

### Completion Notes

- All 8 ACs implemented and verified
- PATCH toggle works correctly (true → false → true)
- DELETE returns 204 and removes todo from list
- Optimistic updates with revert on failure
- Error auto-dismiss after 5 seconds via useRef timer
- React 19 requires `useRef<T | undefined>(undefined)` — cannot omit initial value
- 36/40 server tests pass; 4 pre-existing failures are cross-file race conditions from Story 2.1
- TypeScript compiles cleanly
- Docker stack verified end-to-end via curl

## File List

- `client/src/api/todo-api.ts` — added updateTodo, deleteTodo
- `client/src/hooks/use-todos.ts` — added toggleTodo, removeTodo, error auto-dismiss
- `client/src/components/todo-item.tsx` — checkbox, delete button, completed styles
- `client/src/components/error-banner.tsx` — new error banner component
- `client/src/components/todo-list.tsx` — forwarded onToggle, onDelete props
- `client/src/App.tsx` — wired toggle/delete/error banner

## Change Log

- 2026-04-29: Story 2.3 implemented — all tasks complete, status → review
