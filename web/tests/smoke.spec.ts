/**
 * Smoke tests — all public pages render without crashing.
 * Quick sanity check for deployment verification.
 */

import { test, expect } from "@playwright/test";

test.describe("Public pages (no auth required)", () => {
  const PUBLIC_PAGES = [
    { path: "/", title: "Log in to your account" },
    { path: "/signup", title: "Create your account" },
    { path: "/forgot-password", title: "Reset your password" },
  ];

  for (const { path, title } of PUBLIC_PAGES) {
    test(`${path} renders with correct heading`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByText(title)).toBeVisible();
      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test.describe("Protected pages redirect when unauthenticated", () => {
  const AUTH_PAGES = [
    "/dashboard",
    "/curriculum",
    "/chat",
    "/review",
    "/grammar",
    "/settings",
    "/profile",
    "/search",
    "/notifications",
    "/analytics",
    "/onboarding",
  ];

  for (const path of AUTH_PAGES) {
    test(`${path} redirects to login when unauthenticated`, async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.removeItem("token");
      });
      await page.goto(path);
      await expect(page).toHaveURL("/");
      // Should show login page content
      await expect(page.getByText("Log in to your account")).toBeVisible();
    });
  }
});
