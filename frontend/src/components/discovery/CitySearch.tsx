import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useTravelStore } from '../../store/travelStore';
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
    queryFn: () => api.searchCities(debouncedTerm)
  });

  const handleAddStop = async (cityId: string) => {
      if (selectedTripId) {
          try {
              await api.addStop(selectedTripId, cityId);
              alert('Stop added to trip!');
          } catch (e) {
              console.error(e);
              alert('Failed to add stop');
          }
      }
  };

  return (
    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', marginTop: 0 }}>Discover Cities</h2>
      
      <input
        type="text"
        placeholder="Search for a city (e.g., Tokyo)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid #d1d5db',
          marginBottom: '16px',
          boxSizing: 'border-box'
        }}
      />

      {isLoading && <p>Loading cities...</p>}
      {error && <p style={{ color: 'red' }}>Error loading cities.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
        {cities?.length === 0 && !isLoading && <p>No cities found.</p>}
        {cities?.map((city) => (
          <div
            key={city.id}
            onMouseEnter={() => setHoveredCityId(city.id)}
            onMouseLeave={() => setHoveredCityId(null)}
            onClick={() => setSelectedCity(city)}
            style={{
              padding: '12px',
              background: 'white',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{city.name}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                {city.country} • Popularity: {city.popularity}/5
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddStop(city.id);
              }}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Add to Trip
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
