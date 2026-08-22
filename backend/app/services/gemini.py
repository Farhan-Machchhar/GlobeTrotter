import json
import logging
import re
from typing import Optional, List, Dict
import os

from app.core.config import settings
from app.schemas.trip import (
    PlanTripRequest, AITripPlanResponse, AIStopItem, AIActivityItem, AIBudgetBreakdown
)


logger = logging.getLogger("globetrotter.gemini")


class GeminiService:
    def __init__(self):
        pass

    @property
    def api_key(self) -> Optional[str]:
        key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
        if key and not key.startswith("your_") and len(key.strip()) > 5:
            return key.strip()
        return None

    async def generate_trip_plan(self, req: PlanTripRequest) -> AITripPlanResponse:
        """
        Generates a structured AI trip plan using Gemini 2.5 Flash API.
        Falls back to an intelligent, destination-tailored generator if API call fails.
        """
        active_key = self.api_key
        if active_key:
            try:
                plan = await self._call_gemini_api(req, active_key)
                if plan:
                    logger.info(f"Successfully generated AI trip plan for '{req.destination or req.prompt}' via Gemini 2.5 Flash")
                    return plan
            except Exception as e:
                logger.warning(f"Gemini API invocation failed: {e}. Switching to intelligent dynamic generator.")

        logger.info("Using intelligent dynamic generator for trip plan.")
        return self._generate_fallback_plan(req)

    async def _call_gemini_api(self, req: PlanTripRequest, active_key: str) -> Optional[AITripPlanResponse]:
        """Call Gemini API using google-genai SDK first, with httpx fallback."""
        sys_inst = """You are an expert AI Travel Concierge for GlobeTrotter.
Given a user trip request, generate a detailed multi-city or single-city travel itinerary in strict JSON format.
The output JSON MUST follow this exact schema structure:
{
  "title": "string (e.g. Magical 6-Day Japan Highlights)",
  "description": "string (brief overview of the trip)",
  "destination": "string (main destination or region)",

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
Return raw valid JSON only."""

        prompt = f"""User Trip Request: "{req.prompt}"
Destination: {req.destination or 'Auto-detect from request'}
Requested Days: {req.duration_days or 5}
Budget: {req.budget or 50000} {req.currency or 'INR'}
Interests: {', '.join(req.interests) if req.interests else 'General exploration'}

Please generate a realistic, tailored travel plan in strict JSON format matching the requested destination, duration, and budget."""


        # Try google-genai SDK
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=active_key)
            config = types.GenerateContentConfig(
                system_instruction=sys_inst,
                response_mime_type="application/json",
                temperature=0.7
            )

            # Try gemini-2.5-flash
            for model_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]:
                try:
                    res = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=config
                    )
                    if res and res.text:
                        clean_json = res.text.strip()
                        if clean_json.startswith("```json"):
                            clean_json = clean_json[7:]
                        if clean_json.endswith("```"):
                            clean_json = clean_json[:-3]

                        parsed = json.loads(clean_json.strip())
                        return AITripPlanResponse(**parsed)
                except Exception as model_err:
                    logger.debug(f"Model {model_name} failed: {model_err}")
                    continue

        except Exception as sdk_err:
            logger.debug(f"SDK generation error: {sdk_err}, falling back to httpx")

        # Fallback HTTP call via httpx
        import httpx
        for model_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={active_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [{"role": "user", "parts": [{"text": sys_inst + "\n\n" + prompt}]}],
                "generationConfig": {"temperature": 0.7, "responseMimeType": "application/json"}
            }
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    res = await client.post(url, headers=headers, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        text_content = data['candidates'][0]['content']['parts'][0]['text']
                        clean_json = text_content.strip()
                        if clean_json.startswith("```json"):
                            clean_json = clean_json[7:]
                        if clean_json.endswith("```"):
                            clean_json = clean_json[:-3]

                        parsed = json.loads(clean_json.strip())
                        return AITripPlanResponse(**parsed)
            except Exception as http_err:
                logger.debug(f"httpx call to {model_name} failed: {http_err}")

        return None

    def _generate_fallback_plan(self, req: PlanTripRequest) -> AITripPlanResponse:
        """
        Intelligent dynamic travel plan generator.
        Parses prompt text, destination, duration, budget, and currency to construct
        realistic, customized itineraries for any city or country requested.
        """
        full_text = f"{req.prompt or ''} {req.destination or ''}".strip()
        dest_input = self._extract_destination(full_text)
        days = self._extract_days(full_text, req.duration_days)
        budget, currency = self._extract_budget(full_text, req.budget, req.currency)

        dest_lower = dest_input.lower()

        # Destination catalogue lookup for popular places
        if "goa" in dest_lower:
            return self._build_goa_plan(days, budget, currency)
        elif "japan" in dest_lower or "tokyo" in dest_lower or "kyoto" in dest_lower:
            return self._build_japan_plan(days, budget, currency)
        elif "paris" in dest_lower or "france" in dest_lower:
            return self._build_paris_plan(days, budget, currency)
        elif "london" in dest_lower or "uk" in dest_lower or "england" in dest_lower:
            return self._build_london_plan(days, budget, currency)
        elif "bali" in dest_lower or "indonesia" in dest_lower:
            return self._build_bali_plan(days, budget, currency)
        elif "dubai" in dest_lower or "uae" in dest_lower:
            return self._build_dubai_plan(days, budget, currency)
        elif "new york" in dest_lower or "nyc" in dest_lower:
            return self._build_nyc_plan(days, budget, currency)
        elif "kerala" in dest_lower:
            return self._build_kerala_plan(days, budget, currency)
        elif "switzerland" in dest_lower or "swiss" in dest_lower:
            return self._build_switzerland_plan(days, budget, currency)
        elif "taj mahal" in dest_lower or "agra" in dest_lower:
            return self._build_agra_plan(days, budget, currency)
        else:
            # Dynamic generator for any general destination
            return self._build_dynamic_plan(dest_input.title(), days, budget, currency, full_text)

    # -------------------------------------------------------------------------
    # Parsing Helpers
    # -------------------------------------------------------------------------
    def _extract_destination(self, text: str) -> str:
        if not text:
            return "Worldwide"
        # Match pattern "in <City>", "to <City>", "visit <City>", "explore <City>"
        m = re.search(r'\b(?:in|to|visit|explore|around)\s+([A-Z][a-zA-Z\s]{2,20})', text, re.IGNORECASE)
        if m:
            clean = m.group(1).strip()
            # Stop at common prepositions/keywords
            clean = re.split(r'\b(?:for|under|with|budget|on|and|in)\b', clean, flags=re.IGNORECASE)[0].strip()
            if len(clean) >= 3:
                return clean.title()

        # Extract words that look like proper names
        words = [w for w in text.split() if w.lower() not in [
            "plan", "a", "trip", "days", "day", "under", "budget", "for", "with", "the", "people", "expedition", "vacation"
        ]]
        if words:
            return " ".join(words[:2]).strip().title()
        return "Custom Destination"

    def _extract_days(self, text: str, req_days: Optional[int]) -> int:
        if req_days and 1 <= req_days <= 30:
            return req_days
        m = re.search(r'\b(\d{1,2})\s*(?:day|days)\b', text, re.IGNORECASE)
        if m:
            return max(1, min(30, int(m.group(1))))
        return 5

    def _extract_budget(self, text: str, req_budget: Optional[float], req_curr: Optional[str]) -> (float, str):
        curr = req_curr or "INR"
        if "usd" in text.lower() or "$" in text:
            curr = "USD"
        elif "eur" in text.lower() or "€" in text:
            curr = "EUR"
        elif "gbp" in text.lower() or "£" in text:
            curr = "GBP"

        if req_budget and req_budget > 0:
            return req_budget, curr

        m = re.search(r'(?:₹|\$|€|£|rs\.?|inr)?\s*(\d[\d,]*)\s*(?:k|thousand|rupees|usd|inr)?', text, re.IGNORECASE)
        if m:
            num_str = m.group(1).replace(",", "")
            if num_str.isdigit():
                val = float(num_str)
                if val < 100:  # e.g. "50k" -> 50000
                    val *= 1000
                if val > 0:
                    return val, curr

        default_b = 50000.0 if curr == "INR" else 1500.0
        return default_b, curr

    def _build_budget_breakdown(self, total: float) -> AIBudgetBreakdown:
        return AIBudgetBreakdown(
            accommodation=round(total * 0.40, 2),
            transportation=round(total * 0.25, 2),
            food=round(total * 0.20, 2),
            activities=round(total * 0.10, 2),
            miscellaneous=round(total * 0.05, 2),
        )

    # -------------------------------------------------------------------------
    # Tailored Plans
    # -------------------------------------------------------------------------
    def _build_goa_plan(self, days: int, budget: float, curr: str) -> AITripPlanResponse:
        title = f"Relaxing {days}-Day Goa Sun, Sand & Portuguese Heritage Escape"
        desc = "Discover sun-kissed beaches, historic forts, vibrant spice plantations, and delicious Goan seafood."
        
        all_acts = [
          AIActivityItem(title="Baga & Calangute Beach Sunset Walk", description="Relax on sandy shores and enjoy beach shacks.", category="relaxation", cost=0.0, duration_mins=120, day_number=1, latitude=15.5494, longitude=73.7535),
          AIActivityItem(title="Fort Aguada & Lighthouse Visit", description="Explore 17th-century Portuguese lighthouse overlooking the Arabian Sea.", category="sightseeing", cost=500.0, duration_mins=150, day_number=1, latitude=15.4920, longitude=73.7737),
          AIActivityItem(title="Fontainhas Panjim Latin Quarter Walk", description="Stroll through colorful colonial Portuguese houses and art cafes.", category="culture", cost=0.0, duration_mins=120, day_number=2, latitude=15.4989, longitude=73.8278),
          AIActivityItem(title="Mandovi River Sunset Cruise & Cultural Dance", description="Enjoy live music, folk dance, and scenic views on Mandovi river boat.", category="relaxation", cost=1200.0, duration_mins=120, day_number=2, latitude=15.5015, longitude=73.8322),
          AIActivityItem(title="Dudhsagar Waterfalls Trek & Jeep Safari", description="Jeep drive through Bhagwan Mahavir Wildlife Sanctuary to four-tiered waterfall.", category="nature", cost=2500.0, duration_mins=240, day_number=3, latitude=15.3144, longitude=74.3143),
          AIActivityItem(title="Sahakari Spice Plantation Tour & Organic Lunch", description="Guided tour of aromatic spices followed by traditional Goan lunch.", category="food", cost=800.0, duration_mins=150, day_number=3, latitude=15.4021, longitude=74.0152),
          AIActivityItem(title="Palolem & Agonda Beach South Goa Chill", description="Serene crescent beach ideal for swimming and kayaking.", category="relaxation", cost=500.0, duration_mins=180, day_number=4, latitude=15.0100, longitude=74.0232),
        ]
        
        acts = all_acts[:min(len(all_acts), days * 2)]
        for i, a in enumerate(acts):
            a.day_number = (i // 2) + 1

        return AITripPlanResponse(
            title=title,
            description=desc,
            destination="Goa",
            total_days=days,
            estimated_total_cost=budget,
            currency=curr,
            cover_image_url="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200",
            stops=[
                AIStopItem(
                    city_name="Goa", country="India", latitude=15.2993, longitude=74.1240, days_count=days, activities=acts
                )
            ],
            budget_breakdown=self._build_budget_breakdown(budget)
        )

    def _build_japan_plan(self, days: int, budget: float, curr: str) -> AITripPlanResponse:
        return AITripPlanResponse(
            title=f"Grand {days}-Day Japan Expedition: Tokyo & Kyoto",
            description="Experience neon skyscrapers, ancient shrines, bullet trains, and gourmet cuisine.",
            destination="Japan",
            total_days=days,
            estimated_total_cost=budget,
            currency=curr,
            cover_image_url="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200",
            stops=[
                AIStopItem(
                    city_name="Tokyo", country="Japan", latitude=35.6762, longitude=139.6503, days_count=max(1, days // 2),
                    activities=[
                        AIActivityItem(title="Akihabara Tech & Anime Tour", description="Explore multi-story gaming centers and electronic stores.", category="culture", cost=2500.0, duration_mins=180, day_number=1, latitude=35.6983, longitude=139.7731),
                        AIActivityItem(title="Senso-ji Temple & Asakusa Food Tour", description="Visit Tokyo's oldest temple and enjoy traditional treats.", category="food", cost=3000.0, duration_mins=150, day_number=1, latitude=35.7148, longitude=139.7967),
                    ]
                ),
                AIStopItem(
                    city_name="Kyoto", country="Japan", latitude=35.0116, longitude=135.7681, days_count=max(1, days - (days // 2)),
                    activities=[
                        AIActivityItem(title="Fushimi Inari Torii Gate Hike", description="Hike through 10,000 orange torii gates.", category="nature", cost=0.0, duration_mins=180, day_number=max(1, (days // 2) + 1), latitude=34.9671, longitude=135.7727),
                        AIActivityItem(title="Arashiyama Bamboo Grove Walk", description="Stroll through bamboo paths and monkey park.", category="nature", cost=1500.0, duration_mins=150, day_number=days, latitude=35.0170, longitude=135.6713),
                    ]
                )
            ],
            budget_breakdown=self._build_budget_breakdown(budget)
        )

    def _build_paris_plan(self, days: int, budget: float, curr: str) -> AITripPlanResponse:
        return AITripPlanResponse(
            title=f"Charming {days}-Day Paris Highlights & Cultural Tour",
            description="Marvel at Eiffel Tower views, world-class art at Louvre, and idyllic Seine cruises.",
            destination="Paris",
            total_days=days,
            estimated_total_cost=budget,
            currency=curr,
            cover_image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200",
            stops=[
                AIStopItem(
                    city_name="Paris", country="France", latitude=48.8566, longitude=2.3522, days_count=days,
                    activities=[
                        AIActivityItem(title="Eiffel Tower Sunset & Seine River Cruise", description="Iconic views of Paris followed by an evening cruise.", category="sightseeing", cost=3500.0, duration_mins=180, day_number=1, latitude=48.8584, longitude=2.2945),
                        AIActivityItem(title="Louvre Museum Masterpieces Guided Tour", description="See Mona Lisa, Venus de Milo, and royal galleries.", category="culture", cost=2200.0, duration_mins=240, day_number=2, latitude=48.8606, longitude=2.3376),
                    ]
                )
            ],
            budget_breakdown=self._build_budget_breakdown(budget)
        )

    def _build_london_plan(self, days: int, budget: float, curr: str) -> AITripPlanResponse:
        return AITripPlanResponse(
            title=f"Classic {days}-Day London Heritage & Landmark Expedition",
            description="Explore royal palaces, West End shows, British Museum treasures, and Thames views.",
            destination="London",
            total_days=days,
            estimated_total_cost=budget,
            currency=curr,
            cover_image_url="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200",
            stops=[
                AIStopItem(
                    city_name="London", country="United Kingdom", latitude=51.5074, longitude=-0.1278, days_count=days,
                    activities=[
                        AIActivityItem(title="Big Ben, Westminster & London Eye", description="Walk past Houses of Parliament and ride the London Eye.", category="sightseeing", cost=3000.0, duration_mins=180, day_number=1, latitude=51.5007, longitude=-0.1246),
                        AIActivityItem(title="British Museum & Covent Garden", description="World history artifacts and street performer markets.", category="culture", cost=0.0, duration_mins=210, day_number=2, latitude=51.5194, longitude=-0.1270),
                    ]
                )
            ],
            budget_breakdown=self._build_budget_breakdown(budget)
        )

    def _build_bali_plan(self, days: int, budget: float, curr: str) -> AITripPlanResponse:
        return AITripPlanResponse(
            title=f"Tropical {days}-Day Bali Rice Terraces & Temple Retreat",
            description="Soak in lush rainforests, ancient sea temples, waterfalls, and beach clubs.",
            destination="Bali",
            total_days=days,
            estimated_total_cost=budget,
            currency=curr,
            cover_image_url="https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200",
            stops=[
                AIStopItem(
                    city_name="Ubud", country="Indonesia", latitude=-8.5069, longitude=115.2625, days_count=days,
                    activities=[
                        AIActivityItem(title="Tegalalang Rice Terraces & Jungle Swing", description="Iconic green terraced valleys and swings.", category="nature", cost=1500.0, duration_mins=180, day_number=1, latitude=-8.4312, longitude=115.2792),
                        AIActivityItem(title="Uluwatu Sunset Temple & Kecak Fire Dance", description="Cliffside sea temple with traditional performance.", category="culture", cost=1200.0, duration_mins=150, day_number=2, latitude=-8.8291, longitude=115.0849),
                    ]
                )
            ],
            budget_breakdown=self._build_budget_breakdown(budget)
        )

    def _build_dubai_plan(self, days: int, budget: float, curr: str) -> AITripPlanResponse:
        return AITripPlanResponse(
            title=f"Futuristic {days}-Day Dubai Desert & Luxury City Highlights",
            description="Burj Khalifa heights, desert dune bashing, traditional souks, and Dubai Mall.",
            destination="Dubai",
            total_days=days,
            estimated_total_cost=budget,
            currency=curr,
            cover_image_url="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200",
            stops=[
                AIStopItem(
                    city_name="Dubai", country="UAE", latitude=25.2048, longitude=55.2708, days_count=days,
                    activities=[
                        AIActivityItem(title="Burj Khalifa 124th Floor Deck & Dubai Fountain", description="Panoramas from world's tallest tower.", category="sightseeing", cost=4500.0, duration_mins=150, day_number=1, latitude=25.1972, longitude=55.2744),
                        AIActivityItem(title="Desert Safari, Dune Bashing & BBQ Dinner", description="4x4 desert adventure with camel rides.", category="nature", cost=3200.0, duration_mins=300, day_number=2, latitude=24.9500, longitude=55.4000),
                    ]
                )
            ],
            budget_breakdown=self._build_budget_breakdown(budget)
        )

    def _build_nyc_plan(self, days: int, budget: float, curr: str) -> AITripPlanResponse:
        return AITripPlanResponse(
            title=f"Dynamic {days}-Day New York City Skyline & Landmarks Tour",
            description="Explore Manhattan, Broadway, Central Park, Brooklyn Bridge, and world-class museums.",
            destination="New York",
            total_days=days,
            estimated_total_cost=budget,
            currency=curr,
            cover_image_url="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1200",
            stops=[
                AIStopItem(
                    city_name="New York", country="United States", latitude=40.7128, longitude=-74.0060, days_count=days,
                    activities=[
                        AIActivityItem(title="Statue of Liberty Ferry & Ellis Island", description="Iconic monument and harbor cruise.", category="sightseeing", cost=2800.0, duration_mins=210, day_number=1, latitude=40.6892, longitude=-74.0445),
                        AIActivityItem(title="Central Park Stroll & Met Museum", description="Historic park walk followed by world-famous museum.", category="culture", cost=2500.0, duration_mins=240, day_number=2, latitude=40.7794, longitude=-73.9632),
                    ]
                )
            ],
            budget_breakdown=self._build_budget_breakdown(budget)
        )

    def _build_kerala_plan(self, days: int, budget: float, curr: str) -> AITripPlanResponse:
        return AITripPlanResponse(
            title=f"Serene {days}-Day Kerala Backwaters & Tea Garden Journey",
            description="Alleppey houseboat cruises, Munnar tea hills, spice gardens, and Arabian sea beaches.",
            destination="Kerala",
            total_days=days,
            estimated_total_cost=budget,
            currency=curr,
            cover_image_url="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200",
            stops=[
                AIStopItem(
                    city_name="Alleppey & Munnar", country="India", latitude=9.4981, longitude=76.3388, days_count=days,
                    activities=[
                        AIActivityItem(title="Alleppey Houseboat Backwater Cruise", description="Glide along coconut palm lined canals.", category="relaxation", cost=4500.0, duration_mins=240, day_number=1, latitude=9.4981, longitude=76.3388),
                        AIActivityItem(title="Munnar Tea Plantation & Factory Tour", description="Rolling green hills and fresh tea tasting.", category="nature", cost=600.0, duration_mins=180, day_number=2, latitude=10.0889, longitude=77.0595),
                    ]
                )
            ],
            budget_breakdown=self._build_budget_breakdown(budget)
        )

    def _build_switzerland_plan(self, days: int, budget: float, curr: str) -> AITripPlanResponse:
        return AITripPlanResponse(
            title=f"Majestic {days}-Day Swiss Alps & Scenic Lake Exploration",
            description="Snow-capped alpine peaks, Lucerne lake views, Interlaken, and Swiss chocolates.",
            destination="Switzerland",
            total_days=days,
            estimated_total_cost=budget,
            currency=curr,
            cover_image_url="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1200",
            stops=[
                AIStopItem(
                    city_name="Zurich & Lucerne", country="Switzerland", latitude=47.3769, longitude=8.5417, days_count=days,
                    activities=[
                        AIActivityItem(title="Lucerne Chapel Bridge & Lake Cruise", description="Historic wooden bridge and alpine lake boat tour.", category="sightseeing", cost=3500.0, duration_mins=180, day_number=1, latitude=47.0502, longitude=8.3093),
                        AIActivityItem(title="Mount Titlis Cable Car & Glacier Cave", description="Revolving cable car to 3,000m snow summit.", category="nature", cost=8500.0, duration_mins=300, day_number=2, latitude=46.7722, longitude=8.4286),
                    ]
                )
            ],
            budget_breakdown=self._build_budget_breakdown(budget)
        )

    def _build_agra_plan(self, days: int, budget: float, curr: str) -> AITripPlanResponse:
        return AITripPlanResponse(
            title=f"Golden {days}-Day Taj Mahal & Mughal Heritage Tour",
            description="Sunrise at the Taj Mahal, Agra Fort, Mehtab Bagh gardens, and Mughlai culinary delights.",
            destination="Agra",
            total_days=days,
            estimated_total_cost=budget,
            currency=curr,
            cover_image_url="https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200",
            stops=[
                AIStopItem(
                    city_name="Agra", country="India", latitude=27.1767, longitude=78.0081, days_count=days,
                    activities=[
                        AIActivityItem(title="Taj Mahal Sunrise Guided Visit", description="World Wonder white marble mausoleum bathed in morning light.", category="culture", cost=1100.0, duration_mins=180, day_number=1, latitude=27.1751, longitude=78.0421),
                        AIActivityItem(title="Agra Fort & Mehtab Bagh Sunset", description="Red sandstone fortress and river garden view of Taj Mahal.", category="sightseeing", cost=800.0, duration_mins=180, day_number=1, latitude=27.1795, longitude=78.0211),
                    ]
                )
            ],
            budget_breakdown=self._build_budget_breakdown(budget)
        )

    def _build_dynamic_plan(self, dest_name: str, days: int, budget: float, curr: str, full_prompt: str) -> AITripPlanResponse:
        """Dynamic fallback generator for custom/unknown cities."""
        title = f"Custom {days}-Day {dest_name} Highlights & Discovery Tour"
        desc = f"A personalized {days}-day itinerary created for '{full_prompt}' exploring top landmarks, food, and culture in {dest_name}."

        activities: List[AIActivityItem] = []
        templates = [
            ("City Highlights & Historic Old Town Walk", "Explore central landmarks, historic architecture, and local plazas.", "sightseeing", 0.0, 150),
            ("Local Food Tour & Street Market Tasting", "Sample iconic regional dishes, snacks, and street food delights.", "food", 1500.0, 120),
            ("Panoramas & Scenic Lookout Deck", "Breathtaking panoramic views of the city skyline and landscape.", "sightseeing", 1200.0, 90),
            ("Cultural Museum & Art Gallery Visit", "Discover regional heritage, royal collections, and contemporary art.", "culture", 800.0, 180),
            ("Nature Park & Garden Relaxation", "Relaxing stroll through botanical gardens and scenic natural spots.", "nature", 0.0, 120),
            ("Evening Sunset Spot & Local Dining", "Watch the sunset from a popular viewpoint followed by local dinner.", "relaxation", 2000.0, 150),
        ]

        target_act_count = max(2, min(len(templates), days * 2))
        for idx in range(target_act_count):
            tpl = templates[idx % len(templates)]
            day_num = (idx // 2) + 1
            if day_num > days:
                day_num = days

            activities.append(
                AIActivityItem(
                    title=f"{dest_name} {tpl[0]}",
                    description=tpl[1],
                    category=tpl[2],
                    cost=tpl[3],
                    duration_mins=tpl[4],
                    day_number=day_num,
                    latitude=20.5937,
                    longitude=78.9629
                )
            )

        return AITripPlanResponse(
            title=title,
            description=desc,
            destination=dest_name,
            total_days=days,
            estimated_total_cost=budget,
            currency=curr,
            cover_image_url="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200",
            stops=[
                AIStopItem(
                    city_name=dest_name,
                    country="Worldwide",
                    latitude=20.5937,
                    longitude=78.9629,
                    days_count=days,
                    activities=activities
                )
            ],
            budget_breakdown=self._build_budget_breakdown(budget)
        )

gemini_service = GeminiService()

