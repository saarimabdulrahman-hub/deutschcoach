/**
 * Curriculum, Review, Chat, Grammar page tests with mocked API.
 * API calls go to http://127.0.0.1:8001/{path} (no /api/ prefix)
 */

import { test, expect, Page } from "@playwright/test";
import type { User, CurriculumLevel, LessonListItem, DashboardData } from "@/types";

// ── Mock Data ─────────────────────────────────────────────────────────────

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

const MOCK_DASH: DashboardData = {
  streak: 3,
  cards_due_today: 5,
  avg_quiz_score: 72,
  level_progress_pct: 30,
  continue_lesson: { id: 1, title: "Greetings", level: "A1", unit: 1, progress_pct: 50 },
  recent_activity: [],
  weakest_words: [{ id: 1, german: "der Tisch", english: "table", lapses: 2 }],
};

const MOCK_LEVELS: CurriculumLevel[] = [
  { level: "A1", title: "Beginner", lesson_count: 10, completed_count: 3 },
  { level: "A2", title: "Elementary", lesson_count: 12, completed_count: 0 },
  { level: "B1", title: "Intermediate", lesson_count: 15, completed_count: 0 },
  { level: "B2", title: "Upper Intermediate", lesson_count: 14, completed_count: 0 },
  { level: "C1", title: "Advanced", lesson_count: 10, completed_count: 0 },
];

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
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_DASH) });
    } else if (url.includes("/curriculum/levels")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_LEVELS) });
    } else if (url.includes("/curriculum/") && url.includes("/lessons")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: 1, title: "Greetings & Introductions", unit: 1, order: 1, topics: ["greetings"], completed: true },
          { id: 2, title: "Numbers & Counting", unit: 1, order: 2, topics: ["numbers"], completed: false },
        ]),
      });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    }
  });
}

// ── Curriculum Tests ──────────────────────────────────────────────────────

test.describe("Curriculum Page", () => {
  test.beforeEach(async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/curriculum");
    await expect(page.getByText(/curriculum|lessons?/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("renders with content", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible();
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });
});

// ── Review Page Tests ─────────────────────────────────────────────────────

test.describe("Review Page", () => {
  test("renders when authenticated", async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/review");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
  });
});

// ── Chat Page Tests ───────────────────────────────────────────────────────

test.describe("Chat Page", () => {
  test("renders when authenticated", async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/chat");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
  });
});

// ── Grammar Page Tests ────────────────────────────────────────────────────

test.describe("Grammar Page", () => {
  test("renders when authenticated", async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/grammar");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
  });
});

// ── Settings Page Tests ───────────────────────────────────────────────────

test.describe("Settings Page", () => {
  test("renders when authenticated", async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/settings");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/settings|profile|account/i).first()).toBeVisible();
  });
});

// ── Search Page Tests ─────────────────────────────────────────────────────

test.describe("Search Page", () => {
  test("renders when authenticated", async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/search");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
  });
});
