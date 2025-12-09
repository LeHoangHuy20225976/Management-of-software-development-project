/**
 * Mock Data Initializer
 * Initializes localStorage with mock data on app load
 */

'use client';

import { useEffect } from 'react';
import { initializeMockData } from '@/lib/utils/mockData';

export function MockDataInitializer() {
  useEffect(() => {
    // Initialize mock data when app loads
    initializeMockData();
  }, []);

  return null; // This component doesn't render anything
}
