import { test, expect } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const res = await request.get("/api/todos");
  const todos = await res.json();
  for (const todo of todos) {
    await request.delete(`/api/todos/${todo.id}`);
  }
  // Seed a todo for completion tests
  await request.post("/api/todos", { data: { text: "Complete me" } });
});

test.describe("Complete Todo", () => {
  test("clicking checkbox shows strikethrough styling", async ({ page }) => {
    await page.goto("/");
    const checkbox = page.getByRole("checkbox", { name: /Complete me/ });
    await expect(checkbox).toHaveAttribute("aria-checked", "false");

    await checkbox.click();

    await expect(checkbox).toHaveAttribute("aria-checked", "true");
    const text = page.getByText("Complete me");
    await expect(text).toHaveClass(/line-through/);
  });

  test("toggling back to active removes strikethrough", async ({ page }) => {
    await page.goto("/");
    const checkbox = page.getByRole("checkbox", { name: /Complete me/ });

    await checkbox.click();
    await expect(checkbox).toHaveAttribute("aria-checked", "true");
    // Wait for the API call to settle before toggling back
    await page.waitForTimeout(500);

    await checkbox.click();
    await expect(checkbox).toHaveAttribute("aria-checked", "false");
    const text = page.getByText("Complete me");
    await expect(text).not.toHaveClass(/line-through/);
  });

  test("completed state persists after refresh", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("checkbox", { name: /Complete me/ }).click();

    await page.reload();

    await expect(
      page.getByRole("checkbox", { name: /Complete me/ }),
    ).toHaveAttribute("aria-checked", "true");
  });
});
