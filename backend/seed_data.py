"""
GlobeTrotter — Seed Data Script
================================
Populates the database with sample cities (as Trips+Stops) and activities
so Kavya (frontend) and Farhan (Mapbox) can test immediately.

Run after migrations:
    python seed_data.py

Safe to run multiple times — idempotent.
"""
import asyncio
import logging
import sys
import os

# Ensure the backend package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select

from app.core.security import hash_password
from app.database.session import AsyncSessionLocal, Base, engine
from app.models import Activity, Expense, Stop, Trip, User

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("seed")

# ---------------------------------------------------------------------------
# Seed data definitions
# ---------------------------------------------------------------------------

SAMPLE_USER = {
    "email": "explorer@globetrotter.io",
    "username": "globetrotter",
    "password": "Demo1234!",
    "first_name": "Globe",
    "last_name": "Trotter",
    "full_name": "Globe Trotter",
}

SAMPLE_TRIPS = [
    {
        "name": "6-Day Japan Adventure",
        "description": "Epic journey through Tokyo anime culture, Kyoto temples, and natural wonders.",
        "destination": "Japan",
        "start_date": "2025-03-01",
        "end_date": "2025-03-07",
        "duration_days": 6,
        "budget": 60000.0,
        "currency": "INR",
        "cover_photo_url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200",
        "status": "planning",
        "is_public": True,
        "share_slug": "japan-demo-2025",
        "stops": [
            {
                "city_name": "Tokyo",
                "country": "Japan",
                "latitude": 35.6762,
                "longitude": 139.6503,
                "arrival_date": "2025-03-01",
                "departure_date": "2025-03-04",
                "notes": "3 days in Tokyo — anime, food, and culture.",
                "order_index": 0,
                "activities": [
                    {
                        "title": "Akihabara Electric & Anime Town",
                        "description": "Explore multi-story anime shops, retro gaming centers, and maid cafés.",
                        "category": "culture",
                        "cost": 2500.0,
                        "duration_mins": 180,
                        "rating": 4.7,
                        "day_number": 1,
                        "order_index": 0,
                        "latitude": 35.6983,
                        "longitude": 139.7731,
                        "image_url": "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=800",
                    },
                    {
                        "title": "Senso-ji Temple & Asakusa Street Food",
                        "description": "Tokyo's oldest Buddhist temple and traditional street food.",
                        "category": "food",
                        "cost": 3000.0,
                        "duration_mins": 150,
                        "rating": 4.9,
                        "day_number": 1,
                        "order_index": 1,
                        "latitude": 35.7148,
                        "longitude": 139.7967,
                        "image_url": "https://images.unsplash.com/photo-1583416750470-965b2707b355?q=80&w=800",
                    },
                    {
                        "title": "TeamLab Planets Digital Art Museum",
                        "description": "Mind-bending immersive digital art experience.",
                        "category": "sightseeing",
                        "cost": 3200.0,
                        "duration_mins": 150,
                        "rating": 4.8,
                        "day_number": 2,
                        "order_index": 0,
                        "latitude": 35.6491,
                        "longitude": 139.7898,
                        "image_url": "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800",
                    },
                ],
            },
            {
                "city_name": "Kyoto",
                "country": "Japan",
                "latitude": 35.0116,
                "longitude": 135.7681,
                "arrival_date": "2025-03-04",
                "departure_date": "2025-03-07",
                "notes": "3 days in Kyoto — temples, bamboo, and kaiseki.",
                "order_index": 1,
                "activities": [
                    {
                        "title": "Fushimi Inari Torii Gate Hike",
                        "description": "Hike through 10,000 vermilion torii gates up Mt. Inari.",
                        "category": "nature",
                        "cost": 0.0,
                        "duration_mins": 180,
                        "rating": 4.9,
                        "day_number": 4,
                        "order_index": 0,
                        "latitude": 34.9671,
                        "longitude": 135.7727,
                        "image_url": "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?q=80&w=800",
                    },
                    {
                        "title": "Arashiyama Bamboo Forest & River Cruise",
                        "description": "Towering bamboo pathways and Hozu river boat ride.",
                        "category": "nature",
                        "cost": 1800.0,
                        "duration_mins": 210,
                        "rating": 4.8,
                        "day_number": 5,
                        "order_index": 0,
                        "latitude": 35.0170,
                        "longitude": 135.6713,
                        "image_url": "https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=800",
                    },
                    {
                        "title": "Gion District Kaiseki Dinner",
                        "description": "Authentic multi-course Kyoto cuisine in the historic geisha quarter.",
                        "category": "food",
                        "cost": 6500.0,
                        "duration_mins": 120,
                        "rating": 4.9,
                        "day_number": 6,
                        "order_index": 0,
                        "latitude": 35.0037,
                        "longitude": 135.7772,
                        "image_url": "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?q=80&w=800",
                    },
                ],
            },
        ],
        "expenses": [
            {"title": "Return Flights", "category": "transport", "amount": 14000.0, "currency": "INR"},
            {"title": "Hotel Tokyo 3 nights", "category": "accommodation", "amount": 12000.0, "currency": "INR"},
            {"title": "Hotel Kyoto 3 nights", "category": "accommodation", "amount": 9000.0, "currency": "INR"},
        ],
    },
    {
        "name": "Barcelona Long Weekend",
        "description": "Gaudí architecture, tapas, and Mediterranean beaches.",
        "destination": "Barcelona, Spain",
        "start_date": "2025-05-10",
        "end_date": "2025-05-13",
        "duration_days": 3,
        "budget": 45000.0,
        "currency": "INR",
        "cover_photo_url": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=1200",
        "status": "confirmed",
        "is_public": True,
        "share_slug": "barcelona-demo-2025",
        "stops": [
            {
                "city_name": "Barcelona",
                "country": "Spain",
                "latitude": 41.3851,
                "longitude": 2.1734,
                "arrival_date": "2025-05-10",
                "departure_date": "2025-05-13",
                "notes": "3 days in Barcelona.",
                "order_index": 0,
                "activities": [
                    {
                        "title": "Sagrada Família Guided Tour",
                        "description": "Gaudí's masterpiece with detailed façade carvings and stunning light inside.",
                        "category": "culture",
                        "cost": 3500.0,
                        "duration_mins": 120,
                        "rating": 4.9,
                        "day_number": 1,
                        "order_index": 0,
                        "latitude": 41.4036,
                        "longitude": 2.1744,
                        "image_url": "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=800",
                    },
                    {
                        "title": "La Boqueria Market Food Tour",
                        "description": "Fresh seafood, jamón ibérico, and tropical fruits at Barcelona's iconic market.",
                        "category": "food",
                        "cost": 1500.0,
                        "duration_mins": 90,
                        "rating": 4.7,
                        "day_number": 2,
                        "order_index": 0,
                        "latitude": 41.3817,
                        "longitude": 2.1720,
                        "image_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800",
                    },
                    {
                        "title": "Park Güell & Gracia Neighbourhood",
                        "description": "Colourful mosaic terraces, dragon staircase, and bohemian Gracia streets.",
                        "category": "sightseeing",
                        "cost": 1000.0,
                        "duration_mins": 150,
                        "rating": 4.6,
                        "day_number": 3,
                        "order_index": 0,
                        "latitude": 41.4145,
                        "longitude": 2.1527,
                        "image_url": "https://images.unsplash.com/photo-1591802405520-b0f2f40a9bd5?q=80&w=800",
                    },
                ],
            },
        ],
        "expenses": [
            {"title": "Flights", "category": "transport", "amount": 18000.0, "currency": "INR"},
            {"title": "Hotel 3 nights", "category": "accommodation", "amount": 12000.0, "currency": "INR"},
        ],
    },
]


# ---------------------------------------------------------------------------
# Seeder logic
# ---------------------------------------------------------------------------

async def seed():
    """Run the full seed sequence."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # --- User ---
        user_result = await db.execute(select(User).where(User.email == SAMPLE_USER["email"]))
        user = user_result.scalars().first()
        if not user:
            user = User(
                email=SAMPLE_USER["email"],
                username=SAMPLE_USER["username"],
                hashed_password=hash_password(SAMPLE_USER["password"]),
                first_name=SAMPLE_USER["first_name"],
                last_name=SAMPLE_USER["last_name"],
                full_name=SAMPLE_USER["full_name"],
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            await db.flush()
            logger.info(f"✅ Created user: {user.email}")
        else:
            logger.info(f"⏭  User already exists: {user.email}")

        # --- Trips ---
        for trip_data in SAMPLE_TRIPS:
            trip_result = await db.execute(select(Trip).where(Trip.share_slug == trip_data["share_slug"]))
            if trip_result.scalars().first():
                logger.info(f"⏭  Trip already exists: {trip_data['name']}")
                continue

            trip = Trip(
                user_id=user.id,
                name=trip_data["name"],
                title=trip_data["name"],
                description=trip_data["description"],
                destination=trip_data["destination"],
                start_date=trip_data["start_date"],
                end_date=trip_data["end_date"],
                duration_days=trip_data["duration_days"],
                budget=trip_data["budget"],
                total_budget=trip_data["budget"],
                currency=trip_data["currency"],
                cover_photo_url=trip_data["cover_photo_url"],
                cover_image_url=trip_data["cover_photo_url"],
                status=trip_data["status"],
                is_public=trip_data["is_public"],
                share_slug=trip_data["share_slug"],
            )
            db.add(trip)
            await db.flush()

            # Stops & Activities
            for stop_data in trip_data["stops"]:
                stop = Stop(
                    trip_id=trip.id,
                    city_name=stop_data["city_name"],
                    country=stop_data["country"],
                    latitude=stop_data["latitude"],
                    longitude=stop_data["longitude"],
                    arrival_date=stop_data["arrival_date"],
                    departure_date=stop_data["departure_date"],
                    notes=stop_data["notes"],
                    order_index=stop_data["order_index"],
                )
                db.add(stop)
                await db.flush()

                for act_data in stop_data["activities"]:
                    activity = Activity(
                        stop_id=stop.id,
                        title=act_data["title"],
                        name=act_data["title"],
                        description=act_data["description"],
                        category=act_data["category"],
                        activity_type=act_data["category"],
                        cost=act_data["cost"],
                        duration_mins=act_data["duration_mins"],
                        rating=act_data.get("rating"),
                        day_number=act_data["day_number"],
                        order_index=act_data["order_index"],
                        latitude=act_data["latitude"],
                        longitude=act_data["longitude"],
                        image_url=act_data.get("image_url"),
                    )
                    db.add(activity)

            # Expenses
            for exp_data in trip_data.get("expenses", []):
                expense = Expense(
                    trip_id=trip.id,
                    title=exp_data["title"],
                    category=exp_data["category"],
                    amount=exp_data["amount"],
                    currency=exp_data["currency"],
                )
                db.add(expense)

            await db.commit()
            logger.info(f"✅ Created trip: {trip_data['name']}")

    logger.info("\n🌍 Seed complete! Ready for Kavya and Farhan.")
    logger.info(f"   Demo user: {SAMPLE_USER['email']} / {SAMPLE_USER['password']}")
    logger.info("   Trips: Japan Adventure, Barcelona Long Weekend")
    logger.info("   Server: http://localhost:8000/docs\n")


if __name__ == "__main__":
    asyncio.run(seed())
