'use client';

import { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { formatCurrency } from '@/lib/utils/format';
import { pricingEngineApi } from '@/lib/api/services';

interface PricingBreakdown {
  totalPrice: number;
  breakdown: {
    nights: number;
    guests: number;
    subtotal: number;
    totalDiscount: number;
    finalTotal: number;
    dailyBreakdown: Array<{
      date: string;
      base_price: number;
      event?: string | null;
      discount_rate: number;
      discount_amount: number;
      final_price: number;
    }>;
    promoCode: string | null;
    eventApplied: string | null;
  };
}

export default function PricingCalculator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PricingBreakdown | null>(null);

  const [formData, setFormData] = useState({
    type_id: '1',
    check_in_date: new Date().toISOString().split('T')[0],
    check_out_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    guests: '2',
    promo_code: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const data = {
        type_id: parseInt(formData.type_id),
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        guests: parseInt(formData.guests),
        ...(formData.promo_code && { promo_code: formData.promo_code })
      };

      const pricingResult = await pricingEngineApi.calculatePrice(data);
      setResult(pricingResult);
    } catch (error) {
      console.error('Pricing calculation error:', error);
      alert('Error calculating price: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">💰 Pricing Engine Calculator</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Room Type ID
            </label>
            <Input
              type="number"
              value={formData.type_id}
              onChange={(e) => handleInputChange('type_id', e.target.value)}
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
              Number of Guests
            </label>
            <Input
              type="number"
              value={formData.guests}
              onChange={(e) => handleInputChange('guests', e.target.value)}
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Promo Code (Optional)
            </label>
            <Input
              type="text"
              value={formData.promo_code}
              onChange={(e) => handleInputChange('promo_code', e.target.value)}
              placeholder="e.g., SUMMER10"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleCalculate}
              disabled={loading}
              className="w-full"
            >
              {loading ? '🔄 Calculating...' : '🧮 Calculate Price'}
            </Button>
          </div>
        </div>
      </Card>

      {result && (
        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Pricing Result</h3>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(result.totalPrice)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Price</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {result.breakdown.nights}
              </div>
              <div className="text-sm text-gray-600 mt-1">Nights</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {result.breakdown.guests}
              </div>
              <div className="text-sm text-gray-600 mt-1">Guests</div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Price Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-right py-2">Base Price</th>
                    <th className="text-center py-2">Event</th>
                    <th className="text-right py-2">Discount</th>
                    <th className="text-right py-2">Final Price</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.dailyBreakdown.map((day, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{day.date}</td>
                      <td className="text-right py-2">{formatCurrency(day.base_price)}</td>
                      <td className="text-center py-2">
                        {day.event ? (
                          <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                            {day.event}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="text-right py-2">
                        {day.discount_amount > 0 ? (
                          <span className="text-green-600">
                            -{formatCurrency(day.discount_amount)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="text-right py-2 font-semibold">
                        {formatCurrency(day.final_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(result.breakdown.subtotal)}
              </div>
              <div className="text-xs text-gray-600">Subtotal</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                -{formatCurrency(result.breakdown.totalDiscount)}
              </div>
              <div className="text-xs text-gray-600">Total Discount</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency(result.breakdown.finalTotal)}
              </div>
              <div className="text-xs text-gray-600">Final Total</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {result.breakdown.promoCode || 'None'}
              </div>
              <div className="text-xs text-gray-600">Promo Code</div>
            </div>
          </div>

          {result.breakdown.eventApplied && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                🎉 <strong>Event Applied:</strong> {result.breakdown.eventApplied}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Info */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">ℹ️ About Pricing Engine</h2>
        <div className="prose prose-sm max-w-none">
          <p>
            The Pricing Engine calculates room prices with dynamic rules including:
          </p>
          <ul>
            <li><strong>Base Pricing:</strong> Standard room rates</li>
            <li><strong>Event Pricing:</strong> Special rates for events/promotions</li>
            <li><strong>Dynamic Pricing:</strong> Weekend, holiday, and seasonal adjustments</li>
            <li><strong>Discounts:</strong> Base discounts and promo codes</li>
            <li><strong>Guest Adjustments:</strong> Pricing based on occupancy</li>
          </ul>
          <p className="text-sm text-gray-600 mt-2">
            Try promo codes: <code>SUMMER10</code>, <code>WINTER15</code>, <code>EARLY20</code>
          </p>
        </div>
      </Card>
    </div>
  );
}
