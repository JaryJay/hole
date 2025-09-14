// Location data types based on Browser Geolocation API
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface LocationPosition {
  coords: LocationCoordinates;
  timestamp: number;
}

// Location error types matching GeolocationPositionError
export enum LocationErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE = 'POSITION_UNAVAILABLE', 
  TIMEOUT = 'TIMEOUT',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  HTTPS_REQUIRED = 'HTTPS_REQUIRED',
  UNKNOWN = 'UNKNOWN'
}

export interface LocationError {
  type: LocationErrorType;
  message: string;
  code?: number;
}

// Location state
export interface LocationState {
  position: LocationPosition | null;
  error: LocationError | null;
  isLoading: boolean;
  isSupported: boolean;
  permission: PermissionState | null;
}

// Context value type
export interface LocationContextValue extends LocationState {
  getCurrentPosition: () => Promise<LocationPosition>;
  watchPosition: () => number | null;
  clearWatch: (watchId: number) => void;
  requestPermission: () => Promise<PermissionState>;
  refresh: () => void;
}

// Configuration options for high-accuracy GPS
export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
  requestPermissionOnMount?: boolean;
}

export const DEFAULT_LOCATION_OPTIONS: Required<LocationOptions> = {
  enableHighAccuracy: true, // Use GPS for precise coordinates
  timeout: 20000, // 20 seconds for production - allows time for GPS lock
  maximumAge: 60000, // 1 minute cache for GPS coordinates
  watchPosition: false,
  requestPermissionOnMount: true,
};