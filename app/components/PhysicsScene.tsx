"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useState } from "react";
import Ground from "./Ground";
import CameraController from "./CameraController";
import Goose from "./Goose";

function Scene({
  onGroundPositionChange,
  cameraPosition,
  groundPosition,
  holeSize,
  onGooseDespawn,
}: {
  onGroundPositionChange: (position: [number, number, number]) => void;
  cameraPosition: [number, number, number];
  groundPosition: [number, number, number];
  holeSize: number;
  onGooseDespawn: () => void;
}) {
  return (
    <>
      <CameraController
        cameraPosition={cameraPosition}
        groundPosition={groundPosition}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Ground plane */}
      <Ground onPositionChange={onGroundPositionChange} holeSize={holeSize} />

      {/* Physics objects */}
      <Goose position={[5, 5, 0]} onDespawn={onGooseDespawn} />
      <Goose position={[5, 8, 0]} onDespawn={onGooseDespawn} />
      <Goose position={[5, 6, 0]} onDespawn={onGooseDespawn} />
      <Goose position={[5, 10, 0]} onDespawn={onGooseDespawn} />
    </>
  );
}

export default function PhysicsScene() {
  const [groundPosition, setGroundPosition] = useState<
    [number, number, number]
  >([0, -2, 0]);
  const [holeSize, setHoleSize] = useState(2); // Initial hole radius

  // Calculate camera position from ground position
  const cameraOffset: [number, number, number] = [0, 13, 3];
  const cameraPosition: [number, number, number] = [
    groundPosition[0] + cameraOffset[0],
    groundPosition[1] + cameraOffset[1],
    groundPosition[2] + cameraOffset[2],
  ];

  const handleGroundPositionChange = (position: [number, number, number]) => {
    setGroundPosition(position);
  };

  const handleGooseDespawn = () => {
    setHoleSize((prevSize) => prevSize + 0.2); // Increase hole size by 0.2 units
  };

  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: cameraPosition, fov: 60 }}>
        <Physics gravity={[0, -9.81, 0]}>
          <Scene
            onGroundPositionChange={handleGroundPositionChange}
            cameraPosition={cameraPosition}
            groundPosition={groundPosition}
            holeSize={holeSize}
            onGooseDespawn={handleGooseDespawn}
          />
        </Physics>
      </Canvas>
    </div>
  );
}
