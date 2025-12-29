'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import "leaflet-defaulticon-compatibility";
import { LatLngExpression } from 'leaflet';
import { useEffect } from 'react';

interface MapPickerProps {
  position: LatLngExpression;
  onPositionChange: (position: { lat: number; lng: number }) => void;
  isEditing: boolean;
}

function MapClickHandler({
  onPositionChange,
  isEditing,
  position
}: {
  onPositionChange: (position: { lat: number; lng: number }) => void;
  isEditing: boolean;
  position: LatLngExpression;
}) {
  const map = useMapEvents({
    click(e) {
      if (isEditing) {
        onPositionChange(e.latlng);
      }
    },
  });

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export const MapPicker = ({
  position,
  onPositionChange,
  isEditing,
}: MapPickerProps) => {
  return (
    <div className="h-96 w-full" style={{ cursor: isEditing ? 'crosshair' : 'default' }}>
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}></Marker>
        <MapClickHandler
          position={position}
          onPositionChange={onPositionChange}
          isEditing={isEditing}
        />
      </MapContainer>
    </div>
  );
};
