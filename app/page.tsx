"use client";

import { useEffect } from "react";
import { useLocationDispatch } from "@/contexts/LocationContext";
import PhysicsScene from "./components/PhysicsScene";
import LocationCard from "./components/LocationCard";

export default function Home() {
  const dispatch = useLocationDispatch();

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

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (dispatch) {
          dispatch({
            type: "SET_LOCATION",
            payload: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            },
          });
          dispatch({
            type: "SET_LOCATION_STATUS",
            payload: "accessed",
          });
        }
      },
      () => {
        if (dispatch) {
          dispatch({
            type: "SET_LOCATION_STATUS",
            payload: "error",
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 1000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [dispatch]);

  return (
    <div className="w-full h-screen relative">
      <PhysicsScene />
      <LocationCard className="absolute bottom-4 right-4 z-10" />
    </div>
  );
}
