import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useTravelStore } from '../../store/travelStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TripStop } from '../../types';

// Sortable Stop Item Component
const SortableStop = ({ stop }: { stop: TripStop }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '12px',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{ cursor: 'grab', padding: '4px', color: '#9ca3af' }}>≡</div>
      <div>
        <h4 style={{ margin: 0 }}>{stop.city.name}</h4>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>Days: {stop.days.length}</div>
      </div>
    </div>
  );
};


export const ItineraryBuilder: React.FC = () => {
  const { selectedTripId } = useTravelStore();
  const queryClient = useQueryClient();

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', selectedTripId],
    queryFn: () => api.getTrip(selectedTripId),
    enabled: !!selectedTripId
  });

  const reorderMutation = useMutation({
    mutationFn: (stopIds: string[]) => api.reorderStops(selectedTripId, stopIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', selectedTripId] });
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id && trip) {
      const oldIndex = trip.stops.findIndex(s => s.id === active.id);
      const newIndex = trip.stops.findIndex(s => s.id === over.id);
      
      const newStops = arrayMove(trip.stops, oldIndex, newIndex);
      const newStopIds = newStops.map(s => s.id);
      
      reorderMutation.mutate(newStopIds);
    }
  };

  if (isLoading) return <div>Loading itinerary...</div>;
  if (!trip) return <div>No trip selected</div>;

  return (
    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Itinerary Stops</h2>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={trip.stops.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {trip.stops.map(stop => (
            <SortableStop key={stop.id} stop={stop} />
          ))}
        </SortableContext>
      </DndContext>

      {trip.stops.length === 0 && (
        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No stops added yet. Discover cities and add them to your trip.</p>
      )}
    </div>
  );
};
