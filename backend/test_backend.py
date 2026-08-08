import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure root backend dir is in sys.path
sys.path.insert(0, str(Path(__file__).parent))

from main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_list_schemes():
    response = client.get("/api/v1/schemes")
    assert response.status_code == 200
    data = response.json()
    assert "schemes" in data
    scheme_ids = [s["id"] for s in data["schemes"]]
    assert "wb-krishak-bandhu" in scheme_ids
    assert "pm-kisan" in scheme_ids
    assert "mp-ladli-behna" in scheme_ids

def test_get_scheme_detail():
    response = client.get("/api/v1/schemes/wb-krishak-bandhu")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "wb-krishak-bandhu"
    assert "last_verified" in data
    assert "source_url" in data
    assert len(data["rules"]) >= 4

def test_scoped_explainer_dto():
    payload = {
        "field_id": "nature_of_occupancy",
        "label_text": "Nature of Occupancy",
        "aria_label": "Select your land title or occupancy type",
        "input_type": "select-one",
        "placeholder": "Select occupancy",
        "context_hint": "Land & Income Details"
    }
    response = client.post("/api/v1/explain-field", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["field_id"] == "nature_of_occupancy"
    assert "Occupancy" in res_data["plain_language_explanation"]
