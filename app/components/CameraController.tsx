"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { lerp } from "three/src/math/MathUtils.js";

type Vector3 = [number, number, number];

interface CameraControllerProps {
  cameraPosition: Vector3;
  groundPosition: Vector3;
}

export default function CameraController({
  cameraPosition,
  groundPosition,
}: CameraControllerProps) {
  const { camera } = useThree();
  const [actualPosition, setActualPosition] = useState<Vector3>([0, 0, 0]);

  useFrame(() => {
    const newActualPosition: Vector3 = [
      lerp(actualPosition[0], cameraPosition[0], 0.1),
      lerp(actualPosition[1], cameraPosition[1], 0.1),
      lerp(actualPosition[2], cameraPosition[2], 0.1),
    ];
    // lerp the actual position to the camera position
    setActualPosition(newActualPosition);
    camera.position.set(
      newActualPosition[0],
      newActualPosition[1],
      newActualPosition[2]
    );

    // Place to look at is the ground - target + actual
    const lookAtPosition: Vector3 = [
      groundPosition[0] - cameraPosition[0] + newActualPosition[0],
      groundPosition[1] - cameraPosition[1] + newActualPosition[1],
      groundPosition[2] - cameraPosition[2] + newActualPosition[2],
    ];
    camera.lookAt(lookAtPosition[0], lookAtPosition[1], lookAtPosition[2]);
    camera.updateProjectionMatrix();
  });

  return null;
}
