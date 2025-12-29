"use client";

import type { TourismSpot } from '@/types';

interface DestinationHeroProps {
  destination: TourismSpot;
}

export function DestinationHero({ destination }: DestinationHeroProps) {
  return (
    <section className="relative h-96 md:h-[500px] bg-gray-900">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${destination.thumbnail}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{destination.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-lg">
            <span className="flex items-center gap-2">📍 {destination.location}</span>
            <span className="flex items-center gap-2">⭐ {destination.rating} / 5.0</span>
          </div>
        </div>
      </div>
    </section>
  );
}
