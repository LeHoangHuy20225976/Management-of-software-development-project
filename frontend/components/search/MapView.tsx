
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import "leaflet-defaulticon-compatibility";
import { Hotel } from '@/types';

interface MapViewProps {
  hotels: Hotel[];
}

const MapView = ({ hotels }: MapViewProps) => {
  if (!hotels || hotels.length === 0) {
    return <div>No hotels to display on the map.</div>;
  }

  const position = [hotels[0].latitude, hotels[0].longitude];

  return (
    <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {hotels.map((hotel) => (
        <Marker key={hotel.id} position={[hotel.latitude, hotel.longitude]}>
          <Popup>
            <div>
              <h3>{hotel.name}</h3>
              <p>{hotel.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
