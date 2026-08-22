import React, { useRef, useEffect } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import type { MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTravelStore } from '../../store/travelStore';
import type { City, Trip } from '../../types';

// Free OSM Vector Tiles Map Style
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

interface WorldMapProps {
  trip?: any;
  cities: City[];
}

export const WorldMap: React.FC<WorldMapProps> = ({ trip, cities }) => {
  const mapRef = useRef<MapRef>(null);
  const { selectedCity, setSelectedCity, hoveredCityId, setHoveredCityId } = useTravelStore();

  useEffect(() => {
    if (selectedCity && mapRef.current) {
      const lng = selectedCity.coordinates?.longitude || selectedCity.longitude || 0;
      const lat = selectedCity.coordinates?.latitude || selectedCity.latitude || 0;
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 10,
        duration: 1000
      });
    }
  }, [selectedCity]);

  // Fit bounds to trip stops
  useEffect(() => {
    if (trip && trip.stops && trip.stops.length > 0 && mapRef.current) {
      const lons = trip.stops.map((s: any) => s.longitude || s.city?.coordinates?.longitude || 0).filter(Boolean);
      const lats = trip.stops.map((s: any) => s.latitude || s.city?.coordinates?.latitude || 0).filter(Boolean);
      if (lons.length > 0 && lats.length > 0) {
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        if (trip.stops.length > 1) {
          mapRef.current.fitBounds(
            [[minLon - 2, minLat - 2], [maxLon + 2, maxLat + 2]],
            { padding: 50, duration: 1000 }
          );
        } else {
          mapRef.current.flyTo({
            center: [lons[0], lats[0]],
            zoom: 6,
            duration: 1000
          });
        }
      }
    }
  }, [trip]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 0,
          latitude: 20,
          zoom: 1.5
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
      >
        {/* Render available cities */}
        {cities.map((city) => {
          const lng = city.coordinates?.longitude || city.longitude || 0;
          const lat = city.coordinates?.latitude || city.latitude || 0;
          if (!lng || !lat) return null;

          return (
            <Marker
              key={`city-${city.id}`}
              longitude={lng}
              latitude={lat}
              anchor="bottom"
              onClick={(e: any) => {
                e.originalEvent.stopPropagation();
                setSelectedCity(city);
              }}
            >
              <div 
                style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: selectedCity?.id === city.id ? '#ef4444' : '#3b82f6',
                  borderRadius: '50%',
                  border: '2px solid white',
                  cursor: 'pointer',
                  boxShadow: '0 0 5px rgba(0,0,0,0.3)',
                  transform: hoveredCityId === city.id ? 'scale(1.2)' : 'scale(1)'
                }}
                onMouseEnter={() => setHoveredCityId(city.id)}
                onMouseLeave={() => setHoveredCityId(null)}
              />
            </Marker>
          );
        })}

        {/* Render trip stops */}
        {trip?.stops?.map((stop: any, idx: number) => {
          const lng = stop.longitude || stop.city?.coordinates?.longitude || 0;
          const lat = stop.latitude || stop.city?.coordinates?.latitude || 0;
          if (!lng || !lat) return null;

          return (
            <Marker
              key={`stop-${stop.id || idx}`}
              longitude={lng}
              latitude={lat}
              anchor="bottom"
              onClick={(e: any) => {
                e.originalEvent.stopPropagation();
                setSelectedCity(stop.city || { id: stop.id, name: stop.city_name, country: stop.country, coordinates: { latitude: lat, longitude: lng } });
              }}
            >
              <div 
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  border: '2px solid white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 0 8px rgba(16,185,129,0.6)',
                  zIndex: 10
                }}
              >
                {stop.order ? stop.order + 1 : idx + 1}
              </div>
            </Marker>
          );
        })}

        {/* Selected City Popup */}
        {selectedCity && (
          <Popup
            longitude={selectedCity.coordinates?.longitude || selectedCity.longitude || 0}
            latitude={selectedCity.coordinates?.latitude || selectedCity.latitude || 0}
            anchor="top"
            onClose={() => setSelectedCity(null)}
            closeOnClick={false}
          >
            <div style={{ padding: '8px', color: '#1f2937' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold' }}>{selectedCity.name}</h3>
              <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>{selectedCity.country}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};
