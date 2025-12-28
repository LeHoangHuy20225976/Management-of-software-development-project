'use client';

import { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { roomInventoryApi } from '@/lib/api/services';

interface HoldResult {
  holdId: string;
  expiresAt: string;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
}

export default function RoomHoldDemo() {
  const [loading, setLoading] = useState(false);
  const [holdResult, setHoldResult] = useState<HoldResult | null>(null);
  const [releaseResult, setReleaseResult] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    room_type_id: '1',
    check_in_date: new Date().toISOString().split('T')[0],
    check_out_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    quantity: '1',
    hold_duration_minutes: '15'
  });

  const [holdIdToRelease, setHoldIdToRelease] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateHold = async () => {
    setLoading(true);
    setHoldResult(null);
    try {
      const data = {
        roomTypeId: parseInt(formData.room_type_id),
        checkInDate: formData.check_in_date,
        checkOutDate: formData.check_out_date,
        quantity: parseInt(formData.quantity),
        holdDurationMinutes: parseInt(formData.hold_duration_minutes)
      };

      const result = await roomInventoryApi.createHold(data);
      setHoldResult({
        holdId: result.holdId,
        expiresAt: result.expiresAt,
        roomId: parseInt(formData.room_type_id), // Use room type ID as room ID for demo
        checkInDate: formData.check_in_date,
        checkOutDate: formData.check_out_date
      });
    } catch (error) {
      console.error('Create hold error:', error);
      alert('Error creating hold: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseHold = async () => {
    if (!holdIdToRelease.trim()) {
      alert('Please enter a hold ID');
      return;
    }

    setLoading(true);
    setReleaseResult(null);
    try {
      await roomInventoryApi.releaseHold(holdIdToRelease);
      setReleaseResult('Hold released successfully');
      setHoldIdToRelease('');
    } catch (error) {
      console.error('Release hold error:', error);
      setReleaseResult('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Hold */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">🔒 Create Reservation Hold</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Room Type ID
            </label>
            <Input
              type="number"
              value={formData.room_type_id}
              onChange={(e) => handleInputChange('room_type_id', e.target.value)}
              placeholder="e.g., 1"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Check-in Date
            </label>
            <Input
              type="date"
              value={formData.check_in_date}
              onChange={(e) => handleInputChange('check_in_date', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Check-out Date
            </label>
            <Input
              type="date"
              value={formData.check_out_date}
              onChange={(e) => handleInputChange('check_out_date', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Quantity
            </label>
            <Input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Hold Duration (minutes)
            </label>
            <Input
              type="number"
              value={formData.hold_duration_minutes}
              onChange={(e) => handleInputChange('hold_duration_minutes', e.target.value)}
              min="5"
              max="120"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleCreateHold}
              disabled={loading}
              className="w-full"
            >
              {loading ? '🔄 Creating...' : '🔒 Create Hold'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Hold Result */}
      {holdResult && (
        <Card>
          <h3 className="text-xl font-bold text-green-600 mb-4">✅ Hold Created Successfully</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-700">Hold ID:</span>
                <div className="font-mono text-sm bg-white px-2 py-1 rounded mt-1">
                  {holdResult.holdId}
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Expires At:</span>
                <div className="text-sm text-gray-600 mt-1">
                  {new Date(holdResult.expiresAt).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Room ID:</span>
                <div className="text-sm text-gray-600 mt-1">
                  {holdResult.roomId}
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Booking Period:</span>
                <div className="text-sm text-gray-600 mt-1">
                  {holdResult.checkInDate} → {holdResult.checkOutDate}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Release Hold */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">🔓 Release Reservation Hold</h2>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Hold ID
            </label>
            <Input
              type="text"
              value={holdIdToRelease}
              onChange={(e) => setHoldIdToRelease(e.target.value)}
              placeholder="Enter hold ID to release"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleReleaseHold}
              disabled={loading || !holdIdToRelease.trim()}
              variant="outline"
            >
              {loading ? '🔄 Releasing...' : '🔓 Release Hold'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Release Result */}
      {releaseResult && (
        <Card>
          <div className={`p-4 rounded-lg ${
            releaseResult.includes('Error')
              ? 'bg-red-50 border border-red-200'
              : 'bg-green-50 border border-green-200'
          }`}>
            <p className={`text-sm font-medium ${
              releaseResult.includes('Error') ? 'text-red-800' : 'text-green-800'
            }`}>
              {releaseResult}
            </p>
          </div>
        </Card>
      )}

      {/* Info */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">ℹ️ About Reservation Holds</h2>
        <div className="prose prose-sm max-w-none">
          <p>
            Reservation holds temporarily reserve inventory to prevent overbooking during the booking process.
          </p>
          <ul>
            <li><strong>Create Hold:</strong> Reserves rooms for a specific time period</li>
            <li><strong>Automatic Expiration:</strong> Holds expire after the specified duration</li>
            <li><strong>Release Hold:</strong> Manually release holds when no longer needed</li>
            <li><strong>Transaction Safety:</strong> Prevents race conditions and overbooking</li>
          </ul>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Typical Flow:</strong> Create hold → Process payment → Confirm booking → Release hold
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
