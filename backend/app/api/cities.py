"""
City discovery endpoints for GlobeTrotter.
GET    /api/cities/search           — Search cities
GET    /api/cities/{id}             — Get city details
POST   /api/cities/{id}/save        — Save as favourite (auth)
DELETE /api/cities/{id}/save        — Remove favourite (auth)

Cities are stored as a static catalogue (no DB table) with full
lat/lng for Mapbox markers. In production, replace with a DB query
or a Places API integration.
"""
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models import SavedDestination, User
from app.schemas.trip import CitySearchResponse, CitySearchResult

logger = logging.getLogger("globetrotter.cities")
router = APIRouter(prefix="/cities", tags=["Cities"])

# ---------------------------------------------------------------------------
# Static city catalogue — latitude/longitude required for Mapbox (Farhan)
# ---------------------------------------------------------------------------
_CITIES: List[CitySearchResult] = [
    CitySearchResult(
        id="tokyo-jp", name="Tokyo", country="Japan", region="Kanto",
        latitude=35.6762, longitude=139.6503,
        cost_index=8.5, popularity_score=95,
        description="Japan's neon-lit capital blending ultramodern skyscrapers with historic temples.",
        cover_image_url="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800",
        popular_places_count=120, image_url="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800",
    ),
    CitySearchResult(
        id="kyoto-jp", name="Kyoto", country="Japan", region="Kansai",
        latitude=35.0116, longitude=135.7681,
        cost_index=7.0, popularity_score=88,
        description="Ancient imperial capital with over 1,600 Buddhist temples and serene bamboo groves.",
        cover_image_url="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800",
        popular_places_count=85, image_url="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800",
    ),
    CitySearchResult(
        id="barcelona-es", name="Barcelona", country="Spain", region="Catalonia",
        latitude=41.3851, longitude=2.1734,
        cost_index=6.5, popularity_score=90,
        description="Vibrant Mediterranean city famed for Gaudí architecture, tapas, and sandy beaches.",
        cover_image_url="https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=800",
        popular_places_count=110, image_url="https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=800",
    ),
    CitySearchResult(
        id="paris-fr", name="Paris", country="France", region="Île-de-France",
        latitude=48.8566, longitude=2.3522,
        cost_index=9.0, popularity_score=98,
        description="The City of Light — Eiffel Tower, world-class cuisine, and timeless art.",
        cover_image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800",
        popular_places_count=150, image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800",
    ),
    CitySearchResult(
        id="goa-in", name="Goa", country="India", region="Goa",
        latitude=15.2993, longitude=74.1240,
        cost_index=3.5, popularity_score=75,
        description="India's smallest state, famous for pristine beaches, seafood, and Portuguese heritage.",
        cover_image_url="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800",
        popular_places_count=65, image_url="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800",
    ),
    CitySearchResult(
        id="amsterdam-nl", name="Amsterdam", country="Netherlands", region="North Holland",
        latitude=52.3676, longitude=4.9041,
        cost_index=8.0, popularity_score=85,
        description="Venice of the North — canal rings, golden-age museums, and vibrant nightlife.",
        cover_image_url="https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=800",
        popular_places_count=95, image_url="https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=800",
    ),
    CitySearchResult(
        id="newyork-us", name="New York", country="United States", region="New York",
        latitude=40.7128, longitude=-74.0060,
        cost_index=9.5, popularity_score=99,
        description="The city that never sleeps — Times Square, Central Park, and world-class dining.",
        cover_image_url="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800",
        popular_places_count=200, image_url="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800",
    ),
    CitySearchResult(
        id="bali-id", name="Bali", country="Indonesia", region="Bali",
        latitude=-8.3405, longitude=115.0920,
        cost_index=3.0, popularity_score=80,
        description="Island of Gods with terraced rice fields, Hindu temples, and world-class surf.",
        cover_image_url="https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
        popular_places_count=78, image_url="https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
    ),
    CitySearchResult(
        id="dubai-ae", name="Dubai", country="UAE", region="Dubai",
        latitude=25.2048, longitude=55.2708,
        cost_index=9.0, popularity_score=92,
        description="Futuristic desert metropolis with the world's tallest buildings and luxury shopping.",
        cover_image_url="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800",
        popular_places_count=130, image_url="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800",
    ),
    CitySearchResult(
        id="singapore-sg", name="Singapore", country="Singapore", region="Central",
        latitude=1.3521, longitude=103.8198,
        cost_index=8.5, popularity_score=87,
        description="Clean, green city-state with incredible food hawker centres and Gardens by the Bay.",
        cover_image_url="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=800",
        popular_places_count=105, image_url="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=800",
    ),
]

_CITY_MAP = {c.id: c for c in _CITIES}


@router.get("/search", response_model=CitySearchResponse)
async def search_cities(
    q: str = Query("", description="Search term for city name or country"),
    country: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
):
    """
    Search the city catalogue.

    Returns paginated results with lat/lng for Mapbox markers.
    """
    results = list(_CITIES)

    if q:
        ql = q.lower().strip()
        results = [c for c in results if ql in c.name.lower() or ql in c.country.lower()]
    if country:
        results = [c for c in results if country.lower() in c.country.lower()]
    if region:
        results = [c for c in results if c.region and region.lower() in c.region.lower()]

    # Dynamic fallback for unknown cities
    if not results and q:
        results = [
            CitySearchResult(
                id=f"{q.lower().replace(' ', '-')}-custom",
                name=q.title(),
                country="Worldwide",
                latitude=20.5937, longitude=78.9629,
                cost_index=5.0, popularity_score=50,
                description=f"Explore {q.title()} — your personalized destination.",
                cover_image_url="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800",
                popular_places_count=30,
            )
        ]

    total = len(results)
    page_results = results[skip: skip + limit]
    return CitySearchResponse(cities=page_results, total=total, page=skip, page_size=limit)


@router.get("/{city_id}", response_model=CitySearchResult)
async def get_city(city_id: str):
    """Get details for a specific city by its slug ID."""
    city = _CITY_MAP.get(city_id)
    if not city:
        raise HTTPException(status_code=404, detail=f"City '{city_id}' not found.")
    return city


@router.post("/{city_id}/save", status_code=status.HTTP_201_CREATED)
async def save_city(
    city_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save a city as a favourite for the current user."""
    if city_id not in _CITY_MAP:
        raise HTTPException(status_code=404, detail=f"City '{city_id}' not found.")

    # Idempotent — check if already saved
    result = await db.execute(
        select(SavedDestination).where(
            SavedDestination.user_id == current_user.id,
            SavedDestination.city_id == city_id,
        )
    )
    if result.scalars().first():
        return {"message": "City already saved.", "city_id": city_id}

    saved = SavedDestination(user_id=current_user.id, city_id=city_id)
    db.add(saved)
    await db.commit()
    return {"message": "City saved successfully.", "city_id": city_id}


@router.delete("/{city_id}/save", status_code=status.HTTP_204_NO_CONTENT)
async def unsave_city(
    city_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a city from the user's favourites."""
    await db.execute(
        delete(SavedDestination).where(
            SavedDestination.user_id == current_user.id,
            SavedDestination.city_id == city_id,
        )
    )
    await db.commit()
    return None
