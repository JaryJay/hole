"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useState } from "react";
import Ground from "./Ground";
import CameraController from "./CameraController";
import {
  useLocation,
  type LocationContextType,
} from "@/contexts/LocationContext";

const INITIAL_HOLE_SIZE = 0.5; // Initial hole size - start small
import ObjectSpawner from "./ObjectSpawner";

function Scene({
  onGroundPositionChange,
  cameraPosition,
  groundPosition,
  holeSize,
  onObjectDespawn,
  physicalLocation,
}: {
  onGroundPositionChange: (position: [number, number, number]) => void;
  cameraPosition: [number, number, number];
  groundPosition: [number, number, number];
  holeSize: number;
  onObjectDespawn: () => void;
  physicalLocation: { lat: number; lng: number } | null;
}) {
  return (
    <>
      <CameraController
        cameraPosition={cameraPosition}
        groundPosition={groundPosition}
      />
      {/* Enhanced Lighting Setup */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.8}
        color="#FFF1B9"
        castShadow
      />
      <directionalLight position={[-10, 5, 5]} intensity={0.3} />
      <pointLight position={[0, 8, 0]} intensity={0.5} color="#ffaa44" />

      {/* Ground plane */}
      <Ground
        onPositionChange={onGroundPositionChange}
        holeSize={holeSize}
        physicalLocation={physicalLocation}
      />

      {/* Dynamic Object Spawning System */}
      <ObjectSpawner 
        holeSize={holeSize} 
        playerPosition={groundPosition}
        onObjectDespawn={onObjectDespawn} 
      />
    </>
  );
}

export default function PhysicsScene() {
  const locationData: LocationContextType | undefined = useLocation();
  const [groundPosition, setGroundPosition] = useState<
    [number, number, number]
  >([0, -2, 0]);
  const [holeSize, setHoleSize] = useState(INITIAL_HOLE_SIZE); // Initial hole radius

  // Calculate camera position from ground position with moderate zoom out based on hole size
  const baseHeight = 13;
  const baseDistance = 2;
  const zoomFactor = holeSize * 1.0; // Moderate zoom out factor (halfway between 0.5 and 1.5)

  const cameraOffset: [number, number, number] = [
    0,
    baseHeight + zoomFactor * 0.5, // Increase height as hole grows
    baseDistance + zoomFactor * 1.0, // Moderate distance increase (halfway between 0.8 and 1.2)
  ];
  const cameraPosition: [number, number, number] = [
    groundPosition[0] + cameraOffset[0],
    groundPosition[1] + cameraOffset[1],
    groundPosition[2] + cameraOffset[2],
  ];

  const handleGroundPositionChange = (position: [number, number, number]) => {
    setGroundPosition(position);
  };

  const onObjectDespawn = () => {
    setHoleSize((prevSize) => prevSize + 0.2); // Increase hole size by 0.2 units
  };

  // Calculate FOV based on hole size for moderate zoom effect
  const baseFOV = 60;
  const fovAdjustment = holeSize * 3; // Moderate FOV increase (halfway between 2 and 4)
  const currentFOV = Math.min(baseFOV + fovAdjustment, 105); // Cap at 105 degrees (halfway between 90 and 120)

  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: cameraPosition, fov: currentFOV }}>
        <Physics gravity={[0, -9.81, 0]}>
          <Scene
            onGroundPositionChange={handleGroundPositionChange}
            cameraPosition={cameraPosition}
            groundPosition={groundPosition}
            holeSize={holeSize}
            onObjectDespawn={onObjectDespawn}
            physicalLocation={locationData?.position ?? null}
          />
        </Physics>
      </Canvas>
    </div>
  );
}
