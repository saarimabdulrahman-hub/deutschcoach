"""Integration tests for curriculum, SRS, quiz, and dashboard endpoints."""
import pytest
import uuid
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def _first_a1_lesson_id(auth_headers: dict) -> int:
    """Return the database ID of the first A1 lesson (works regardless of AUTO_INCREMENT)."""
    resp = client.get("/curriculum/A1", headers=auth_headers)
    assert resp.status_code == 200
    lessons = resp.json()
    assert len(lessons) >= 1
    return lessons[0]["id"]


@pytest.fixture
def auth():
    """Create a unique test user and return auth headers."""
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    pwd = "test1234"
    client.post("/auth/signup", json={"name": "Tester", "email": email, "password": pwd})
    resp = client.post("/auth/login", json={"email": email, "password": pwd})
    assert resp.status_code == 200
    token = resp.json()["token"]
    return {"Authorization": f"Bearer {token}"}


def test_curriculum_list(auth):
    resp = client.get("/curriculum/", headers=auth)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["level"] == "A1"


def test_curriculum_a1(auth):
    resp = client.get("/curriculum/A1", headers=auth)
    assert resp.status_code == 200
    assert len(resp.json()) >= 5


def test_lesson_detail(auth):
    lesson_id = _first_a1_lesson_id(auth)
    resp = client.get(f"/curriculum/A1/{lesson_id}", headers=auth)
    assert resp.status_code == 200
    data = resp.json()
    assert data["lesson"]["title"] == "Erste Begegnungen"
    assert len(data["vocabulary"]) >= 5
    assert len(data["exercises"]) >= 3


def test_grammar(auth):
    resp = client.get("/grammar/", headers=auth)
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


def test_grammar_detail(auth):
    resp = client.get("/grammar/personal-pronouns-nominative", headers=auth)
    assert resp.status_code == 200
    assert resp.json()["slug"] == "personal-pronouns-nominative"


def test_srs_seed_and_stats(auth):
    lesson_id = _first_a1_lesson_id(auth)
    resp = client.post("/srs/seed-lesson", json={"lesson_id": lesson_id}, headers=auth)
    assert resp.status_code == 200
    data = resp.json()
    assert data["newly_seeded"] >= 1
    assert "streak" in data

    resp = client.get("/srs/stats", headers=auth)
    assert resp.status_code == 200
    stats = resp.json()
    assert stats["total_due_today"] >= 1


def test_srs_review(auth):
    lesson_id = _first_a1_lesson_id(auth)
    client.post("/srs/seed-lesson", json={"lesson_id": lesson_id}, headers=auth)
    resp = client.get("/srs/due", headers=auth)
    cards = resp.json()
    if cards:
        resp = client.post("/srs/review", json={"card_id": cards[0]["id"], "rating": 4}, headers=auth)
        assert resp.status_code == 200


def test_quiz_generate(auth):
    resp = client.post("/quiz/generate", json={"level": "A1", "count": 3}, headers=auth)
    assert resp.status_code == 200
    data = resp.json()
    assert "session_id" in data
    assert len(data["questions"]) == 3


def test_quiz_submit(auth):
    resp = client.post("/quiz/generate", json={"level": "A1", "count": 3}, headers=auth)
    session_id = resp.json()["session_id"]
    answers = [{"question_id": q["id"], "answer": "test"} for q in resp.json()["questions"]]
    resp = client.post(f"/quiz/{session_id}/submit", json={"answers": answers}, headers=auth)
    assert resp.status_code == 200
    assert "score_pct" in resp.json()


def test_dashboard(auth):
    resp = client.get("/dashboard/", headers=auth)
    assert resp.status_code == 200
    data = resp.json()
    assert "streak" in data
    assert "cards_due_today" in data


def test_user_profile(auth):
    resp = client.get("/user/profile", headers=auth)
    assert resp.status_code == 200
    assert "email" in resp.json()


def test_payment_plans():
    resp = client.get("/payments/plans")
    assert resp.status_code == 200
    assert len(resp.json()) == 3


def test_chat_scenarios(auth):
    resp = client.get("/chat/scenarios", headers=auth)
    assert resp.status_code == 200
    assert len(resp.json()["scenarios"]) >= 1
