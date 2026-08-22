import re
import os

filepath = r"d:\GlobeTrotter\backend\app\api\cities.py"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Make sure httpx is imported
if "import httpx" not in content:
    content = "import httpx\n" + content

# Replace search_cities with a version that queries Nominatim
new_search_cities = """@router.get("/search", response_model=CitySearchResponse)
async def search_cities(
    q: str = Query("", description="Search term for city name or country"),
    country: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    \"\"\"
    Search the city catalogue.
    Returns paginated results with lat/lng for Mapbox markers.
    \"\"\"
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

@router.get("/{city_id}", response_model=CitySearchResult)"""

content = re.sub(
    r"@router\.get\(\"/search\", response_model=CitySearchResponse\).*?@router\.get\(\"/\{city_id\}\", response_model=CitySearchResult\)",
    new_search_cities,
    content,
    flags=re.DOTALL
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
