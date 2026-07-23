/**
 * Screenshot capture tests — takes real screenshots of every page
 * and saves them to tests/screenshots/.
 *
 * API calls go to http://127.0.0.1:8001/{path} (no /api/ prefix)
 *
 * Run: npx playwright test tests/screenshots.spec.ts
 */

import { test, expect, Page } from "@playwright/test";
import type { User, DashboardData } from "@/types";

// ── Mock Data ─────────────────────────────────────────────────────────────

const MOCK_USER: User = {
  id: 1,
  email: "test@example.com",
  name: "Demo Learner",
  subscription_tier: "free",
  trial_ends_at: null,
  daily_streak: 7,
  last_active_date: new Date().toISOString().split("T")[0],
  target_level: "A1",
  settings: { reminders_enabled: true, daily_goal_cards: 10, quiz_size: 5 },
  created_at: "2026-01-01T00:00:00Z",
};

const MOCK_DASHBOARD: DashboardData = {
  streak: 7,
  cards_due_today: 5,
  avg_quiz_score: 72,
  level_progress_pct: 35,
  continue_lesson: { id: 1, title: "Greetings & Introductions", level: "A1", unit: 1, progress_pct: 60 },
  recent_activity: [
    { type: "lesson", description: "Completed Greetings & Introductions", timestamp: new Date().toISOString() },
    { type: "quiz", description: "Scored 80% on Vocabulary Quiz", timestamp: new Date(Date.now() - 86400000).toISOString() },
  ],
  weakest_words: [
    { id: 1, german: "der Tisch", english: "table", lapses: 3 },
    { id: 2, german: "die Blume", english: "flower", lapses: 2 },
  ],
};

// Save screenshots relative to the project root (tests/screenshots/)
// In CI this can be overridden with SCREENSHOT_DIR env var.
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || "../tests/screenshots";

function setupAuth(page: Page) {
  return page.addInitScript(() => {
    localStorage.setItem("token", "mock-jwt-token-for-testing");
  });
}

function mockApi(page: Page) {
  return page.route("http://127.0.0.1:8001/**", async (route) => {
    const url = route.request().url();
    if (url.includes("/user/profile")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_USER) });
    } else if (url.includes("/dashboard")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_DASHBOARD) });
    } else if (url.includes("/curriculum/levels")) {
      await route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify([
          { level: "A1", title: "Beginner", lesson_count: 10, completed_count: 3 },
          { level: "A2", title: "Elementary", lesson_count: 12, completed_count: 0 },
          { level: "B1", title: "Intermediate", lesson_count: 15, completed_count: 0 },
        ]),
      });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    }
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────

test.describe("Page Screenshots", () => {
  test.describe.configure({ retries: 0 });

  test("login page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/login-page.png`, fullPage: true });
  });

  test("signup page", async ({ page }) => {
    await page.goto("/signup");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/signup-page.png`, fullPage: true });
  });

  test("dashboard", async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/guten/i)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard.png`, fullPage: true });
  });

  test("curriculum", async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/curriculum");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/curriculum.png`, fullPage: true });
  });

  test("quiz", async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/quiz");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/quiz.png`, fullPage: true });
  });

  test("chat", async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/chat.png`, fullPage: true });
  });

  test("review", async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/review");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/review.png`, fullPage: true });
  });

  test("grammar", async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/grammar");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/grammar.png`, fullPage: true });
  });

  test("settings", async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/settings.png`, fullPage: true });
  });

  test("profile", async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/profile.png`, fullPage: true });
  });

  test("search", async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/search.png`, fullPage: true });
  });

  test("notifications", async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/notifications");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/notifications.png`, fullPage: true });
  });

  test("analytics", async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/analytics");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/analytics.png`, fullPage: true });
  });
});
