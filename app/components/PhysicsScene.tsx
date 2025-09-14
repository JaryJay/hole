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

const INITIAL_HOLE_SIZE = 2; // Initial hole size (matching Ground component)
import Tree from "./Tree";
import PineTree from "./PineTree";
import LargeTree from "./LargeTree";
import Goose from "./Goose";
import VillageHouse from "./VillageHouse";

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

      {/* Beautiful Nature Scene Setup */}

      {/* Forest Border - Large Trees forming a natural boundary */}
      <LargeTree position={[-18, 2, -12]} onDespawn={onObjectDespawn} />
      <LargeTree position={[-15, 2, -15]} onDespawn={onObjectDespawn} />
      <LargeTree position={[-12, 2, -18]} onDespawn={onObjectDespawn} />
      <LargeTree position={[-9, 2, -21]} onDespawn={onObjectDespawn} />
      <LargeTree position={[-6, 2, -24]} onDespawn={onObjectDespawn} />
      <LargeTree position={[18, 2, -12]} onDespawn={onObjectDespawn} />
      <LargeTree position={[15, 2, -15]} onDespawn={onObjectDespawn} />
      <LargeTree position={[12, 2, -18]} onDespawn={onObjectDespawn} />
      <LargeTree position={[9, 2, -21]} onDespawn={onObjectDespawn} />
      <LargeTree position={[6, 2, -24]} onDespawn={onObjectDespawn} />
      <LargeTree position={[-18, 2, 12]} onDespawn={onObjectDespawn} />
      <LargeTree position={[-15, 2, 15]} onDespawn={onObjectDespawn} />
      <LargeTree position={[-12, 2, 18]} onDespawn={onObjectDespawn} />
      <LargeTree position={[-9, 2, 21]} onDespawn={onObjectDespawn} />
      <LargeTree position={[-6, 2, 24]} onDespawn={onObjectDespawn} />
      <LargeTree position={[18, 2, 12]} onDespawn={onObjectDespawn} />
      <LargeTree position={[15, 2, 15]} onDespawn={onObjectDespawn} />
      <LargeTree position={[12, 2, 18]} onDespawn={onObjectDespawn} />
      <LargeTree position={[9, 2, 21]} onDespawn={onObjectDespawn} />
      <LargeTree position={[6, 2, 24]} onDespawn={onObjectDespawn} />

      {/* Pine Forest Area - Northwest */}
      <PineTree position={[-12, 2, -9]} onDespawn={onObjectDespawn} />
      <PineTree position={[-15, 2, -6]} onDespawn={onObjectDespawn} />
      <PineTree position={[-9, 2, -12]} onDespawn={onObjectDespawn} />
      <PineTree position={[-6, 2, -15]} onDespawn={onObjectDespawn} />

      {/* Pine Forest Area - Southeast */}
      <PineTree position={[12, 2, 9]} onDespawn={onObjectDespawn} />
      <PineTree position={[15, 2, 6]} onDespawn={onObjectDespawn} />
      <PineTree position={[9, 2, 12]} onDespawn={onObjectDespawn} />
      <PineTree position={[6, 2, 15]} onDespawn={onObjectDespawn} />

      {/* Mixed Tree Grove - Southwest */}
      <Tree position={[-9, 2, 6]} onDespawn={onObjectDespawn} />
      <Tree position={[-6, 2, 9]} onDespawn={onObjectDespawn} />
      <Tree position={[-12, 2, 3]} onDespawn={onObjectDespawn} />
      <PineTree position={[-3, 2, 12]} onDespawn={onObjectDespawn} />

      {/* Mixed Tree Grove - Northeast */}
      <Tree position={[9, 2, -6]} onDespawn={onObjectDespawn} />
      <Tree position={[6, 2, -9]} onDespawn={onObjectDespawn} />
      <Tree position={[12, 2, -3]} onDespawn={onObjectDespawn} />
      <PineTree position={[3, 2, -12]} onDespawn={onObjectDespawn} />

      {/* Village Settlement - Central area with houses */}
      <VillageHouse position={[-6, 3, 2]} onDespawn={onObjectDespawn} />
      <VillageHouse position={[6, 3, 2]} onDespawn={onObjectDespawn} />
      <VillageHouse position={[0, 3, -4]} onDespawn={onObjectDespawn} />
      <VillageHouse position={[-3, 3, 6]} onDespawn={onObjectDespawn} />
      <VillageHouse position={[3, 3, 6]} onDespawn={onObjectDespawn} />

      {/* Natural Goose Flocks - Scattered around the scene */}
      {/* Main flock near village */}
      <Goose position={[0, 8, 0]} onDespawn={onObjectDespawn} />
      <Goose position={[2, 8, 1]} onDespawn={onObjectDespawn} />
      <Goose position={[-2, 8, 1]} onDespawn={onObjectDespawn} />
      <Goose position={[0, 8, 3]} onDespawn={onObjectDespawn} />

      {/* Flock near northwest forest */}
      <Goose position={[-9, 8, -3]} onDespawn={onObjectDespawn} />
      <Goose position={[-12, 8, 0]} onDespawn={onObjectDespawn} />
      <Goose position={[-6, 8, -6]} onDespawn={onObjectDespawn} />

      {/* Flock near southeast forest */}
      <Goose position={[9, 8, 3]} onDespawn={onObjectDespawn} />
      <Goose position={[12, 8, 0]} onDespawn={onObjectDespawn} />
      <Goose position={[6, 8, 6]} onDespawn={onObjectDespawn} />

      {/* Lone geese in distant areas */}
      <Goose position={[-15, 8, -1]} onDespawn={onObjectDespawn} />
      <Goose position={[15, 8, -1]} onDespawn={onObjectDespawn} />
      <Goose position={[-1, 8, -12]} onDespawn={onObjectDespawn} />
      <Goose position={[1, 8, 12]} onDespawn={onObjectDespawn} />

      {/* Additional scattered geese for more coverage */}
      <Goose position={[-6, 8, -9]} onDespawn={onObjectDespawn} />
      <Goose position={[6, 8, -9]} onDespawn={onObjectDespawn} />
      <Goose position={[-9, 8, 6]} onDespawn={onObjectDespawn} />
      <Goose position={[9, 8, -6]} onDespawn={onObjectDespawn} />
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
  const baseDistance = 3;
  const zoomFactor = holeSize * 1.0; // Moderate zoom out factor (halfway between 0.5 and 1.5)

  const cameraOffset: [number, number, number] = [
    0,
    baseHeight + zoomFactor, // Increase height as hole grows
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
