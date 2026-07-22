/**
 * Dashboard E2E tests — with mocked API data so no backend needed.
 * API calls go to http://127.0.0.1:8001/{path} (no /api/ prefix)
 */

import { test, expect, Page } from "@playwright/test";
import type { DashboardData, User } from "@/types";

// ── Mock Data ─────────────────────────────────────────────────────────────

const MOCK_USER: User = {
  id: 1,
  email: "test@example.com",
  name: "Test User",
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
  continue_lesson: {
    id: 1,
    title: "Greetings & Introductions",
    level: "A1",
    unit: 1,
    progress_pct: 60,
  },
  recent_activity: [
    { type: "lesson", description: "Completed Greetings & Introductions", timestamp: new Date().toISOString() },
    { type: "quiz", description: "Scored 80% on Vocabulary Quiz", timestamp: new Date(Date.now() - 86400000).toISOString() },
  ],
  weakest_words: [
    { id: 1, german: "der Tisch", english: "table", lapses: 3 },
    { id: 2, german: "die Blume", english: "flower", lapses: 2 },
  ],
};

function setupAuth(page: Page) {
  return page.addInitScript(() => {
    localStorage.setItem("token", "mock-jwt-token-for-testing");
  });
}

function mockApi(page: Page) {
  // Mock all API requests to the backend server
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

test.describe("Dashboard — Authenticated", () => {
  test.beforeEach(async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/dashboard");
    // Wait for dashboard to fully load (heading appears with greeting)
    await expect(page.getByText(/guten/i)).toBeVisible({ timeout: 15000 });
  });

  test("renders greeting with user name", async ({ page }) => {
    await expect(page.getByText(/Test/i).first()).toBeVisible();
  });

  test("displays day streak card", async ({ page }) => {
    await expect(page.getByText("7").first()).toBeVisible();
    await expect(page.getByText("Day Streak").first()).toBeVisible();
  });

  test("displays current level card with progress bar", async ({ page }) => {
    await expect(page.getByText("Current Level").first()).toBeVisible();
    await expect(page.getByText("35%").first()).toBeVisible();
  });

  test("shows Today's Plan section with three cards", async ({ page }) => {
    await expect(page.getByText("Today's Plan").first()).toBeVisible();
    await expect(page.getByText("Your First Lesson").first()).toBeVisible();
    await expect(page.getByText("German Grammar").first()).toBeVisible();
    await expect(page.getByText("Practice Speaking").first()).toBeVisible();
  });

  test("shows Progress section with ring", async ({ page }) => {
    await expect(page.getByText("Your Progress").first()).toBeVisible();
    await expect(page.getByText("35% complete").first()).toBeVisible();
  });

  test("shows KPI cards with correct values", async ({ page }) => {
    await expect(page.getByText("Level Progress").first()).toBeVisible();
    await expect(page.getByText("Cards to Review").first()).toBeVisible();
    await expect(page.getByText("5").first()).toBeVisible();
    await expect(page.getByText("Quiz Accuracy").first()).toBeVisible();
    await expect(page.getByText("72%").first()).toBeVisible();
  });

  test("shows Review & Practice section", async ({ page }) => {
    await expect(page.getByText("Review & Practice").first()).toBeVisible();
    await expect(page.getByText("Flashcards Complete").first()).toBeVisible();
    await expect(page.getByText("Discover Your Level").first()).toBeVisible();
  });

  test("shows Recent Activity section", async ({ page }) => {
    await expect(page.getByText("Recent Activity").first()).toBeVisible();
  });

  test("shows Tip of the Day", async ({ page }) => {
    await expect(page.getByText("Tip of the Day").first()).toBeVisible();
  });

  test("View Roadmap button navigates to /curriculum", async ({ page }) => {
    await page.getByRole("button", { name: /view roadmap/i }).click();
    await expect(page).toHaveURL(/\/curriculum/);
  });

  test("Start Lesson navigates to curriculum", async ({ page }) => {
    await page.getByRole("button", { name: /start lesson/i }).click();
    await expect(page).toHaveURL(/\/curriculum/);
  });
});

test.describe("Dashboard — Empty State (new user)", () => {
  test.beforeEach(async ({ page }) => {
    setupAuth(page);
    // Mock API requests to the backend server
    await page.route("http://127.0.0.1:8001/**", async (route) => {
      const url = route.request().url();
      if (url.includes("/user/profile")) {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_USER) });
      } else if (url.includes("/dashboard")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ...MOCK_DASHBOARD,
            streak: 0,
            cards_due_today: 0,
            avg_quiz_score: 0,
            level_progress_pct: 0,
            continue_lesson: null,
            recent_activity: [],
            weakest_words: [],
          }),
        });
      } else {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
      }
    });

    await page.goto("/dashboard");
    await expect(page.getByText(/guten/i)).toBeVisible({ timeout: 15000 });
  });

  test("shows 'Ready to begin' when no progress", async ({ page }) => {
    await expect(page.getByText("Ready to begin").first()).toBeVisible();
  });

  test("shows 'Start today!' when streak is 0", async ({ page }) => {
    await expect(page.getByText("Start today!")).toBeVisible();
  });

  test("shows 'Your journey begins' for empty activity", async ({ page }) => {
    await expect(page.getByText("Your journey begins")).toBeVisible();
  });

  test("shows 0% quiz accuracy for new user", async ({ page }) => {
    await expect(page.getByText("0%").first()).toBeVisible();
  });
});
