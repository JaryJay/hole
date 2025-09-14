"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useReducer,
  useEffect,
} from "react";

type GeolocationPosition = {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
  source: "gps" | "accelerometer" | "hybrid";
};

type LocationStatus = "accessed" | "denied" | "unknown" | "error";

export interface HybridLocationContextType {
  locationStatus: LocationStatus;
  position: GeolocationPosition | null;
  gpsPosition: GeolocationPosition | null;
  accelerometerPosition: GeolocationPosition | null;
  lastUpdateTime: number;
}

const HybridLocationContext = createContext<
  HybridLocationContextType | undefined
>(undefined);

const HybridLocationDispatchContext = createContext<
  React.Dispatch<HybridLocationAction> | undefined
>(undefined);

interface HybridLocationProviderProps {
  children: ReactNode;
}

export function HybridLocationProvider({
  children,
}: HybridLocationProviderProps) {
  const [location, dispatch] = useReducer(
    hybridLocationReducer,
    initialLocation
  );

  // Listen for custom location update events
  useEffect(() => {
    const handleLocationUpdate = (event: CustomEvent) => {
      const locationData = event.detail;
      if (locationData) {
        dispatch({
          type: "SET_LOCATION",
          payload: locationData,
        });
      }
    };

    window.addEventListener(
      "locationUpdate",
      handleLocationUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        "locationUpdate",
        handleLocationUpdate as EventListener
      );
    };
  }, []);

  return (
    <HybridLocationContext.Provider value={location}>
      <HybridLocationDispatchContext.Provider value={dispatch}>
        {children}
      </HybridLocationDispatchContext.Provider>
    </HybridLocationContext.Provider>
  );
}

export function useHybridLocation() {
  return useContext(HybridLocationContext);
}

export function useHybridLocationDispatch() {
  return useContext(HybridLocationDispatchContext);
}

type HybridLocationAction =
  | { type: "SET_LOCATION"; payload: GeolocationPosition }
  | { type: "SET_GPS_LOCATION"; payload: GeolocationPosition }
  | { type: "SET_ACCELEROMETER_LOCATION"; payload: GeolocationPosition }
  | { type: "SET_LOCATION_STATUS"; payload: LocationStatus }
  | { type: "CLEAR_LOCATION" };

function hybridLocationReducer(
  location: HybridLocationContextType,
  action: HybridLocationAction
): HybridLocationContextType {
  switch (action.type) {
    case "SET_LOCATION":
      return {
        ...location,
        locationStatus: "accessed",
        position: action.payload,
        lastUpdateTime: Date.now(),
      };
    case "SET_GPS_LOCATION":
      return {
        ...location,
        locationStatus: "accessed",
        gpsPosition: action.payload,
        position: action.payload, // Use GPS as primary when available
        lastUpdateTime: Date.now(),
      };
    case "SET_ACCELEROMETER_LOCATION":
      return {
        ...location,
        locationStatus: "accessed",
        accelerometerPosition: action.payload,
        // Only use accelerometer if GPS is not available or very old
        position:
          location.gpsPosition &&
          Date.now() - (location.gpsPosition.timestamp || 0) < 5000
            ? location.position
            : action.payload,
        lastUpdateTime: Date.now(),
      };
    case "SET_LOCATION_STATUS":
      return {
        ...location,
        locationStatus: action.payload,
      };
    case "CLEAR_LOCATION":
      return {
        ...location,
        locationStatus: "unknown",
        position: null,
        gpsPosition: null,
        accelerometerPosition: null,
        lastUpdateTime: 0,
      };
    default:
      return location;
  }
}

const initialLocation: HybridLocationContextType = {
  locationStatus: "unknown",
  position: null,
  gpsPosition: null,
  accelerometerPosition: null,
  lastUpdateTime: 0,
};
