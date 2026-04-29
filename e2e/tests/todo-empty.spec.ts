import { test, expect } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const res = await request.get("/api/todos");
  const todos = await res.json();
  for (const todo of todos) {
    await request.delete(`/api/todos/${todo.id}`);
  }
});

test.describe("Empty State", () => {
  test("shows empty state message when no todos exist", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByText("Your todo list is empty. Start by adding a task!"),
    ).toBeVisible();
  });

  test("input is auto-focused on page load", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByLabel("Add a new todo")).toBeFocused();
  });
});
