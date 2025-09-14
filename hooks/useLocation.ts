'use client';

import { useContext } from 'react';
import { LocationContext } from '@/contexts/LocationContext';
import { LocationContextValue } from '@/types/location';

/**
 * Custom hook to use the location context
 * Throws an error if used outside of LocationProvider
 */
export function useLocation(): LocationContextValue {
  const context = useContext(LocationContext);
  
  if (!context) {
    throw new Error(
      'useLocation must be used within a LocationProvider. ' +
      'Make sure to wrap your app or component with <LocationProvider>.'
    );
  }
  
  return context;
}

/**
 * Safe version that returns null if context is not available
 * Useful for optional location features
 */
export function useLocationOptional(): LocationContextValue | null {
  const context = useContext(LocationContext);
  return context;
}

export default useLocation;