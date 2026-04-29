---
story_id: 3-2
epic: 3
title: "Playwright E2E Tests"
status: done
started: 2026-04-29
---

# Story 3.2: Playwright E2E Tests

## Goal
5 passing Playwright E2E tests covering all core user journeys against the full running stack.

## Spec Files
1. `e2e/tests/todo-create.spec.ts` — create todo, appears in list, persists after refresh
2. `e2e/tests/todo-complete.spec.ts` — checkbox toggle, styling, state persists after refresh
3. `e2e/tests/todo-delete.spec.ts` — delete removes todo, doesn't reappear after refresh
4. `e2e/tests/todo-empty.spec.ts` — empty state message on first load, input auto-focused
5. `e2e/tests/todo-error.spec.ts` — error banner appears when API fails

## Infrastructure
- `e2e/playwright.config.ts` configured for Docker app at localhost:8080
- Tests run against full Docker Compose stack
