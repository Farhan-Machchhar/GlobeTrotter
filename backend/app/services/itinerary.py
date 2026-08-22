import logging
from typing import List, Dict, Any

logger = logging.getLogger("globetrotter.itinerary_service")


class ItineraryService:
    """
    Itinerary scheduling and optimization helper service.
    Calculates estimated travel times and orders activities by day.
    """
    def __init__(self):
        pass

    def optimize_day_schedule(self, activities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Sort activities by start_time or order_index and assign sequential times.
        """
        sorted_acts = sorted(activities, key=lambda a: (a.get("day_number", 1), a.get("order_index", 0)))
        
        current_day = 1
        current_hour = 9  # Start at 09:00 AM

        for act in sorted_acts:
            day_num = act.get("day_number", 1)
            if day_num != current_day:
                current_day = day_num
                current_hour = 9

            start_str = f"{current_hour:02d}:00"
            duration = act.get("duration_mins", 60) // 60 or 1
            end_hour = min(23, current_hour + duration)
            end_str = f"{end_hour:02d}:00"

            act["start_time"] = start_str
            act["end_time"] = end_str
            current_hour = min(22, end_hour + 1)

        return sorted_acts


itinerary_service = ItineraryService()
