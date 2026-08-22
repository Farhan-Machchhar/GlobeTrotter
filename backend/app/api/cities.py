from typing import List, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter(prefix="/cities", tags=["Cities"])


class CitySearchResult(BaseModel):
    id: str
    name: str
    country: str
    latitude: float
    longitude: float
    popular_places_count: int
    image_url: str


POPULAR_CITIES = [
    CitySearchResult(
        id="tokyo-jp",
        name="Tokyo",
        country="Japan",
        latitude=35.6762,
        longitude=139.6503,
        popular_places_count=120,
        image_url="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800"
    ),
    CitySearchResult(
        id="kyoto-jp",
        name="Kyoto",
        country="Japan",
        latitude=35.0116,
        longitude=135.7681,
        popular_places_count=85,
        image_url="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800"
    ),
    CitySearchResult(
        id="paris-fr",
        name="Paris",
        country="France",
        latitude=48.8566,
        longitude=2.3522,
        popular_places_count=150,
        image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800"
    ),
    CitySearchResult(
        id="goa-in",
        name="Goa",
        country="India",
        latitude=15.2993,
        longitude=74.1240,
        popular_places_count=65,
        image_url="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800"
    ),
    CitySearchResult(
        id="amsterdam-nl",
        name="Amsterdam",
        country="Netherlands",
        latitude=52.3676,
        longitude=4.9041,
        popular_places_count=95,
        image_url="https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=800"
    ),
    CitySearchResult(
        id="newyork-us",
        name="New York",
        country="United States",
        latitude=40.7128,
        longitude=-74.0060,
        popular_places_count=200,
        image_url="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800"
    ),
]


@router.get("/search", response_model=List[CitySearchResult])
async def search_cities(q: str = Query("", description="Search term for city name or country")):
    if not q:
        return POPULAR_CITIES

    query = q.lower().strip()
    results = [
        c for c in POPULAR_CITIES
        if query in c.name.lower() or query in c.country.lower()
    ]
    if not results:
        # Dynamic fallback match
        results.append(
            CitySearchResult(
                id=f"{query}-custom",
                name=q.capitalize(),
                country="Explore World",
                latitude=48.8566,
                longitude=2.3522,
                popular_places_count=42,
                image_url="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800"
            )
        )
    return results
