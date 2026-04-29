import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 15000,
  retries: 1,
  workers: 1,
  fullyParallel: false,
  use: {
    baseURL: "http://localhost:8080",
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
