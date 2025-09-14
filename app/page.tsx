"use client";

import PhysicsScene from "./components/PhysicsScene";
import LocationCard from "./components/LocationCard";
import EnhancedGPSTracker from "./components/EnhancedGPSTracker";
import AccelerometerTracker from "./components/AccelerometerTracker";

export default function Home() {
  return (
    <div className="w-full h-screen relative">
      <PhysicsScene />
      <LocationCard className="absolute bottom-4 right-4 z-10" />
      <EnhancedGPSTracker />
      <AccelerometerTracker />
    </div>
  );
}
