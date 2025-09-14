"use client";

import { useEffect } from "react";
import { useHybridLocationDispatch } from "@/contexts/HybridLocationContext";

export default function EnhancedGPSTracker() {
  const dispatch = useHybridLocationDispatch();

  useEffect(() => {
    if (!navigator.geolocation) {
      if (dispatch) {
        dispatch({
          type: "SET_LOCATION_STATUS",
          payload: "error",
        });
      }
      return;
    }

    if (dispatch) {
      dispatch({
        type: "SET_LOCATION_STATUS",
        payload: "unknown",
      });
    }

    // Use getCurrentPosition for initial fix
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (dispatch) {
          const locationData = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
            source: "gps" as const,
          };

          dispatch({
            type: "SET_GPS_LOCATION",
            payload: locationData,
          });

          // Dispatch custom event for accelerometer tracker
          window.dispatchEvent(
            new CustomEvent("locationUpdate", {
              detail: locationData,
            })
          );
        }
      },
      (error) => {
        console.error("Initial GPS Error:", error);
        if (dispatch) {
          dispatch({
            type: "SET_LOCATION_STATUS",
            payload: "error",
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Then use watchPosition for continuous updates
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (dispatch) {
          const locationData = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
            source: "gps" as const,
          };

          dispatch({
            type: "SET_GPS_LOCATION",
            payload: locationData,
          });

          // Dispatch custom event for accelerometer tracker
          window.dispatchEvent(
            new CustomEvent("locationUpdate", {
              detail: locationData,
            })
          );
        }
      },
      (error) => {
        console.error("GPS Watch Error:", error);
        if (dispatch) {
          dispatch({
            type: "SET_LOCATION_STATUS",
            payload: "error",
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000, // Accept cached position up to 1 second old
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [dispatch]);

  return null; // This component doesn't render anything
}
