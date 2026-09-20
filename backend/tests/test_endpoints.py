import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import get_async_session

# Mock DB Session
class MockSession:
    async def execute(self, *args, **kwargs):
        class MockResult:
            def scalars(self):
                class MockScalars:
                    def first(self):
                        return None
                return MockScalars()
        return MockResult()
        
    async def get(self, *args, **kwargs):
        return None
        
    async def add(self, *args, **kwargs):
        pass
        
    async def commit(self):
        pass
        
    async def rollback(self):
        pass

async def override_get_async_session():
    yield MockSession()

app.dependency_overrides[get_async_session] = override_get_async_session

client = TestClient(app)

def test_clients_config():
    response = client.get("/api/v1/clients/config?client_id=c4a6c9b1-8355-4de2-985d-a04f4dcd63a0")
    print("CONFIG STATUS:", response.status_code)
    print("CONFIG RESPONSE:", response.text)

def test_track_identity():
    payload = {
        "client_id": "c4a6c9b1-8355-4de2-985d-a04f4dcd63a0",
        "aura_id": "test-aura-id",
        "signature": {"canvas": "abc", "webgl": "xyz", "drift": 0, "network": {"type": "4g", "downlink": 10, "rtt": 50}}
    }
    response = client.post("/api/v1/track/identity", json=payload)
    print("IDENTITY STATUS:", response.status_code)
    print("IDENTITY RESPONSE:", response.text)

if __name__ == "__main__":
    test_clients_config()
    test_track_identity()
