import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database.session import AsyncSessionLocal, Base, engine
from app.core.security import hash_password
from app.models import User

@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"

@pytest.mark.asyncio
async def test_auth_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Signup
        signup_res = await ac.post("/api/auth/signup", json={
            "email": "testuser@example.com",
            "password": "Password123!",
            "first_name": "Test",
            "last_name": "User",
            "username": "testuser"
        })
        assert signup_res.status_code == 201
        token = signup_res.json()["access_token"]
        assert token

        # Login
        login_res = await ac.post("/api/auth/login", json={
            "email": "testuser@example.com",
            "password": "Password123!"
        })
        login_token = login_res.json()["access_token"]
        assert login_token

        # Me
        headers = {"Authorization": f"Bearer {token}"}
        me_res = await ac.get("/api/auth/me", headers=headers)
        assert me_res.status_code == 200
        assert me_res.json()["email"] == "testuser@example.com"

@pytest.mark.asyncio
async def test_trips_crud():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create trip
        create_res = await ac.post("/api/trips", json={
            "name": "Swiss Alps Tour",
            "destination": "Switzerland",
            "duration_days": 4,
            "budget": 50000.0,
            "currency": "INR",
            "stops": [
                {
                    "city_name": "Zurich",
                    "country": "Switzerland",
                    "latitude": 47.3769,
                    "longitude": 8.5417
                }
            ]
        })
        assert create_res.status_code == 201
        trip = create_res.json()
        trip_id = trip["id"]
        assert trip["name"] == "Swiss Alps Tour"
        assert len(trip["stops"]) == 1

        # Get trip
        get_res = await ac.get(f"/api/trips/{trip_id}")
        assert get_res.status_code == 200
        assert get_res.json()["name"] == "Swiss Alps Tour"

        # Update trip
        patch_res = await ac.patch(f"/api/trips/{trip_id}", json={
            "name": "Updated Swiss Alps Tour",
            "budget": 55000.0
        })
        assert patch_res.status_code == 200
        assert patch_res.json()["name"] == "Updated Swiss Alps Tour"

        # List trips
        list_res = await ac.get("/api/trips")
        assert list_res.status_code == 200

        # Delete trip
        del_res = await ac.delete(f"/api/trips/{trip_id}")
        assert del_res.status_code == 204

@pytest.mark.asyncio
async def test_ai_planner_and_save():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Plan trip
        plan_res = await ac.post("/api/ai/plan-trip", json={
            "prompt": "Explore Japan in 6 days",
            "destination": "Japan",
            "duration_days": 6
        })
        assert plan_res.status_code == 200
        plan = plan_res.json()
        assert plan["title"]
        assert len(plan["stops"]) > 0

        # Save AI trip
        save_res = await ac.post("/api/ai/plan-trip/save", json={
            "prompt": "Explore Japan in 6 days",
            "destination": "Japan",
            "duration_days": 6
        })
        assert save_res.status_code == 201
        saved_trip = save_res.json()
        assert saved_trip["name"]
        assert saved_trip["budget"] > 0
        assert len(saved_trip["stops"]) > 0

@pytest.mark.asyncio
async def test_budget_and_sharing():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create trip
        t_res = await ac.post("/api/trips", json={
            "name": "Paris Getaway",
            "budget": 40000.0,
            "currency": "EUR"
        })
        trip_id = t_res.json()["id"]

        # Add expense
        e_res = await ac.post(f"/api/budget/{trip_id}/expenses", json={
            "category": "transportation",
            "title": "Flight ticket",
            "amount": 12000.0,
            "currency": "EUR"
        })
        assert e_res.status_code == 201

        # Get budget breakdown
        b_res = await ac.get(f"/api/budget/{trip_id}")
        assert b_res.status_code == 200
        b_data = b_res.json()
        assert b_data["total_expense"] == 12000.0
        assert b_data["remaining_budget"] == 28000.0
