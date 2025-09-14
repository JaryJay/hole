"use client";

import PhysicsObject from "./PhysicsObject";

interface TreeProps {
  position: [number, number, number];
  onDespawn: () => void;
}

export default function Tree({ position, onDespawn }: TreeProps) {
  return (
    <PhysicsObject
      position={position}
      onDespawn={onDespawn}
      modelPath="/3d_models/PineTree.glb"
      scale={2}
      collisionBox={[2, 12, 2]}
    />
  );
}
