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
    CitySearchResult(
        id="london-uk", name="London", country="United Kingdom", region="Greater London",
        latitude=51.5074, longitude=-0.1278,
        cost_index=9.0, popularity_score=97,
        description="Historic capital with royal palaces, West End theatre, and iconic red double-decker buses.",
        cover_image_url="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800",
        popular_places_count=180, image_url="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800",
    ),
    CitySearchResult(
        id="rome-it", name="Rome", country="Italy", region="Lazio",
        latitude=41.9028, longitude=12.4964,
        cost_index=7.5, popularity_score=94,
        description="The Eternal City featuring the Colosseum, Vatican Museums, and authentic Italian gelato.",
        cover_image_url="https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800",
        popular_places_count=140, image_url="https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800",
    ),
    CitySearchResult(
        id="bangkok-th", name="Bangkok", country="Thailand", region="Central",
        latitude=13.7563, longitude=100.5018,
        cost_index=3.0, popularity_score=89,
        description="Ornate shrines, vibrant street life, floating markets, and famous tuk-tuks.",
        cover_image_url="https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=800",
        popular_places_count=115, image_url="https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=800",
    ),
    CitySearchResult(
        id="sydney-au", name="Sydney", country="Australia", region="New South Wales",
        latitude=-33.8688, longitude=151.2093,
        cost_index=8.5, popularity_score=91,
        description="Harbourside capital with Bondi Beach surfing and the architectural marvel Sydney Opera House.",
        cover_image_url="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800",
        popular_places_count=125, image_url="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800",
    ),
    CitySearchResult(
        id="seoul-kr", name="Seoul", country="South Korea", region="Capital Region",
        latitude=37.5665, longitude=126.9780,
        cost_index=7.0, popularity_score=86,
        description="Dynamic metropolis with K-pop culture, royal palaces, and round-the-clock night markets.",
        cover_image_url="https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=800",
        popular_places_count=100, image_url="https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=800",
    ),
    CitySearchResult(
        id="mumbai-in", name="Mumbai", country="India", region="Maharashtra",
        latitude=19.0760, longitude=72.8777,
        cost_index=4.0, popularity_score=82,
        description="City of Dreams — Gateway of India, Bollywood cinema, and Marine Drive sea views.",
        cover_image_url="https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800",
        popular_places_count=90, image_url="https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800",
    ),
    CitySearchResult(
        id="prague-cz", name="Prague", country="Czech Republic", region="Bohemia",
        latitude=50.0755, longitude=14.4378,
        cost_index=5.5, popularity_score=84,
        description="City of a Hundred Spires — fairytale Charles Bridge and gothic Prague Castle.",
        cover_image_url="https://images.unsplash.com/photo-1541849546-216549ae216d?q=80&w=800",
        popular_places_count=80, image_url="https://images.unsplash.com/photo-1541849546-216549ae216d?q=80&w=800",
    ),
    CitySearchResult(
        id="cairo-eg", name="Cairo", country="Egypt", region="Greater Cairo",
        latitude=30.0444, longitude=31.2357,
        cost_index=3.0, popularity_score=78,
        description="Gateway to the Giza Pyramids, Khan el-Khalili bazaar, and the mighty Nile River.",
        cover_image_url="https://images.unsplash.com/photo-1572252821143-0259e2b10086?q=80&w=800",
        popular_places_count=70, image_url="https://images.unsplash.com/photo-1572252821143-0259e2b10086?q=80&w=800",
    ),
    CitySearchResult(
        id="berlin-de", name="Berlin", country="Germany", region="Berlin",
        latitude=52.5200, longitude=13.4050,
        cost_index=7.0, popularity_score=88,
        description="Vibrant creative hub renowned for its history, Brandenburg Gate, and legendary techno clubs.",
        cover_image_url="https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=800",
        popular_places_count=100, image_url="https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=800",
    ),
    CitySearchResult(
        id="venice-it", name="Venice", country="Italy", region="Veneto",
        latitude=45.4408, longitude=12.3155,
        cost_index=8.5, popularity_score=93,
        description="Romantic city built on canals with gondola rides, St. Mark's Basilica, and Rialto Bridge.",
        cover_image_url="https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=800",
        popular_places_count=105, image_url="https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=800",
    ),
    CitySearchResult(
        id="vienna-at", name="Vienna", country="Austria", region="Vienna",
        latitude=48.2082, longitude=16.3738,
        cost_index=7.5, popularity_score=87,
        description="Imperial capital of classical music, Schönbrunn Palace, and opulent Viennese coffee houses.",
        cover_image_url="https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=800",
        popular_places_count=95, image_url="https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=800",
    ),
    CitySearchResult(
        id="madrid-es", name="Madrid", country="Spain", region="Madrid",
        latitude=40.4168, longitude=-3.7038,
        cost_index=6.5, popularity_score=89,
        description="Spain's energetic capital with Prado Museum, Royal Palace, and lively tapas plazas.",
        cover_image_url="https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=800",
        popular_places_count=110, image_url="https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=800",
    ),
    CitySearchResult(
        id="lisbon-pt", name="Lisbon", country="Portugal", region="Lisbon",
        latitude=38.7223, longitude=-9.1393,
        cost_index=5.5, popularity_score=88,
        description="Sun-drenched coastal capital with yellow trams, pastel buildings, and pastéis de nata.",
        cover_image_url="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800",
        popular_places_count=85, image_url="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800",
    ),
    CitySearchResult(
        id="athens-gr", name="Athens", country="Greece", region="Attica",
        latitude=37.9838, longitude=23.7275,
        cost_index=5.0, popularity_score=86,
        description="Cradle of Western civilization featuring the ancient Acropolis and Parthenon temple.",
        cover_image_url="https://images.unsplash.com/photo-1555993539-1732b0258235?q=80&w=800",
        popular_places_count=90, image_url="https://images.unsplash.com/photo-1555993539-1732b0258235?q=80&w=800",
    ),
    CitySearchResult(
        id="reykjavik-is", name="Reykjavik", country="Iceland", region="Capital Region",
        latitude=64.1466, longitude=-21.9426,
        cost_index=9.5, popularity_score=85,
        description="Northern lights gateway surrounded by geothermal lagoons, glaciers, and volcanic landscapes.",
        cover_image_url="https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=800",
        popular_places_count=60, image_url="https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=800",
    ),
    CitySearchResult(
        id="istanbul-tr", name="Istanbul", country="Turkey", region="Marmara",
        latitude=41.0082, longitude=28.9784,
        cost_index=4.0, popularity_score=92,
        description="Where East meets West across the Bosphorus — Hagia Sophia, Blue Mosque, and Grand Bazaar.",
        cover_image_url="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800",
        popular_places_count=135, image_url="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800",
    ),
    CitySearchResult(
        id="sanfrancisco-us", name="San Francisco", country="United States", region="California",
        latitude=37.7749, longitude=-122.4194,
        cost_index=9.0, popularity_score=90,
        description="Golden Gate Bridge, historic cable cars, Fisherman's Wharf, and Alcatraz Island.",
        cover_image_url="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=800",
        popular_places_count=115, image_url="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=800",
    ),
    CitySearchResult(
        id="losangeles-us", name="Los Angeles", country="United States", region="California",
        latitude=34.0522, longitude=-118.2437,
        cost_index=8.5, popularity_score=94,
        description="Entertainment capital with Hollywood Sign, Venice Beach boardwalk, and Santa Monica Pier.",
        cover_image_url="https://images.unsplash.com/photo-1580655653885-65763b2597d0?q=80&w=800",
        popular_places_count=150, image_url="https://images.unsplash.com/photo-1580655653885-65763b2597d0?q=80&w=800",
    ),
    CitySearchResult(
        id="toronto-ca", name="Toronto", country="Canada", region="Ontario",
        latitude=43.6532, longitude=-79.3832,
        cost_index=7.5, popularity_score=85,
        description="Multicultural metropolis featuring the CN Tower, Lake Ontario waterfront, and vibrant districts.",
        cover_image_url="https://images.unsplash.com/photo-1517935706615-2717063c2225?q=80&w=800",
        popular_places_count=95, image_url="https://images.unsplash.com/photo-1517935706615-2717063c2225?q=80&w=800",
    ),
    CitySearchResult(
        id="vancouver-ca", name="Vancouver", country="Canada", region="British Columbia",
        latitude=49.2827, longitude=-123.1207,
        cost_index=8.0, popularity_score=88,
        description="Ocean-meets-mountain city with Stanley Park seawall, mountain skiing, and Asian dining.",
        cover_image_url="https://images.unsplash.com/photo-1559511260-66a654ae982a?q=80&w=800",
        popular_places_count=90, image_url="https://images.unsplash.com/photo-1559511260-66a654ae982a?q=80&w=800",
    ),
    CitySearchResult(
        id="mexicocity-mx", name="Mexico City", country="Mexico", region="CDMX",
        latitude=19.4326, longitude=-99.1332,
        cost_index=4.0, popularity_score=86,
        description="High-altitude capital bursting with Aztec history, Frida Kahlo art, and street tacos.",
        cover_image_url="https://images.unsplash.com/photo-1518659267384-78f4b73b53f6?q=80&w=800",
        popular_places_count=110, image_url="https://images.unsplash.com/photo-1518659267384-78f4b73b53f6?q=80&w=800",
    ),
    CitySearchResult(
        id="rio-br", name="Rio de Janeiro", country="Brazil", region="Rio de Janeiro",
        latitude=-22.9068, longitude=-43.1729,
        cost_index=4.5, popularity_score=91,
        description="Christ the Redeemer statue overlooking Copacabana beach and Sugarloaf Mountain.",
        cover_image_url="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=800",
        popular_places_count=100, image_url="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=800",
    ),
    CitySearchResult(
        id="buenosaires-ar", name="Buenos Aires", country="Argentina", region="Capital Federal",
        latitude=-34.6037, longitude=-58.3816,
        cost_index=3.5, popularity_score=85,
        description="Paris of South America — tango dancing, steakhouse asados, and colorful La Boca.",
        cover_image_url="https://images.unsplash.com/photo-1589909202802-8f4aadce1849?q=80&w=800",
        popular_places_count=85, image_url="https://images.unsplash.com/photo-1589909202802-8f4aadce1849?q=80&w=800",
    ),
    CitySearchResult(
        id="osaka-jp", name="Osaka", country="Japan", region="Kansai",
        latitude=34.6937, longitude=135.5023,
        cost_index=6.5, popularity_score=87,
        description="Japan's street food capital — Dotonbori neon signs, takoyaki, and Osaka Castle.",
        cover_image_url="https://images.unsplash.com/photo-1590559899731-a382839e5549?q=80&w=800",
        popular_places_count=90, image_url="https://images.unsplash.com/photo-1590559899731-a382839e5549?q=80&w=800",
    ),
    CitySearchResult(
        id="capetown-za", name="Cape Town", country="South Africa", region="Western Cape",
        latitude=-33.9249, longitude=18.4241,
        cost_index=4.5, popularity_score=89,
        description="Table Mountain backdrop, Cape Point ocean views, penguins at Boulders Beach, and wineries.",
        cover_image_url="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=800",
        popular_places_count=95, image_url="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=800",
    ),
    CitySearchResult(
        id="marrakech-ma", name="Marrakech", country="Morocco", region="Marrakech-Safi",
        latitude=31.6295, longitude=-7.9811,
        cost_index=3.5, popularity_score=84,
        description="Enchanting red city with bustling Medina souks, Jemaa el-Fnaa square, and tranquil riads.",
        cover_image_url="https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=800",
    ),
]

_CITY_MAP = {c.id: c for c in _CITIES}


@router.get("/search", response_model=CitySearchResponse)
async def search_cities(
    q: str = Query("", description="Search term for city name or country"),
    country: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
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

    # Dynamic fallback for unknown cities using Nominatim
    if not results and q:
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                res = await client.get(
                    "https://nominatim.openstreetmap.org/search",
                    params={"q": q, "format": "json", "limit": 5, "featuretype": "city"},
                    headers={"User-Agent": "GlobeTrotter/1.0"}
                )
                if res.status_code == 200:
                    data = res.json()
                    results = []
                    for item in data:
                        display_name = item.get("display_name", "")
                        parts = display_name.split(", ")
                        city_name = parts[0]
                        country_name = parts[-1] if len(parts) > 1 else "Worldwide"
                        results.append(
                            CitySearchResult(
                                id=f"custom-{item.get('place_id')}",
                                name=city_name,
                                country=country_name,
                                latitude=float(item.get("lat")),
                                longitude=float(item.get("lon")),
                                cost_index=3.0,
                                popularity_score=50,
                                description=f"Explore {city_name} — dynamically added city.",
                                cover_image_url="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800",
                                popular_places_count=10,
                            )
                        )
        except Exception as e:
            print(f"Nominatim error: {e}")
        
        # If still no results, return generic fallback
        if not results:
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


@router.get("/saved/me", response_model=List[CitySearchResult])
async def get_my_saved_cities(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all favourite cities saved by the current user."""
    result = await db.execute(
        select(SavedDestination).where(SavedDestination.user_id == current_user.id)
    )
    saved_entries = result.scalars().all()
    city_ids = [s.city_id for s in saved_entries]
    return [_CITY_MAP[cid] for cid in city_ids if cid in _CITY_MAP]

