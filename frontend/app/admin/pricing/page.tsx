'use client';

import PricingCalculator from '../../../components/pricing/PricingCalculator';

export default function PricingDemoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🧮 Pricing Engine Demo</h1>
          <p className="text-gray-600 mt-1">Test and demonstrate pricing calculations</p>
        </div>
      </div>

      <PricingCalculator />
    </div>
  );
}
