// frontend/components/search/ResultsMap.tsx
'use client';

import { useMemo } from 'react';
import { Map, APIProvider, Marker } from '@vis.gl/react-google-maps';
import type { Hotel } from '@/types';

interface ResultsMapProps {
  hotels: Hotel[];
}

// TODO: User must provide their own Google Maps API key in a .env.local file
// NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function ResultsMap({ hotels }: ResultsMapProps) {
  // Calculate the center of the map based on the hotel locations
  const center = useMemo(() => {
    if (hotels.length === 0) {
      return { lat: 21.028511, lng: 105.804817 }; // Default to Hanoi
    }
    const { lat, lng } = hotels.reduce(
      (acc, hotel) => {
        return {
          lat: acc.lat + hotel.latitude,
          lng: acc.lng + hotel.longitude,
        };
      },
      { lat: 0, lng: 0 }
    );
    return { lat: lat / hotels.length, lng: lng / hotels.length };
  }, [hotels]);

  if (!API_KEY) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg p-4">
        <div className="text-center">
          <p className="font-semibold text-red-600">Lỗi: Google Maps API Key bị thiếu.</p>
          <p className="text-sm text-gray-700 mt-2">
            Vui lòng cung cấp khóa API trong file <code>.env.local</code> với tên biến là <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        style={{ width: '100%', height: '100%' }}
        center={center}
        zoom={hotels.length === 0 ? 10 : 12}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        {hotels.map((hotel) => (
          <Marker
            key={hotel.id}
            position={{ lat: hotel.latitude, lng: hotel.longitude }}
            title={hotel.name}
          />
        ))}
      </Map>
    </APIProvider>
  );
}
