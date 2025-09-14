"use client";

import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mesh } from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { playSound } from "../utils/sound";

interface PhysicsObjectProps {
  position: [number, number, number];
  onDespawn: () => void;
  modelPath: string;
  scale: number;
  collisionBox: [number, number, number]; // [width, height, depth]
  despawnThreshold?: number;
}

export default function PhysicsObject({
  position,
  onDespawn,
  modelPath,
  scale,
  collisionBox,
  despawnThreshold = -22, // Default: ground Y (-2) minus 50 units
}: PhysicsObjectProps) {
  const meshRef = useRef<Mesh>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const [isVisible, setIsVisible] = useState(true);
  const obj = useLoader(GLTFLoader, modelPath);

  const clonedScene = useMemo(() => obj.scene.clone(), [obj]);

  useFrame(() => {
    const checkDespawn = () => {
      if (!rigidBodyRef.current || !isVisible) return;

      const currentPosition = rigidBodyRef.current.translation();

      if (currentPosition.y < despawnThreshold) {
        // Remove the rigid body from the physics world and hide the mesh
        rigidBodyRef.current.setEnabled(false);
        setIsVisible(false);
        console.log("Despawning");
        // Play sound if this is a goose
        if (modelPath.includes('Goose')) {
          playSound('/audio/geese.mp3', 0.8);
        }
        onDespawn(); // Notify parent that object despawned
      }
    };
    checkDespawn();
  });

  if (!isVisible) {
    return null; // Don't render anything if the object has despawned
  }

  return (
    <RigidBody ref={rigidBodyRef} position={position}>
      <primitive object={clonedScene} scale={scale} />
      {/* Collision box - invisible but used for physics */}
      {/* <mesh ref={meshRef} visible={true}>
        <boxGeometry args={collisionBox} />
        <meshStandardMaterial color="white" />
      </mesh> */}
    </RigidBody>
  );
}
