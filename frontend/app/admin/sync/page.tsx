'use client';

import { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { synchronizationApi } from '@/lib/api/services';

interface SyncResult {
  hotel_id: number;
  success: boolean;
  error?: string;
  availability?: any;
  pricing?: any;
}

export default function SyncPage() {
  const [loading, setLoading] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState('1');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  const handleSyncSingleHotel = async () => {
    setLoading(true);
    try {
      const result = await synchronizationApi.syncHotelData(parseInt(selectedHotelId), startDate, endDate);
      setSyncResults([{
        hotel_id: parseInt(selectedHotelId),
        success: true,
        availability: result.availability,
        pricing: result.pricing
      }]);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncResults([{
        hotel_id: parseInt(selectedHotelId),
        success: false,
        error: (error as Error).message
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncMultipleHotels = async () => {
    setLoading(true);
    try {
      const hotelIds = ['1', '2', '3']; // Demo hotel IDs
      const results = await synchronizationApi.syncMultipleHotels({
        hotel_ids: hotelIds.map(id => parseInt(id)),
        start_date: startDate,
        end_date: endDate
      });
      setSyncResults(results);
    } catch (error) {
      console.error('Multiple sync error:', error);
      setSyncResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckSyncStatus = async () => {
    try {
      const status = await synchronizationApi.getSyncStatus(parseInt(selectedHotelId));
      alert(`Hotel ${selectedHotelId} sync status: ${status.status}\nRoom types: ${status.room_types_count}\nPricing configured: ${status.pricing_configured}`);
    } catch (error) {
      console.error('Status check error:', error);
      alert('Error checking sync status: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔄 Hotel Synchronization</h1>
          <p className="text-gray-600 mt-1">Sync hotel data with external systems</p>
        </div>
      </div>

      {/* Configuration */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Hotel ID
            </label>
            <input
              type="text"
              value={selectedHotelId}
              onChange={(e) => setSelectedHotelId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2]"
              placeholder="Enter hotel ID"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2]"
            />
          </div>
        </div>
      </Card>

      {/* Sync Actions */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sync Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleSyncSingleHotel}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? '🔄' : '🏨'} Sync Single Hotel
          </Button>

          <Button
            variant="outline"
            onClick={handleSyncMultipleHotels}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? '🔄' : '🏨🏨'} Sync Multiple Hotels
          </Button>

          <Button
            variant="outline"
            onClick={handleCheckSyncStatus}
            className="flex items-center gap-2"
          >
            📊 Check Sync Status
          </Button>
        </div>
      </Card>

      {/* Results */}
      {syncResults.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sync Results</h2>
          <div className="space-y-4">
            {syncResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                      {result.success ? '✅' : '❌'}
                    </span>
                    <span className="font-semibold text-gray-900">
                      Hotel {result.hotel_id}
                    </span>
                  </div>
                  {result.success && result.availability && (
                    <div className="text-sm text-gray-600">
                      {result.availability.records} availability records synced
                    </div>
                  )}
                </div>

                {result.error && (
                  <p className="text-red-600 text-sm mt-2">{result.error}</p>
                )}

                {result.success && (
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Availability:</span>
                      <span className="ml-2 text-gray-600">
                        {result.availability?.records || 0} records
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Pricing:</span>
                      <span className="ml-2 text-gray-600">
                        {result.pricing?.records || 0} records
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Info */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">ℹ️ About Synchronization</h2>
        <div className="prose prose-sm max-w-none">
          <p>
            This module synchronizes hotel data (availability and pricing) with external booking systems,
            ensuring consistency across platforms.
          </p>
          <ul>
            <li><strong>Availability Sync:</strong> Syncs room availability calendar with external systems</li>
            <li><strong>Pricing Sync:</strong> Syncs room pricing and special rates</li>
            <li><strong>Multiple Hotels:</strong> Batch sync multiple hotels simultaneously</li>
            <li><strong>Status Check:</strong> Monitor sync readiness and configuration</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

