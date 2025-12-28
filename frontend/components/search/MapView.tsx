'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import L from 'leaflet';
import { Hotel } from '@/types';

interface MapViewProps {
  hotels: Hotel[];
}

const MapBounds = ({ hotels }: MapViewProps) => {
  const map = useMap();

  useEffect(() => {
    if (hotels && hotels.length > 0) {
      const bounds = new L.LatLngBounds(
        hotels.map((hotel) => [hotel.latitude, hotel.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [hotels, map]);

  return null;
};

const MapView = ({ hotels }: MapViewProps) => {
  if (!hotels || hotels.length === 0) {
    return <div>No hotels to display on the map.</div>;
  }

  const position = [hotels[0].latitude, hotels[0].longitude];

  return (
    <MapContainer
      center={position as [number, number]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {hotels.map((hotel, idx) => (
        <Marker
          key={hotel.name + hotel.latitude + hotel.longitude}
          position={[hotel.latitude, hotel.longitude]}
        >
          <Popup>
            <div>
              <h3>{hotel.name}</h3>
              <p>{hotel.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
      <MapBounds hotels={hotels} />
    </MapContainer>
  );
};

export default MapView;
