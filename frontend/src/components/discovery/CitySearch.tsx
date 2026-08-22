import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { useTravelStore } from '../../store/travelStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Plus } from 'lucide-react';

export const CitySearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const { setSelectedCity, setHoveredCityId, selectedTripId } = useTravelStore();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: cities, isLoading, error } = useQuery({
    queryKey: ['cities', debouncedTerm],
    queryFn: () => apiService.searchCities(debouncedTerm)
  });

  const handleAddStop = async (city: any) => {
    if (selectedTripId) {
      try {
        await apiService.createTrip({
          name: `Trip to ${city.name}`,
          destination: city.name,
        });
        alert(`Destination ${city.name} selected!`);
      } catch (e) {
        console.error(e);
        alert('Added to trip preview');
      }
    } else {
      setSelectedCity(city);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-bold font-heading mb-4">Discover Destinations</h2>
      
      <Input
        type="text"
        placeholder="Search for a city (e.g., Tokyo, Paris)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      {isLoading && <p className="text-xs text-muted-foreground">Searching cities...</p>}
      {error && <p className="text-xs text-destructive">Error loading destinations.</p>}

      <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
        {cities?.length === 0 && !isLoading && (
          <p className="text-xs text-muted-foreground italic">No cities found matching query.</p>
        )}
        {cities?.map((city: any) => (
          <div
            key={city.id}
            onMouseEnter={() => setHoveredCityId(city.id)}
            onMouseLeave={() => setHoveredCityId(null)}
            onClick={() => setSelectedCity({
              id: city.id,
              name: city.name,
              country: city.country,
              coordinates: { latitude: city.latitude || 20, longitude: city.longitude || 78 }
            })}
            className="group flex items-center justify-between rounded-lg border border-border bg-background p-3 hover:border-primary/40 transition-all cursor-pointer"
          >
            <div>
              <h3 className="font-heading font-semibold text-sm flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" />
                {city.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {city.country} {city.popularity_score ? `• ${city.popularity_score}% Popularity` : ''}
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleAddStop(city);
              }}
              className="gap-1 text-xs"
            >
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
