"use client";

import { useEffect, useState, useRef } from "react";
import { useHybridLocationDispatch } from "@/contexts/HybridLocationContext";

// Extended DeviceMotionEvent with permission request method
interface DeviceMotionEventWithPermission extends DeviceMotionEvent {
  requestPermission?: () => Promise<PermissionState>;
}

// Extended DeviceOrientationEvent with permission request method
interface DeviceOrientationEventWithPermission extends DeviceOrientationEvent {
  requestPermission?: () => Promise<PermissionState>;
}

// Permission state type
type PermissionState = "granted" | "denied" | "prompt";

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

interface GyroscopeData {
  alpha: number; // Rotation around z-axis (compass heading)
  beta: number; // Rotation around x-axis (front-to-back tilt)
  gamma: number; // Rotation around y-axis (left-to-right tilt)
  timestamp: number;
}

interface MovementVector {
  x: number;
  z: number;
  magnitude: number;
}

interface DeviceOrientation {
  heading: number; // 0-360 degrees
  pitch: number; // -180 to 180 degrees
  roll: number; // -90 to 90 degrees
}

export default function AccelerometerTracker() {
  const dispatch = useHybridLocationDispatch();
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const lastAccelerometerData = useRef<AccelerometerData | null>(null);
  const lastGyroscopeData = useRef<GyroscopeData | null>(null);
  const lastLocation = useRef<{ lat: number; lng: number } | null>(null);
  const deviceOrientation = useRef<DeviceOrientation>({
    heading: 0,
    pitch: 0,
    roll: 0,
  });
  const accumulatedMovement = useRef<MovementVector>({
    x: 0,
    z: 0,
    magnitude: 0,
  });

  // Process gyroscope data to update device orientation
  const processGyroscopeData = (data: GyroscopeData): void => {
    if (!lastGyroscopeData.current) {
      lastGyroscopeData.current = data;
      return;
    }

    const timeDelta =
      (data.timestamp - lastGyroscopeData.current.timestamp) / 1000;
    if (timeDelta <= 0) return;

    // Update device orientation based on gyroscope data
    deviceOrientation.current = {
      heading: data.alpha || 0,
      pitch: data.beta || 0,
      roll: data.gamma || 0,
    };

    lastGyroscopeData.current = data;
  };

  // Convert accelerometer data to movement vector using device orientation
  const processAccelerometerData = (
    data: AccelerometerData
  ): MovementVector => {
    if (!lastAccelerometerData.current) {
      lastAccelerometerData.current = data;
      return { x: 0, z: 0, magnitude: 0 };
    }

    const timeDelta =
      (data.timestamp - lastAccelerometerData.current.timestamp) / 1000;
    if (timeDelta <= 0) return { x: 0, z: 0, magnitude: 0 };

    // Calculate acceleration (difference in velocity)
    const accelX = (data.x - lastAccelerometerData.current.x) / timeDelta;
    const accelY = (data.y - lastAccelerometerData.current.y) / timeDelta;
    const accelZ = (data.z - lastAccelerometerData.current.z) / timeDelta;

    // Convert to movement (integrate acceleration to get velocity, then to position)
    const scale = 0.01; // Adjust this to control sensitivity
    const rawMovementX = accelX * scale * timeDelta;
    const rawMovementZ = accelZ * scale * timeDelta;

    // Apply device orientation to convert device-relative movement to world-relative movement
    const heading = (deviceOrientation.current.heading * Math.PI) / 180; // Convert to radians
    const cos = Math.cos(heading);
    const sin = Math.sin(heading);

    // Rotate the movement vector based on device heading
    const movementX = rawMovementX * cos - rawMovementZ * sin;
    const movementZ = rawMovementX * sin + rawMovementZ * cos;

    lastAccelerometerData.current = data;

    return {
      x: movementX,
      z: movementZ,
      magnitude: Math.sqrt(movementX * movementX + movementZ * movementZ),
    };
  };

  // Update location based on accumulated movement
  const updateLocationFromMovement = (movement: MovementVector) => {
    if (!lastLocation.current) return;

    // Convert movement to lat/lng changes
    // Approximate conversion: 1 degree ≈ 111,000 meters
    const metersPerDegree = 111000;
    const latChange = movement.z / metersPerDegree;
    const lngChange =
      movement.x /
      (metersPerDegree * Math.cos((lastLocation.current.lat * Math.PI) / 180));

    const newLocation = {
      lat: lastLocation.current.lat + latChange,
      lng: lastLocation.current.lng + lngChange,
      accuracy: 10, // Estimated accuracy for accelerometer-based movement
      timestamp: Date.now(),
    };

    if (dispatch) {
      dispatch({
        type: "SET_ACCELEROMETER_LOCATION",
        payload: {
          ...newLocation,
          source: "accelerometer" as const,
        },
      });
    }

    lastLocation.current = newLocation;
  };

  useEffect(() => {
    // Check if both accelerometer and gyroscope are supported
    if (
      typeof window !== "undefined" &&
      "DeviceMotionEvent" in window &&
      "DeviceOrientationEvent" in window
    ) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupported || !isEnabled) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;

      const { x, y, z } = event.accelerationIncludingGravity;
      const accelerometerData: AccelerometerData = {
        x: x || 0,
        y: y || 0,
        z: z || 0,
        timestamp: Date.now(),
      };

      const movement = processAccelerometerData(accelerometerData);

      // Accumulate movement
      accumulatedMovement.current.x += movement.x;
      accumulatedMovement.current.z += movement.z;
      accumulatedMovement.current.magnitude += movement.magnitude;

      // Update location every 0.5 seconds or when movement is significant
      if (
        accumulatedMovement.current.magnitude > 0.1 ||
        Date.now() % 500 < 50
      ) {
        updateLocationFromMovement(accumulatedMovement.current);
        // Reset accumulated movement
        accumulatedMovement.current = { x: 0, z: 0, magnitude: 0 };
      }
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const gyroscopeData: GyroscopeData = {
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0,
        timestamp: Date.now(),
      };

      processGyroscopeData(gyroscopeData);
    };

    // Request permission for iOS 13+ devices
    const requestPermissions = async () => {
      try {
        let motionPermission: PermissionState = "granted";
        let orientationPermission: PermissionState = "granted";

        // Request motion permission
        const DeviceMotionEventClass =
          DeviceMotionEvent as unknown as DeviceMotionEventWithPermission;
        if (typeof DeviceMotionEventClass.requestPermission === "function") {
          motionPermission = await DeviceMotionEventClass.requestPermission();
        }

        // Request orientation permission
        const DeviceOrientationEventClass =
          DeviceOrientationEvent as unknown as DeviceOrientationEventWithPermission;
        if (
          typeof DeviceOrientationEventClass.requestPermission === "function"
        ) {
          orientationPermission =
            await DeviceOrientationEventClass.requestPermission();
        }

        if (
          motionPermission === "granted" &&
          orientationPermission === "granted"
        ) {
          setIsEnabled(true);
          window.addEventListener("devicemotion", handleMotion);
          window.addEventListener("deviceorientation", handleOrientation);
        } else {
          console.error("Permissions denied:", {
            motionPermission,
            orientationPermission,
          });
        }
      } catch (error) {
        console.error("Permission request failed:", error);
      }
    };

    requestPermissions();

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [isSupported, isEnabled, dispatch]);

  // Listen for GPS location updates to set the base location
  useEffect(() => {
    const handleLocationUpdate = (event: CustomEvent) => {
      const location = event.detail;
      if (location && location.lat && location.lng) {
        lastLocation.current = { lat: location.lat, lng: location.lng };
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

  return null; // This component doesn't render anything
}
