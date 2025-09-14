"use client";

import { useEffect } from "react";
import { useLocation, useLocationDispatch } from "@/contexts/LocationContext";
import PhysicsScene from "./components/PhysicsScene";

export default function Home() {
  const location = useLocation();
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
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [dispatch]);

  return (
    <div className="w-full h-screen">
      <PhysicsScene />
      <div>
        <p>Location Status: {location?.locationStatus}</p>
        <p>Latitude: {location?.position?.lat}</p>
        <p>Longitude: {location?.position?.lng}</p>
      </div>
    </div>
  );
}
