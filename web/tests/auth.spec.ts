/**
 * Auth flow integration tests — Login, Signup, Forgot/Reset Password
 *
 * These tests mock API responses via page.route() so they work
 * without a running backend.
 * API calls go to http://127.0.0.1:8001/{path} (no /api/ prefix)
 */

import { test, expect, Page } from "@playwright/test";
import type { AuthResponse, User, DashboardData } from "@/types";

// ── Helpers ───────────────────────────────────────────────────────────────

const MOCK_USER: User = {
  id: 1,
  email: "test@example.com",
  name: "Test User",
  subscription_tier: "free",
  trial_ends_at: null,
  daily_streak: 3,
  last_active_date: new Date().toISOString().split("T")[0],
  target_level: "A1",
  settings: { reminders_enabled: true, daily_goal_cards: 10, quiz_size: 5 },
  created_at: "2026-01-01T00:00:00Z",
};

const MOCK_AUTH_RESPONSE: AuthResponse = {
  user: MOCK_USER,
  token: "mock-jwt-token-for-testing",
};

const MOCK_DASHBOARD: DashboardData = {
  streak: 3,
  cards_due_today: 5,
  avg_quiz_score: 72,
  level_progress_pct: 30,
  continue_lesson: { id: 1, title: "Greetings", level: "A1", unit: 1, progress_pct: 50 },
  recent_activity: [],
  weakest_words: [{ id: 1, german: "der Tisch", english: "table", lapses: 2 }],
};

function mockCatchAll(page: Page) {
  // Mock all API requests to the backend server
  return page.route("http://127.0.0.1:8001/**", async (route) => {
    const url = route.request().url();

    if (url.includes("/auth/login") || url.includes("/auth/signup")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_AUTH_RESPONSE),
      });
    } else if (url.includes("/auth/forgot-password")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Email sent" }),
      });
    } else if (url.includes("/user/profile")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_USER),
      });
    } else if (url.includes("/dashboard")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_DASHBOARD),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    }
  });
}

function mockAuthError(page: Page, endpoint: string, status: number, body: object) {
  return page.route("http://127.0.0.1:8001/**", async (route) => {
    const url = route.request().url();
    if (url.includes(endpoint)) {
      await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    } else if (url.includes("/user/profile")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_USER) });
    } else if (url.includes("/dashboard")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_DASHBOARD) });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    }
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────

test.describe("Login Page", () => {
  test("renders with heading and form elements", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Log in to your account")).toBeVisible();
    await expect(page.getByPlaceholder("name@email.com")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your password")).toBeVisible();
    await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();
    await expect(page.getByText("Continue with Google")).toBeVisible();
  });

  test("shows validation errors for empty fields", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page.getByText("Email is required.")).toBeVisible();
  });

  test("shows error for invalid password (only email filled)", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("name@email.com").fill("test@example.com");
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page.getByText("Password is required.")).toBeVisible();
  });

  test("toggles password visibility", async ({ page }) => {
    await page.goto("/");
    const passwordInput = page.getByPlaceholder("Enter your password");
    await passwordInput.fill("secret123");
    await expect(passwordInput).toHaveAttribute("type", "password");
    // Find the password visibility toggle button (inside the password field container)
    const container = page.locator('input[type="password"]').locator("..").locator("..");
    const toggleBtn = container.locator("button");
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await expect(passwordInput).toHaveAttribute("type", "text");
    }
  });

  test("navigates to signup page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL("/signup");
  });

  test("navigates to forgot-password page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /forgot password/i }).click();
    await expect(page).toHaveURL("/forgot-password");
  });

  test("successful login redirects to dashboard", async ({ page }) => {
    await mockCatchAll(page);

    await page.goto("/");
    await page.getByPlaceholder("name@email.com").fill("test@example.com");
    await page.getByPlaceholder("Enter your password").fill("password123");
    await page.getByRole("button", { name: /log in/i }).click();

    // Should redirect to dashboard after login
    await page.waitForURL("/dashboard", { timeout: 15000 });
    await expect(page.getByText(/guten/i)).toBeVisible({ timeout: 10000 });
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await mockAuthError(page, "/auth/login", 401, { detail: "Invalid email or password." });

    await page.goto("/");
    await page.getByPlaceholder("name@email.com").fill("wrong@test.com");
    await page.getByPlaceholder("Enter your password").fill("wrongpass");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page.getByText("Invalid email or password.")).toBeVisible({ timeout: 10000 });
  });

  test("Google sign-in button is disabled", async ({ page }) => {
    await page.goto("/");
    const googleBtn = page.getByRole("button", { name: /continue with google/i });
    await expect(googleBtn).toBeDisabled();
  });
});

test.describe("Signup Page", () => {
  test("renders with heading and form fields", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("Create your account")).toBeVisible();
    await expect(page.getByPlaceholder("Your full name")).toBeVisible();
    await expect(page.getByPlaceholder("name@email.com")).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("shows validation errors for empty fields", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText("Name is required.")).toBeVisible();
  });

  test("shows error for short password", async ({ page }) => {
    await page.goto("/signup");
    await page.getByPlaceholder("Your full name").fill("Test User");
    await page.getByPlaceholder("name@email.com").fill("test@example.com");
    await page.getByPlaceholder(/password/i).fill("12345");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText("Password must be at least 6 characters.")).toBeVisible();
  });

  test("shows password strength bar", async ({ page }) => {
    await page.goto("/signup");
    const passwordInput = page.getByPlaceholder(/password/i);
    await expect(page.getByText("Password strength")).not.toBeVisible();
    await passwordInput.fill("abc");
    await expect(page.getByText("Too short")).toBeVisible();
    await passwordInput.fill("StrongPass1");
    await expect(page.getByText("Good")).toBeVisible();
  });

  test("successful signup redirects to dashboard", async ({ page }) => {
    await mockCatchAll(page);

    await page.goto("/signup");
    await page.getByPlaceholder("Your full name").fill("New User");
    await page.getByPlaceholder("name@email.com").fill("new@example.com");
    await page.getByPlaceholder(/password/i).fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();

    await page.waitForURL("/dashboard", { timeout: 15000 });
    await expect(page.getByText(/guten/i)).toBeVisible({ timeout: 10000 });
  });

  test("navigates back to login page", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("link", { name: /log in/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("displays 7-day free trial badge", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("7-DAY FREE TRIAL")).toBeVisible();
  });
});

test.describe("Forgot Password Page", () => {
  test("renders with heading and email input", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByText("Reset your password")).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /send reset link/i })).toBeVisible();
  });

  test("shows success message after submitting email", async ({ page }) => {
    await mockCatchAll(page);

    await page.goto("/forgot-password");
    await page.getByPlaceholder(/email/i).fill("test@example.com");
    await page.getByRole("button", { name: /send reset link/i }).click();

    await expect(page.getByText("Check your email")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("we've sent a password reset link")).toBeVisible();
  });

  test("shows success even on error (no user enumeration)", async ({ page }) => {
    await mockAuthError(page, "/auth/forgot-password", 500, { detail: "Server error" });

    await page.goto("/forgot-password");
    await page.getByPlaceholder(/email/i).fill("nonexistent@test.com");
    await page.getByRole("button", { name: /send reset link/i }).click();

    // Should still show success (security measure — never reveal if email exists)
    await expect(page.getByText("Check your email")).toBeVisible({ timeout: 10000 });
  });

  test("navigates back to login", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByRole("link", { name: /back to login/i }).click();
    await expect(page).toHaveURL("/");
  });
});
