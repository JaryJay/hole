"use client";

import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { Mesh } from "three";

function Goose({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null);

  return (
    <RigidBody position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 0.6]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </RigidBody>
  );
}

function Ground() {
  return (
    <RigidBody type="fixed">
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="lightblue" />
      </mesh>
    </RigidBody>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Ground plane */}
      <Ground />

      {/* Physics objects */}
      <Goose position={[0, 5, 0]} />
      <Goose position={[1, 8, 0]} />
      <Goose position={[-1, 6, 0]} />
      <Goose position={[0, 10, 0]} />
    </>
  );
}

export default function PhysicsScene() {
  const [cameraPosition, setCameraPosition] = useState<
    [number, number, number]
  >([0, 11, 3]);
  useEffect(() => {
    // Move the camera when wasd is pressed
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "w") {
        setCameraPosition(([x, y, z]) => [x, y, z + 0.8]);
      } else if (event.key === "s") {
        setCameraPosition(([x, y, z]) => [x, y, z - 0.8]);
      } else if (event.key === "a") {
        setCameraPosition(([x, y, z]) => [x - 0.8, y, z]);
      } else if (event.key === "d") {
        setCameraPosition(([x, y, z]) => [x + 0.8, y, z]);
      }
      console.log({ cameraPosition, eventKey: event.key });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: cameraPosition, fov: 60 }}>
        <Physics gravity={[0, -9.81, 0]}>
          <Scene />
        </Physics>
      </Canvas>
    </div>
  );
}
