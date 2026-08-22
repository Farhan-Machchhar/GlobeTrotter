import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { useTravelStore } from '../../store/travelStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, GripVertical } from 'lucide-react';

const SortableStop = ({ stop }: { stop: any }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id || stop.city_name });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cityName = stop.city_name || stop.city?.name || stop.name || 'Destination Stop';
  const country = stop.country || stop.city?.country || '';
  const actCount = stop.activities?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 rounded-lg border border-border bg-background p-3.5 shadow-sm hover:border-primary/40 cursor-grab active:cursor-grabbing mb-2"
    >
      <GripVertical className="size-4 text-muted-foreground shrink-0" />
      <div className="flex-1">
        <h4 className="font-heading font-semibold text-sm flex items-center gap-1.5">
          <MapPin className="size-3.5 text-primary" />
          {cityName}
        </h4>
        <div className="text-xs text-muted-foreground mt-0.5">
          {country ? `${country} • ` : ''}{actCount} Activities planned
        </div>
      </div>
    </div>
  );
};

export const ItineraryBuilder: React.FC = () => {
  const { selectedTripId } = useTravelStore();

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', selectedTripId],
    queryFn: () => apiService.getTripById(selectedTripId),
    enabled: !!selectedTripId
  });

  const [localStops, setLocalStops] = useState<any[]>([]);

  React.useEffect(() => {
    if (trip?.stops) {
      setLocalStops(trip.stops);
    }
  }, [trip]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id && localStops.length > 0) {
      const oldIndex = localStops.findIndex(s => (s.id || s.city_name) === active.id);
      const newIndex = localStops.findIndex(s => (s.id || s.city_name) === over.id);
      if (oldIndex >= 0 && newIndex >= 0) {
        const reordered = arrayMove(localStops, oldIndex, newIndex);
        setLocalStops(reordered);
      }
    }
  };

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading itinerary stops...</div>;
  if (!trip) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-bold font-heading mb-4">Itinerary Stops & Reordering</h2>
      
      {localStops.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={localStops.map(s => s.id || s.city_name)} strategy={verticalListSortingStrategy}>
            {localStops.map((stop, idx) => (
              <SortableStop key={stop.id || idx} stop={stop} />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        <p className="text-xs text-muted-foreground italic">No stops added yet. Use search or AI planner to populate your itinerary.</p>
      )}
    </div>
  );
};
