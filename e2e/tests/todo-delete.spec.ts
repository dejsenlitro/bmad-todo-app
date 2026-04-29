import { test, expect } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const res = await request.get("/api/todos");
  const todos = await res.json();
  for (const todo of todos) {
    await request.delete(`/api/todos/${todo.id}`);
  }
  await request.post("/api/todos", { data: { text: "Delete me" } });
});

test.describe("Delete Todo", () => {
  test("clicking delete removes todo from list", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Delete me")).toBeVisible();

    await page.getByRole("button", { name: /Delete Delete me/ }).click();

    await expect(page.getByText("Delete me")).not.toBeVisible();
  });

  test("deleted todo does not reappear after refresh", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Delete Delete me/ }).click();
    await expect(page.getByText("Delete me")).not.toBeVisible();

    await page.reload();

    await expect(page.getByText("Delete me")).not.toBeVisible();
  });
});
