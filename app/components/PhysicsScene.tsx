"use client";

import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Physics, RigidBody, RapierRigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { Mesh } from "three";
import Ground from "./Ground";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

function CameraController({
  cameraPosition,
  groundPosition,
}: {
  cameraPosition: [number, number, number];
  groundPosition: [number, number, number];
}) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(
      cameraPosition[0],
      cameraPosition[1],
      cameraPosition[2]
    );
    camera.lookAt(groundPosition[0], groundPosition[1], groundPosition[2]);
    camera.updateProjectionMatrix();
  }, [camera, cameraPosition, groundPosition]);

  return null;
}

function Goose({
  position,
  useGoose2,
  onDespawn,
}: {
  position: [number, number, number];
  useGoose2?: boolean;
  onDespawn: () => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const [isVisible, setIsVisible] = useState(true);
  const obj = useLoader(
    GLTFLoader,
    useGoose2 ? "/3d_models/Goose2.glb" : "/3d_models/Goose.glb"
  );

  useEffect(() => {
    const checkDespawn = () => {
      if (!rigidBodyRef.current || !isVisible) return;

      const currentPosition = rigidBodyRef.current.translation();
      const despawnThreshold = -2 - 100; // Ground Y position (-2) minus 10 units

      if (currentPosition.y < despawnThreshold) {
        // Remove the rigid body from the physics world and hide the mesh
        rigidBodyRef.current.setEnabled(false);
        setIsVisible(false);
        onDespawn(); // Notify parent that goose despawned
      }
    };

    const interval = setInterval(checkDespawn, 100); // Check every 100ms
    return () => clearInterval(interval);
  }, [isVisible, onDespawn]);

  if (!isVisible) {
    return null; // Don't render anything if the goose has despawned
  }

  return (
    <RigidBody ref={rigidBodyRef} position={position}>
      <primitive object={obj.scene} scale={0.02} />
      {/* Set visible to true to see the box */}
      <mesh ref={meshRef} visible={false}>
        <boxGeometry args={[1, 1, 0.6]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </RigidBody>
  );
}

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
      <Goose position={[5, 8, 0]} onDespawn={onGooseDespawn} useGoose2 />
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
