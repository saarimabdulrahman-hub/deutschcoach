/**
 * Smoke tests — all pages render without crashing
 */

import { test, expect } from "@playwright/test";

const PUBLIC_PAGES = [
  { path: "/", title: "Welcome back" },
  { path: "/signup", title: "Create your account" },
  { path: "/forgot-password", title: "Reset your password" },
];

const AUTH_PAGES = [
  { path: "/dashboard", title: "Guten" },
  { path: "/curriculum", title: "curriculum" },
  { path: "/chat", title: "Emma" },
  { path: "/review", title: "Review" },
  { path: "/grammar", title: "Grammar" },
  { path: "/settings", title: "Settings" },
];

test.describe("Public pages", () => {
  for (const { path, title } of PUBLIC_PAGES) {
    test(`${path} renders`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test.describe("Authenticated pages", () => {
  for (const { path } of AUTH_PAGES) {
    test(`${path} redirects to login when unauthenticated`, async ({ page }) => {
      await page.goto(path);
      // Should redirect to login
      await expect(page).toHaveURL("/");
    });
  }
});
