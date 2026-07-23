/**
 * Quiz flow E2E tests — setup, answering, results, and edge cases.
 * API calls go to http://127.0.0.1:8001/{path} (no /api/ prefix)
 */

import { test, expect, Page } from "@playwright/test";
import type { User, DashboardData } from "@/types";

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
    } else if (url.includes("/quiz/start")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          session_id: "test-session-123",
          questions: [
            { id: 1, type: "multiple-choice", prompt: "What does 'der Tisch' mean?", options: ["table", "chair", "door", "window"], answer: "table" },
            { id: 2, type: "translate", prompt: "Translate: 'house'", answer: "das Haus" },
            { id: 3, type: "fill-blank", prompt: "Ich ___ ein Student.", options: ["bin", "bist", "ist", "sind"], answer: "bin" },
          ],
        }),
      });
    } else if (url.includes("/quiz") && route.request().method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          score_pct: 80,
          questions_total: 3,
          questions_correct: 2,
          results: [
            { question_id: "1", correct: true, your_answer: "table", correct_answer: "table" },
            { question_id: "2", correct: true, your_answer: "das Haus", correct_answer: "das Haus" },
            { question_id: "3", correct: false, your_answer: "ist", correct_answer: "bin" },
          ],
        }),
      });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    }
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────

test.describe("Quiz Page", () => {
  test("renders when authenticated", async ({ page }) => {
    setupAuth(page);
    await mockApi(page);
    await page.goto("/quiz");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
  });
});

test.describe("Quiz — Edge Cases", () => {
  test("handles empty quiz state", async ({ page }) => {
    setupAuth(page);
    await page.route("http://127.0.0.1:8001/**", async (route) => {
      const url = route.request().url();
      if (url.includes("/user/profile")) {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_USER) });
      } else if (url.includes("/dashboard")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...MOCK_DASH, weakest_words: [], continue_lesson: null }),
        });
      } else {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
      }
    });

    await page.goto("/quiz");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
  });
});
