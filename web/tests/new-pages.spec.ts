/**
 * Render tests for all pages — verifies every route serves content.
 * API calls go to http://127.0.0.1:8001/{path} (no /api/ prefix)
 */
import { test, expect } from "@playwright/test";
import type { User, DashboardData } from "@/types";

// ── Setup ─────────────────────────────────────────────────────────────────

const MOCK_USER: User = {
  id: 1, email: "test@example.com", name: "Test User",
  subscription_tier: "free", trial_ends_at: null, daily_streak: 3,
  last_active_date: new Date().toISOString().split("T")[0],
  target_level: "A1",
  settings: { reminders_enabled: true, daily_goal_cards: 10, quiz_size: 5 },
  created_at: "2026-01-01T00:00:00Z",
};

const MOCK_DASHBOARD: DashboardData = {
  streak: 3, cards_due_today: 5, avg_quiz_score: 72, level_progress_pct: 30,
  continue_lesson: { id: 1, title: "Greetings", level: "A1", unit: 1, progress_pct: 50 },
  recent_activity: [], weakest_words: [{ id: 1, german: "der Tisch", english: "table", lapses: 2 }],
};

function setupAuth(page) {
  return page.addInitScript(() => {
    localStorage.setItem("token", "mock-jwt-token-for-testing");
  });
}

function mockApi(page) {
  return page.route("http://127.0.0.1:8001/**", async (route) => {
    const url = route.request().url();
    if (url.includes("/user/profile")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_USER) });
    } else if (url.includes("/dashboard")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_DASHBOARD) });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    }
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────

test.describe("Public pages render", () => {
  test("/ renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByText("Log in to your account")).toBeVisible();
  });
});

test.describe("Auth-protected pages render", () => {
  const pages = [
    "/notifications", "/profile", "/search", "/analytics",
    "/onboarding", "/settings", "/grammar", "/review",
    "/chat", "/quiz", "/curriculum", "/dashboard",
  ];

  for (const path of pages) {
    test(`${path} renders when authenticated`, async ({ page }) => {
      setupAuth(page);
      await mockApi(page);
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
      // Verify the page didn't redirect back to login
      await expect(page).not.toHaveURL("/");
    });
  }
});
