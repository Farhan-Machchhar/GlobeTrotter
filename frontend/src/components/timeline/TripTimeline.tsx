import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { useTravelStore } from '../../store/travelStore';
import { Clock, MapPin } from 'lucide-react';

export const TripTimeline: React.FC = () => {
  const { selectedTripId } = useTravelStore();

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', selectedTripId],
    queryFn: () => apiService.getTripById(selectedTripId),
    enabled: !!selectedTripId
  });

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading timeline...</div>;
  if (!trip || !trip.stops || trip.stops.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-bold font-heading mb-4">Trip Timeline</h2>
      
      <div className="flex flex-col gap-4">
        {trip.stops.map((stop: any, index: number) => {
          const cityName = stop.city_name || stop.city?.name || 'Stop Location';
          const activities = stop.activities || [];

          return (
            <div key={stop.id || index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="size-3.5 rounded-full bg-primary mt-1 ring-4 ring-primary/20 shrink-0" />
                {index < trip.stops.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border my-1" />
                )}
              </div>
              <div className={`flex-1 ${index < trip.stops.length - 1 ? 'pb-4' : ''}`}>
                <h3 className="font-heading font-semibold text-base flex items-center gap-1.5">
                  <MapPin className="size-4 text-primary" />
                  {cityName}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activities.length} Activities scheduled
                </p>

                {activities.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {activities.map((act: any, aIdx: number) => (
                      <div key={act.id || aIdx} className="rounded-lg bg-muted/50 p-2.5 text-xs">
                        <div className="font-semibold text-foreground flex items-center justify-between">
                          <span>Day {act.day_number || 1} • {act.title || act.name}</span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" /> {act.duration_mins || 60} mins
                          </span>
                        </div>
                        {act.description && (
                          <p className="text-muted-foreground mt-1 line-clamp-1">{act.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic mt-2">No specific activities scheduled yet.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
