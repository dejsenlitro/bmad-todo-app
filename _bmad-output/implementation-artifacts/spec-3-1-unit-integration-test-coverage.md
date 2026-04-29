---
story_id: 3-1
epic: 3
title: "Unit & Integration Test Coverage"
status: done
started: 2026-04-29
---

# Story 3.1: Unit & Integration Test Coverage

## Goal

Achieve 70%+ meaningful test coverage on both client and server via Vitest unit/integration tests.

## Current State

- **Server**: 20 integration tests in `tests/todo-api.test.ts` (routes tested via app.inject)
- **Client**: Zero test infrastructure, zero tests

## Implementation Plan

### Server

- Add `src/services/todo-service.test.ts` — unit tests with mocked repository (validation, error codes, text trimming)

### Client Setup

- Install: vitest, jsdom, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom
- Create `vitest.config.ts` with jsdom environment
- Add test scripts to package.json

### Client Tests (co-located)

- `src/api/todo-api.test.ts` — mock fetch, test all 4 API functions (success + error paths)
- `src/components/empty-state.test.tsx` — renders message
- `src/components/error-banner.test.tsx` — renders with role="alert"
- `src/components/todo-input.test.tsx` — submit, validation, shake, auto-focus
- `src/components/todo-item.test.tsx` — toggle, delete, aria attrs, completed styling
- `src/components/todo-list.test.tsx` — renders items or empty state
- `src/hooks/use-todos.test.tsx` — load, add, toggle, remove, optimistic revert, error dismiss

## Acceptance Criteria

- All tests pass with `vitest run`
- 70%+ coverage on both client and server
- Test files co-located next to source
