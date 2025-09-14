"use client";

import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody } from "@react-three/rapier";

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

function ControllableGoose({
  position,
}: {
  position: [number, number, number];
}) {
  const meshRef = useRef<Mesh>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case "w":
          keys.current.w = true;
          break;
        case "a":
          keys.current.a = true;
          break;
        case "s":
          keys.current.s = true;
          break;
        case "d":
          keys.current.d = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case "w":
          keys.current.w = false;
          break;
        case "a":
          keys.current.a = false;
          break;
        case "s":
          keys.current.s = false;
          break;
        case "d":
          keys.current.d = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (rigidBodyRef.current) {
      const moveSpeed = 0.1;
      const currentPosition = rigidBodyRef.current.translation();
      let newX = currentPosition.x;
      let newZ = currentPosition.z;

      if (keys.current.w) newZ -= moveSpeed; // Move forward
      if (keys.current.s) newZ += moveSpeed; // Move backward
      if (keys.current.a) newX -= moveSpeed; // Move left
      if (keys.current.d) newX += moveSpeed; // Move right

      // Set the position directly
      if (
        keys.current.w ||
        keys.current.s ||
        keys.current.a ||
        keys.current.d
      ) {
        rigidBodyRef.current.setTranslation(
          { x: newX, y: currentPosition.y, z: newZ },
          true
        );
      }
    }
  });

  return (
    <RigidBody ref={rigidBodyRef} position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 0.6]} />
        <meshStandardMaterial color="red" />
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
      <ControllableGoose position={[0, 5, 0]} />
      <Goose position={[1, 8, 0]} />
      <Goose position={[-1, 6, 0]} />
      <Goose position={[0, 10, 0]} />
    </>
  );
}

export default function PhysicsScene() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 11, 3], fov: 60 }}>
        <Physics gravity={[0, -9.81, 0]}>
          <Scene />
        </Physics>
      </Canvas>
    </div>
  );
}
