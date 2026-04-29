import { test, expect } from "@playwright/test";

// Clean todos before each test via API
test.beforeEach(async ({ request }) => {
  const res = await request.get("/api/todos");
  const todos = await res.json();
  for (const todo of todos) {
    await request.delete(`/api/todos/${todo.id}`);
  }
});

test.describe("Create Todo", () => {
  test("user types a task, presses Enter, todo appears in list", async ({
    page,
  }) => {
    await page.goto("/");
    const input = page.getByLabel("Add a new todo");
    await input.fill("Buy groceries");
    await input.press("Enter");

    await expect(page.getByText("Buy groceries")).toBeVisible();
  });

  test("user types a task, clicks Add button, todo appears", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByLabel("Add a new todo").fill("Walk the dog");
    await page.getByRole("button", { name: "Add" }).click();

    await expect(page.getByText("Walk the dog")).toBeVisible();
  });

  test("created todo persists after page refresh", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Add a new todo").fill("Persistent task");
    await page.getByLabel("Add a new todo").press("Enter");
    await expect(page.getByText("Persistent task")).toBeVisible();

    await page.reload();

    await expect(page.getByText("Persistent task")).toBeVisible();
  });
});
