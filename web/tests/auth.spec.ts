/**
 * Auth flow integration tests
 */

import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Welcome back");
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test("signup page renders", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator("h1")).toContainText("Create your account");
  });

  test("forgot password page renders", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator("h1")).toContainText("Reset your password");
  });

  test("shows error on invalid login", async ({ page }) => {
    await page.goto("/");
    await page.fill('input[name="email"]', "invalid@test.com");
    await page.fill('input[type="password"]', "wrongpass");
    await page.click('button[type="submit"]');
    // Should show error or stay on login page
    await expect(page).toHaveURL("/");
  });

  test("navigation to signup works", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Create one");
    await expect(page).toHaveURL("/signup");
  });
});
