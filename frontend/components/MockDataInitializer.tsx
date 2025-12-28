/**
 * Mock Data Initializer
 * Initializes localStorage with mock data on app load
 * Only runs when USE_MOCK_DATA is true
 */

'use client';

import { useEffect } from 'react';
import { initializeMockData } from '@/lib/utils/mockData';
import { API_CONFIG } from '@/lib/api/config';

export function MockDataInitializer() {
  useEffect(() => {
    // Only initialize mock data when USE_MOCK_DATA is enabled
    if (API_CONFIG.USE_MOCK_DATA) {
      initializeMockData();
      console.log('📦 Mock data initialized (USE_MOCK_DATA=true)');
    } else {
      console.log('🔌 Using real backend API (USE_MOCK_DATA=false)');
    }
  }, []);

  return null; // This component doesn't render anything
}
