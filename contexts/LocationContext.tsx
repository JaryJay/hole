'use client';

import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import {
  LocationContextValue,
  LocationState,
  LocationOptions,
  LocationPosition,
  LocationError,
  LocationErrorType,
  DEFAULT_LOCATION_OPTIONS
} from '@/types/location';
import {
  getCurrentPosition,
  watchPosition,
  clearWatch,
  requestGeolocationPermission,
  isGeolocationSupported,
  isGeolocationSecure
} from '@/lib/location-utils';

// Create the context
const LocationContext = createContext<LocationContextValue | null>(null);

interface LocationProviderProps {
  children: React.ReactNode;
  options?: LocationOptions;
}

export function LocationProvider({ children, options = {} }: LocationProviderProps) {
  const mergedOptions = { ...DEFAULT_LOCATION_OPTIONS, ...options };
  
  // State
  const [state, setState] = useState<LocationState>({
    position: null,
    error: null,
    isLoading: false,
    isSupported: false,
    permission: null
  });

  // Refs to track watches and prevent memory leaks
  const watchIdRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  // Initialize geolocation support check
  useEffect(() => {
    const isSupported = isGeolocationSupported() && isGeolocationSecure();
    setState(prev => ({ ...prev, isSupported }));

    if (!isSupported) {
      setState(prev => ({
        ...prev,
        error: {
          type: (!isGeolocationSupported() ? 'NOT_SUPPORTED' : 'HTTPS_REQUIRED') as LocationErrorType,
          message: !isGeolocationSupported()
            ? 'Geolocation is not supported by this browser.'
            : 'Geolocation requires HTTPS. Please access the site using HTTPS.'
        }
      }));
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Get current position
  const handleGetCurrentPosition = useCallback(async (): Promise<LocationPosition> => {
    if (!mountedRef.current) return Promise.reject(new Error('Component unmounted'));

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const position = await getCurrentPosition(mergedOptions);
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          position,
          isLoading: false,
          error: null
        }));
      }
      
      return position;
    } catch (error) {
      const locationError = error as LocationError;
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          error: locationError,
          isLoading: false
        }));
      }
      
      throw locationError;
    }
  }, [mergedOptions]);

  // Watch position
  const handleWatchPosition = useCallback((): number | null => {
    if (!state.isSupported || watchIdRef.current !== null) {
      return watchIdRef.current;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const watchId = watchPosition(
      (position) => {
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            position,
            isLoading: false,
            error: null
          }));
        }
      },
      (error) => {
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            error,
            isLoading: false
          }));
        }
      },
      mergedOptions
    );

    watchIdRef.current = watchId;
    return watchId;
  }, [state.isSupported, mergedOptions]);

  // Clear watch
  const handleClearWatch = useCallback((watchId: number) => {
    clearWatch(watchId);
    if (watchIdRef.current === watchId) {
      watchIdRef.current = null;
    }
  }, []);

  // Request permission
  const handleRequestPermission = useCallback(async (): Promise<PermissionState> => {
    if (!state.isSupported) {
      return 'denied';
    }

    try {
      const permission = await requestGeolocationPermission();
      
      if (mountedRef.current) {
        setState(prev => ({ ...prev, permission }));
      }
      
      return permission;
    } catch (error) {
      console.error('Failed to request geolocation permission:', error);
      return 'denied';
    }
  }, [state.isSupported]);

  // Refresh location
  const handleRefresh = useCallback(() => {
    handleGetCurrentPosition().catch(console.error);
  }, [handleGetCurrentPosition]);

  // Auto-request permission and location on mount
  useEffect(() => {
    if (!state.isSupported || !mergedOptions.requestPermissionOnMount) {
      return;
    }

    const initializeLocation = async () => {
      try {
        const permission = await handleRequestPermission();
        
        if (permission === 'granted') {
          if (mergedOptions.watchPosition) {
            handleWatchPosition();
          } else {
            await handleGetCurrentPosition();
          }
        }
      } catch (error) {
        console.error('Failed to initialize location:', error);
      }
    };

    initializeLocation();
  }, [
    state.isSupported,
    mergedOptions.requestPermissionOnMount,
    mergedOptions.watchPosition,
    handleRequestPermission,
    handleWatchPosition,
    handleGetCurrentPosition
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (watchIdRef.current !== null) {
        clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Context value
  const contextValue: LocationContextValue = {
    ...state,
    getCurrentPosition: handleGetCurrentPosition,
    watchPosition: handleWatchPosition,
    clearWatch: handleClearWatch,
    requestPermission: handleRequestPermission,
    refresh: handleRefresh
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}

export { LocationContext };
export default LocationContext;