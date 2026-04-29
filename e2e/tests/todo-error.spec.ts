import { test, expect } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const res = await request.get("/api/todos");
  const todos = await res.json();
  for (const todo of todos) {
    await request.delete(`/api/todos/${todo.id}`);
  }
});

test.describe("Error Handling", () => {
  test("error banner appears when API fails on create", async ({ page }) => {
    await page.goto("/");

    // Intercept the POST to simulate server error
    await page.route("**/api/todos", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({ status: 500, body: JSON.stringify({ error: "Server error", statusCode: 500 }) });
      } else {
        route.continue();
      }
    });

    await page.getByLabel("Add a new todo").fill("Fail task");
    await page.getByLabel("Add a new todo").press("Enter");

    const banner = page.getByRole("alert");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("Failed to save todo");
  });

  test("error banner auto-dismisses after 5 seconds", async ({ page }) => {
    await page.goto("/");

    await page.route("**/api/todos", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({ status: 500, body: JSON.stringify({ error: "Server error", statusCode: 500 }) });
      } else {
        route.continue();
      }
    });

    await page.getByLabel("Add a new todo").fill("Timeout task");
    await page.getByLabel("Add a new todo").press("Enter");

    await expect(page.getByRole("alert")).toBeVisible();

    // Wait for auto-dismiss (5s + buffer)
    await expect(page.getByRole("alert")).not.toBeVisible({ timeout: 7000 });
  });
});
