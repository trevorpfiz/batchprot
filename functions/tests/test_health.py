from fastapi.testclient import TestClient

from functions.main import app

client = TestClient(app)


def test_health_check():
    """
    Test that the health check endpoint returns a 200 OK response.
    """
    response = client.get("/api/v1/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
