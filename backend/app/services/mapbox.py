import logging
from typing import Optional, Dict, Any, List
import httpx
from app.core.config import settings

logger = logging.getLogger("globetrotter.mapbox")


class MapboxService:
    """
    Mapbox Service proxy for Geocoding and Directions matrix API.
    Provides backend API key security and static fallback when token is missing.
    """
    def __init__(self):
        pass

    @property
    def token(self) -> Optional[str]:
        tok = settings.MAPBOX_TOKEN
        if tok and not tok.startswith("your_") and len(tok) > 10:
            return tok
        return None

    async def geocode_city(self, city_name: str) -> Dict[str, Any]:
        """Geocode a city name into latitude and longitude coordinates."""
        tok = self.token
        if tok:
            try:
                url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{httpx.URL.quote(city_name)}.json"
                params = {"access_token": tok, "types": "place,region", "limit": 1}
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.get(url, params=params)
                    if res.status_code == 200:
                        data = res.json()
                        features = data.get("features", [])
                        if features:
                            center = features[0].get("center", [0.0, 0.0])
                            return {
                                "city_name": city_name,
                                "longitude": center[0],
                                "latitude": center[1],
                                "place_name": features[0].get("place_name", city_name)
                            }
            except Exception as e:
                logger.error(f"Mapbox geocoding error for {city_name}: {e}")

        # Fallback coordinates mapping
        defaults = {
            "tokyo": {"latitude": 35.6762, "longitude": 139.6503},
            "kyoto": {"latitude": 35.0116, "longitude": 135.7681},
            "paris": {"latitude": 48.8566, "longitude": 2.3522},
            "london": {"latitude": 51.5074, "longitude": -0.1278},
            "goa": {"latitude": 15.2993, "longitude": 74.1240},
            "bali": {"latitude": -8.3405, "longitude": 115.0920},
            "dubai": {"latitude": 25.2048, "longitude": 55.2708},
            "new york": {"latitude": 40.7128, "longitude": -74.0060},
        }
        key = city_name.lower().strip()
        coords = defaults.get(key, {"latitude": 20.5937, "longitude": 78.9629})
        return {
            "city_name": city_name,
            "latitude": coords["latitude"],
            "longitude": coords["longitude"],
            "place_name": city_name.title()
        }

    async def get_directions(self, coordinates: List[List[float]]) -> Dict[str, Any]:
        """
        Get route polyline and duration for a sequence of [lng, lat] coordinates.
        """
        tok = self.token
        if tok and len(coordinates) >= 2:
            try:
                coords_str = ";".join([f"{c[0]},{c[1]}" for c in coordinates])
                url = f"https://api.mapbox.com/directions/v5/mapbox/driving/{coords_str}"
                params = {"access_token": tok, "overview": "full", "geometries": "geojson"}
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.get(url, params=params)
                    if res.status_code == 200:
                        return res.json()
            except Exception as e:
                logger.error(f"Mapbox directions error: {e}")

        # Fallback simple line geometry
        return {
            "routes": [
                {
                    "distance": 15000.0,
                    "duration": 1800.0,
                    "geometry": {
                        "type": "LineString",
                        "coordinates": coordinates
                    }
                }
            ]
        }


mapbox_service = MapboxService()
