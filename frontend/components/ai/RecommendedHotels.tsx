/**
 * Recommended Hotels Component - AI-powered recommendations
 * FE5: AI Display UI
 */

import Link from 'next/link';
import { Card } from '../common/Card';
import { formatCurrency, formatStars } from '@/lib/utils/format';
import { ROUTES } from '@/lib/routes';
import type { Hotel } from '@/types';

interface RecommendedHotelsProps {
  hotels: Hotel[];
  reason?: string;
}

export const RecommendedHotels = ({ hotels, reason }: RecommendedHotelsProps) => {
  return (
    <div className="space-y-4">
      {reason && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <p className="text-blue-900">
              <strong>AI Gợi ý:</strong> {reason}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <Link key={hotel.id} href={ROUTES.HOTEL_DETAILS(hotel.slug)}>
            <Card hover padding="none" className="overflow-hidden group">
              <div className="relative h-48">
                <div
                  className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundImage: `url('${hotel.thumbnail}')` }}
                />
                <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-sm font-semibold shadow-lg">
                  {formatStars(hotel.stars)}
                </div>
                <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                  AI Match: 95%
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                  {hotel.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{hotel.address}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="text-yellow-500 mr-1">⭐</span>
                    <span className="font-semibold">{hotel.rating}</span>
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(hotel.basePrice)}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
