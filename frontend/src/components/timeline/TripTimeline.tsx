import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useTravelStore } from '../../store/travelStore';

export const TripTimeline: React.FC = () => {
  const { selectedTripId } = useTravelStore();

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', selectedTripId],
    queryFn: () => api.getTrip(selectedTripId),
    enabled: !!selectedTripId
  });

  if (isLoading) return <div>Loading timeline...</div>;
  if (!trip || trip.stops.length === 0) return null;

  return (
    <div style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Trip Timeline</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {trip.stops.map((stop, index) => (
          <div key={stop.id} style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6', marginTop: '4px' }} />
                {index < trip.stops.length - 1 && (
                    <div style={{ width: '2px', flex: 1, background: '#e5e7eb', margin: '4px 0' }} />
                )}
            </div>
            <div style={{ flex: 1, paddingBottom: index < trip.stops.length - 1 ? '16px' : '0' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{stop.city.name}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                    {stop.days.length} Days planned
                </p>
                {stop.days.map((day, dIdx) => (
                    <div key={day.id} style={{ marginTop: '8px', padding: '8px', background: '#f3f4f6', borderRadius: '4px' }}>
                        <strong>Day {dIdx + 1} - {day.date}</strong>
                        <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '14px' }}>
                            {day.plannedActivities.map(pa => (
                                <li key={pa.id}>{pa.activity.name}</li>
                            ))}
                            {day.plannedActivities.length === 0 && <li style={{ color: '#9ca3af' }}>No activities planned</li>}
                        </ul>
                    </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
