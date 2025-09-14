"use client";

import { createContext, ReactNode, useContext, useReducer } from "react";

type GeolocationPosition = {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
};

type LocationStatus = "accessed" | "denied" | "unknown" | "error";

export interface LocationContextType {
  locationStatus: LocationStatus;
  position: GeolocationPosition | null;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

const LocationDispatchContext = createContext<
  React.Dispatch<LocationAction> | undefined
>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [location, dispatch] = useReducer(locationReducer, initialLocation);

  return (
    <LocationContext.Provider value={location}>
      <LocationDispatchContext.Provider value={dispatch}>
        {children}
      </LocationDispatchContext.Provider>
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}

export function useLocationDispatch() {
  return useContext(LocationDispatchContext);
}

type LocationAction =
  | { type: "SET_LOCATION"; payload: GeolocationPosition }
  | { type: "SET_LOCATION_STATUS"; payload: LocationStatus }
  | { type: "CLEAR_LOCATION" };

function locationReducer(
  location: LocationContextType,
  action: LocationAction
): LocationContextType {
  switch (action.type) {
    case "SET_LOCATION":
      return {
        ...location,
        locationStatus: "accessed",
        position: action.payload,
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
      };
    default:
      return location;
  }
}

const initialLocation: LocationContextType = {
  locationStatus: "unknown",
  position: null,
};
