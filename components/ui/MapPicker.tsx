'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Navigation, Search } from 'lucide-react';

export interface MapPickerValue {
  lat: number;
  lng: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

interface MapPickerProps {
  value: MapPickerValue;
  onChange: (value: MapPickerValue) => void;
  className?: string;
}

export default function MapPicker({ value, onChange, className = '' }: MapPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

  useEffect(() => {
    if (!mapContainer.current || !mapTilerKey) {
      setError('Configuração do mapa não disponível');
      setIsLoading(false);
      return;
    }

    try {
      // Inicializar mapa
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/satellite/style.json?key=${mapTilerKey}`,
        center: [value.lng, value.lat],
        zoom: value.zoom,
        bearing: value.bearing,
        pitch: value.pitch,
        attributionControl: false
      });

      // Adicionar controles
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.current.addControl(new maplibregl.AttributionControl({
        compact: true
      }), 'bottom-right');

      // Criar marcador
      marker.current = new maplibregl.Marker({
        color: '#ff6b35',
        draggable: true
      })
        .setLngLat([value.lng, value.lat])
        .addTo(map.current);

      // Event listeners
      map.current.on('load', () => {
        setIsLoading(false);
        
        // Tentar carregar GeoJSON do aeroporto
        loadAirportGeoJSON();
      });

      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        updateLocation(lat, lng);
      });

      map.current.on('moveend', () => {
        if (map.current) {
          const center = map.current.getCenter();
          const zoom = Math.round(map.current.getZoom());
          const bearing = map.current.getBearing();
          const pitch = map.current.getPitch();
          
          onChange({
            lat: center.lat,
            lng: center.lng,
            zoom,
            bearing,
            pitch
          });
        }
      });

      // Marcador arrastável
      if (marker.current) {
        marker.current.on('dragend', () => {
          if (marker.current) {
            const lngLat = marker.current.getLngLat();
            updateLocation(lngLat.lat, lngLat.lng);
          }
        });
      }

      map.current.on('error', (e) => {
        console.error('Erro no mapa:', e);
        setError('Erro ao carregar o mapa');
        setIsLoading(false);
      });

    } catch (err) {
      console.error('Erro ao inicializar mapa:', err);
      setError('Erro ao inicializar o mapa');
      setIsLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapTilerKey]);

  const loadAirportGeoJSON = async () => {
    try {
      const response = await fetch('/api/airport.geojson');
      if (response.ok) {
        const geojson = await response.json();
        
        if (map.current && geojson) {
          map.current.addSource('airport', {
            type: 'geojson',
            data: geojson
          });

          map.current.addLayer({
            id: 'airport-fill',
            type: 'fill',
            source: 'airport',
            paint: {
              'fill-color': '#ff6b35',
              'fill-opacity': 0.2
            }
          });

          map.current.addLayer({
            id: 'airport-line',
            type: 'line',
            source: 'airport',
            paint: {
              'line-color': '#ff6b35',
              'line-width': 2
            }
          });
        }
      }
    } catch (err) {
      // GeoJSON do aeroporto é opcional, não mostrar erro
      console.log('GeoJSON do aeroporto não disponível');
    }
  };

  const updateLocation = (lat: number, lng: number) => {
    if (marker.current) {
      marker.current.setLngLat([lng, lat]);
    }
    
    onChange({
      ...value,
      lat,
      lng
    });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador');
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocation(latitude, longitude);
        
        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 17
          });
        }
        setIsSearching(false);
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        alert('Erro ao obter sua localização');
        setIsSearching(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const searchLocation = async () => {
    if (!searchQuery.trim() || !mapTilerKey) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${mapTilerKey}&limit=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          updateLocation(lat, lng);
          
          if (map.current) {
            map.current.flyTo({
              center: [lng, lat],
              zoom: 17
            });
          }
        } else {
          alert('Localização não encontrada');
        }
      }
    } catch (err) {
      console.error('Erro na busca:', err);
      alert('Erro ao buscar localização');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-2 text-red-600">
          <MapPin className="w-5 h-5" />
          <span className="font-medium">Erro no Mapa</span>
        </div>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Campo de busca */}
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="Buscar endereço..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              disabled={isSearching}
            />
          </div>
          <button
            onClick={searchLocation}
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? '...' : 'Buscar'}
          </button>
        </div>

        {/* Botão de localização atual */}
        <button
          onClick={useCurrentLocation}
          disabled={isSearching}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Usar minha localização"
        >
          <Navigation className="w-4 h-4" />
          <span className="hidden sm:inline">Minha Localização</span>
        </button>
      </div>

      {/* Container do mapa */}
      <div className="relative">
        <div
          ref={mapContainer}
          className="w-full h-80 rounded-xl overflow-hidden border border-gray-200"
          style={{ minHeight: '320px' }}
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
              <p className="text-gray-600">Carregando mapa...</p>
            </div>
          </div>
        )}
      </div>

      {/* Informações de coordenadas */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Latitude:</span>
            <p className="font-mono font-medium">{value.lat.toFixed(6)}</p>
          </div>
          <div>
            <span className="text-gray-600">Longitude:</span>
            <p className="font-mono font-medium">{value.lng.toFixed(6)}</p>
          </div>
          <div>
            <span className="text-gray-600">Zoom:</span>
            <p className="font-mono font-medium">{value.zoom}</p>
          </div>
          <div>
            <span className="text-gray-600">Rotação:</span>
            <p className="font-mono font-medium">{value.bearing.toFixed(1)}°</p>
          </div>
        </div>
      </div>
    </div>
  );
}