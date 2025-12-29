"use client";

import Link from 'next/link';
import type { TourismSpot } from '@/types';

interface DestinationCardProps {
  spot: TourismSpot;
}

export function DestinationCard({ spot }: DestinationCardProps) {
  return (
    <Link href={`/tourism/${spot.destination_id}`}>
      <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#0071c2] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
        <div className="relative h-64 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
            style={{ backgroundImage: `url('${spot.thumbnail}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent group-hover:from-black/80 transition-all" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <h3 className="text-2xl font-bold mb-2">{spot.name}</h3>
            <p className="text-sm text-white/90 flex items-center">📍 {spot.location}</p>
          </div>
        </div>
        <div className="p-5">
          <p className="text-gray-700 mb-4 line-clamp-2">{spot.description}</p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 font-semibold text-gray-900">
              <span className="text-xl">⭐</span>
              <span>{spot.rating}</span>
            </div>
            <span className="text-gray-600">
              {spot.type ? `Loại hình: ${spot.type}` : 'Đang cập nhật'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
