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
      modelPath="/3d_models/LargeTree.glb"
      scale={1.7}
      collisionBox={[4, 13, 4]}
    />
  );
}
