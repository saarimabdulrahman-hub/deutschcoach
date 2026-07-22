/**
 * Playwright Test Configuration
 * Reference: DeutschFlow Design Bible 16_DESIGN_QA_AND_TESTING
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 30000,
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3457",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  // Auto-start Next.js dev server when running tests
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3457",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    cwd: ".",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 13"] },
    },
  ],
});
