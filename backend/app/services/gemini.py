import json
import logging
from typing import Optional
from app.core.config import settings
from app.schemas.trip import PlanTripRequest, AITripPlanResponse, AIStopItem, AIActivityItem, AIBudgetBreakdown

logger = logging.getLogger("globetrotter.gemini")


class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY

    async def generate_trip_plan(self, req: PlanTripRequest) -> AITripPlanResponse:
        """
        Generates a structured AI trip plan using Gemini 2.5/1.5 API.
        Falls back to intelligent mock plan generation if API key is missing or request fails.
        """
        if self.api_key:
            try:
                plan = await self._call_gemini_api(req)
                if plan:
                    return plan
            except Exception as e:
                logger.error(f"Error calling Gemini API: {e}. Falling back to fallback generator.")
        
        return self._generate_fallback_plan(req)

    async def _call_gemini_api(self, req: PlanTripRequest) -> Optional[AITripPlanResponse]:
        import httpx
        
        system_instruction = """You are an expert AI Travel Concierge for GlobeTrotter.
Given a user trip request, generate a detailed multi-city or single-city travel itinerary in strict JSON format.
The output JSON MUST follow this exact schema structure:
{
  "title": "string (e.g. Magical 6-Day Japan Highlights)",
  "description": "string (brief overview)",
  "destination": "string",
  "total_days": integer,
  "estimated_total_cost": float,
  "currency": "INR" or requested currency,
  "cover_image_url": "https://images.unsplash.com/...",
  "stops": [
    {
      "city_name": "string",
      "country": "string",
      "latitude": float,
      "longitude": float,
      "days_count": integer,
      "activities": [
        {
          "title": "string",
          "description": "string",
          "category": "sightseeing" | "food" | "nature" | "culture" | "relaxation" | "nightlife",
          "cost": float,
          "duration_mins": integer,
          "day_number": integer,
          "latitude": float,
          "longitude": float
        }
      ]
    }
  ],
  "budget_breakdown": {
    "accommodation": float,
    "transportation": float,
    "food": float,
    "activities": float,
    "miscellaneous": float
  }
}
Do NOT wrap in markdown markdown code blocks if returning JSON. Return raw valid JSON only."""

        prompt = f"""User Trip Request: "{req.prompt}"
Destination: {req.destination or 'Auto-detect from request'}
Requested Days: {req.duration_days or 5}
Budget: {req.budget or 50000} {req.currency or 'INR'}
Interests: {', '.join(req.interests) if req.interests else 'General exploration'}

Please generate the trip plan in strict JSON."""

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": system_instruction + "\n\n" + prompt}]}
            ],
            "generationConfig": {
                "temperature": 0.7,
                "responseMimeType": "application/json",
            }
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            if res.status_code == 200:
                data = res.json()
                text_content = data['candidates'][0]['content']['parts'][0]['text']
                # Clean markdown if present
                clean_json = text_content.strip()
                if clean_json.startswith("```json"):
                    clean_json = clean_json[7:]
                if clean_json.endswith("```"):
                    clean_json = clean_json[:-3]
                
                parsed_dict = json.loads(clean_json.strip())
                return AITripPlanResponse(**parsed_dict)
            else:
                logger.error(f"Gemini API HTTP Error {res.status_code}: {res.text}")
                return None

    def _generate_fallback_plan(self, req: PlanTripRequest) -> AITripPlanResponse:
        """
        Provides high-quality realistic fallback structured plans for hackathon reliability.
        """
        dest_lower = (req.destination or req.prompt or "japan").lower()

        if "japan" in dest_lower or "tokyo" in dest_lower:
            return AITripPlanResponse(
                title="Grand 6-Day Japan Adventure: Tokyo & Kyoto",
                description="Experience neon-lit skyscrapers, futuristic anime culture, historic temples, and pristine nature.",
                destination="Japan",
                total_days=6,
                estimated_total_cost=58500.0,
                currency=req.currency or "INR",
                cover_image_url="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200",
                stops=[
                    AIStopItem(
                        city_name="Tokyo",
                        country="Japan",
                        latitude=35.6762,
                        longitude=139.6503,
                        days_count=3,
                        activities=[
                            AIActivityItem(
                                title="Explore Akihabara Electric Town",
                                description="Immerse in anime, gaming centers, and tech shops.",
                                category="culture",
                                cost=2500.0,
                                duration_mins=180,
                                day_number=1,
                                latitude=35.6983,
                                longitude=139.7731
                            ),
                            AIActivityItem(
                                title="Senso-ji Temple & Asakusa Food Tour",
                                description="Visit Tokyo's oldest Buddhist temple and taste local street food.",
                                category="food",
                                cost=3000.0,
                                duration_mins=150,
                                day_number=1,
                                latitude=35.7148,
                                longitude=139.7967
                            ),
                            AIActivityItem(
                                title="Shibuya Crossing & Meiji Shrine",
                                description="Walk the world-famous scramble crossing and relax in Meiji Shrine forest.",
                                category="sightseeing",
                                cost=1500.0,
                                duration_mins=120,
                                day_number=2,
                                latitude=35.6595,
                                longitude=139.7005
                            ),
                            AIActivityItem(
                                title="TeamLab Planets Digital Art",
                                description="Mind-bending immersive digital art experience.",
                                category="sightseeing",
                                cost=3200.0,
                                duration_mins=150,
                                day_number=3,
                                latitude=35.6491,
                                longitude=139.7898
                            )
                        ]
                    ),
                    AIStopItem(
                        city_name="Kyoto",
                        country="Japan",
                        latitude=35.0116,
                        longitude=135.7681,
                        days_count=3,
                        activities=[
                            AIActivityItem(
                                title="Fushimi Inari Taisha Torii Gates",
                                description="Hike through thousands of vibrant orange torii gates up Mt. Inari.",
                                category="nature",
                                cost=0.0,
                                duration_mins=180,
                                day_number=4,
                                latitude=34.9671,
                                longitude=135.7727
                            ),
                            AIActivityItem(
                                title="Arashiyama Bamboo Grove & Monkey Park",
                                description="Stroll through towering bamboo stalks and meet wild macaques.",
                                category="nature",
                                cost=1800.0,
                                duration_mins=210,
                                day_number=5,
                                latitude=35.0170,
                                longitude=135.6713
                            ),
                            AIActivityItem(
                                title="Gion District Traditional Kaiseki Dinner",
                                description="Experience authentic Kyoto culinary art in historical geisha quarter.",
                                category="food",
                                cost=6500.0,
                                duration_mins=120,
                                day_number=6,
                                latitude=35.0037,
                                longitude=135.7772
                            )
                        ]
                    )
                ],
                budget_breakdown=AIBudgetBreakdown(
                    accommodation=24000.0,
                    transportation=14000.0,
                    food=12000.0,
                    activities=6000.0,
                    miscellaneous=2500.0
                )
            )
        else:
            # Default multi-city European/Global trip fallback
            return AITripPlanResponse(
                title=f"Custom {req.duration_days or 5}-Day {req.destination or 'Multi-City'} Expedition",
                description=f"Personalized itinerary curated for {req.prompt}",
                destination=req.destination or "Paris & Amsterdam",
                total_days=req.duration_days or 5,
                estimated_total_cost=req.budget or 60000.0,
                currency=req.currency or "INR",
                cover_image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200",
                stops=[
                    AIStopItem(
                        city_name="Paris",
                        country="France",
                        latitude=48.8566,
                        longitude=2.3522,
                        days_count=3,
                        activities=[
                            AIActivityItem(
                                title="Eiffel Tower Sunset & Seine Cruise",
                                description="Iconic views of Paris followed by an evening river cruise.",
                                category="sightseeing",
                                cost=4500.0,
                                duration_mins=180,
                                day_number=1,
                                latitude=48.8584,
                                longitude=2.2945
                            ),
                            AIActivityItem(
                                title="Louvre Museum Masterpieces Tour",
                                description="Discover Mona Lisa, Venus de Milo and royal art galleries.",
                                category="culture",
                                cost=2200.0,
                                duration_mins=240,
                                day_number=2,
                                latitude=48.8606,
                                longitude=2.3376
                            )
                        ]
                    ),
                    AIStopItem(
                        city_name="Amsterdam",
                        country="Netherlands",
                        latitude=52.3676,
                        longitude=4.9041,
                        days_count=2,
                        activities=[
                            AIActivityItem(
                                title="Canal Bike Tour & Jordaan District",
                                description="Explore scenic canals and boutique cafes by bicycle.",
                                category="relaxation",
                                cost=1800.0,
                                duration_mins=150,
                                day_number=3,
                                latitude=52.3731,
                                longitude=4.8832
                            ),
                            AIActivityItem(
                                title="Rijksmuseum & Van Gogh Museum",
                                description="World-class Dutch Golden Age art collections.",
                                category="culture",
                                cost=3500.0,
                                duration_mins=210,
                                day_number=4,
                                latitude=52.3600,
                                longitude=4.8852
                            )
                        ]
                    )
                ],
                budget_breakdown=AIBudgetBreakdown(
                    accommodation=25000.0,
                    transportation=18000.0,
                    food=11000.0,
                    activities=4500.0,
                    miscellaneous=1500.0
                )
            )


gemini_service = GeminiService()
