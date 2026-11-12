import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_ai_health():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "socialconnect-ai-service"
    assert "weights" in data
    assert data["weights"]["interest"] == 0.40


def test_match_activities_endpoint():
    payload = {
        "user": {
            "user_id": "test-user-001",
            "interests": ["heritage walks", "photography"],
            "interest_proficiencies": {},
            "category_preferences": ["Festivals & Culture"],
            "general_location": "North Kolkata",
            "availability": [{"day_of_week": 5, "time_slot": "EVENING"}],
        },
        "candidates": [
            {
                "activity_id": "act-1",
                "category": "Festivals & Culture",
                "category_slug": "festivals-culture",
                "interests": ["heritage walks"],
                "general_location": "North Kolkata",
                "day_of_week": 5,
                "time_slot": "EVENING",
                "capacity": 8,
                "available_spots": 3,
            }
        ],
        "limit": 10,
    }

    res = client.post("/api/v1/match/activities", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_candidates"] == 1
    assert len(data["ranked_results"]) == 1
    top = data["ranked_results"][0]
    assert top["entity_id"] == "act-1"
    assert top["score"] > 0.70
    assert top["breakdown"]["schedule_score"] == 1.0


def test_match_users_endpoint():
    payload = {
        "user": {
            "user_id": "u-001",
            "interests": ["chess", "coffee"],
            "interest_proficiencies": {},
            "category_preferences": [],
            "general_location": "South Kolkata",
            "availability": [{"day_of_week": 6, "time_slot": "AFTERNOON"}],
        },
        "candidates": [
            {
                "user_id": "u-002",
                "interests": ["chess", "tea"],
                "general_location": "South Kolkata",
                "availability": [{"day_of_week": 6, "time_slot": "AFTERNOON"}],
            }
        ],
        "limit": 5,
    }

    res = client.post("/api/v1/match/users", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_candidates"] == 1
    top = data["ranked_results"][0]
    assert top["entity_id"] == "u-002"
    assert top["score"] > 0.5
