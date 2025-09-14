import { LocationError, LocationErrorType, LocationPosition, LocationOptions } from '@/types/location';

/**
 * Check if geolocation is supported and available
 */
export function isGeolocationSupported(): boolean {
  return 'navigator' in globalThis && 'geolocation' in navigator;
}

/**
 * Check if the current context supports geolocation (HTTPS requirement)
 */
export function isGeolocationSecure(): boolean {
  // Allow localhost for development
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.endsWith('.local');
    
    // Require HTTPS in production, allow HTTP on localhost
    return window.location.protocol === 'https:' || isLocalhost;
  }
  return false;
}

/**
 * Convert GeolocationPositionError to our LocationError type
 */
export function mapGeolocationError(error: GeolocationPositionError): LocationError {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return {
        type: LocationErrorType.PERMISSION_DENIED,
        message: 'Location access denied by user. Please enable location permissions in your browser settings.',
        code: error.code
      };
    case error.POSITION_UNAVAILABLE:
      return {
        type: LocationErrorType.POSITION_UNAVAILABLE,
        message: 'Location information unavailable. This might be due to GPS being disabled or poor signal.',
        code: error.code
      };
    case error.TIMEOUT:
      return {
        type: LocationErrorType.TIMEOUT,
        message: 'Location request timed out. Please try again or check your GPS signal.',
        code: error.code
      };
    default:
      return {
        type: LocationErrorType.UNKNOWN,
        message: error.message || 'Unknown location error occurred.',
        code: error.code
      };
  }
}

/**
 * Get current position with proper error handling
 */
export function getCurrentPosition(options: LocationOptions = {}): Promise<LocationPosition> {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!isGeolocationSupported()) {
      reject({
        type: LocationErrorType.NOT_SUPPORTED,
        message: 'Geolocation is not supported by this browser.'
      });
      return;
    }

    // Check HTTPS requirement
    if (!isGeolocationSecure()) {
      reject({
        type: LocationErrorType.HTTPS_REQUIRED,
        message: 'Geolocation requires HTTPS. Please access the site using HTTPS.'
      });
      return;
    }

    const positionOptions: PositionOptions = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 20000,
      maximumAge: options.maximumAge ?? 60000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationPosition: LocationPosition = {
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed
          },
          timestamp: position.timestamp
        };
        resolve(locationPosition);
      },
      (error) => {
        reject(mapGeolocationError(error));
      },
      positionOptions
    );
  });
}

/**
 * Watch position with error handling
 */
export function watchPosition(
  onSuccess: (position: LocationPosition) => void,
  onError: (error: LocationError) => void,
  options: LocationOptions = {}
): number | null {
  if (!isGeolocationSupported() || !isGeolocationSecure()) {
    onError({
      type: !isGeolocationSupported() ? LocationErrorType.NOT_SUPPORTED : LocationErrorType.HTTPS_REQUIRED,
      message: !isGeolocationSupported() 
        ? 'Geolocation is not supported by this browser.'
        : 'Geolocation requires HTTPS. Please access the site using HTTPS.'
    });
    return null;
  }

  const positionOptions: PositionOptions = {
    enableHighAccuracy: options.enableHighAccuracy ?? true,
    timeout: options.timeout ?? 20000,
    maximumAge: options.maximumAge ?? 60000
  };

  return navigator.geolocation.watchPosition(
    (position) => {
      const locationPosition: LocationPosition = {
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed
        },
        timestamp: position.timestamp
      };
      onSuccess(locationPosition);
    },
    (error) => {
      onError(mapGeolocationError(error));
    },
    positionOptions
  );
}

/**
 * Clear position watch
 */
export function clearWatch(watchId: number): void {
  if (isGeolocationSupported()) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Request geolocation permission (for browsers that support it)
 */
export async function requestGeolocationPermission(): Promise<PermissionState> {
  if ('permissions' in navigator) {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    } catch (error) {
      // Fallback for browsers that don't support permissions API
      console.warn('Permissions API not supported:', error);
    }
  }
  
  // Fallback: try to get position to trigger permission prompt
  try {
    await getCurrentPosition({ timeout: 1000, maximumAge: Infinity });
    return 'granted';
  } catch (error: unknown) {
    const locationError = error as LocationError;
    if (locationError.type === LocationErrorType.PERMISSION_DENIED) {
      return 'denied';
    }
    return 'prompt';
  }
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(
  latitude: number, 
  longitude: number, 
  precision: number = 6
): string {
  return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}