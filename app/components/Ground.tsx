"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { Mesh, Shape, ExtrudeGeometry } from "three";
import { lerp } from "three/src/math/MathUtils.js";

interface GroundProps {
  onPositionChange?: (position: [number, number, number]) => void;
  holeSize: number;
  physicalLocation?: { lat: number; lng: number } | null;
}

const GROUND_SIZE = 200; // Ground plane size (10x bigger than before)
const INITIAL_HOLE_SIZE = 0.2; // Initial hole size

// Convert GPS coordinates to 3D world coordinates
function gpsToWorldCoordinates(
  lat: number,
  lng: number
): [number, number, number] {
  const scale = 120; // Adjust this to control how much the location affects position

  // Convert to world coordinates (x, z) - y stays at ground level
  const x = (lng + 80.5) * scale;
  const z = (lat - 43.5) * scale;

  console.log(
    "Converted GPS coordinates to world coordinates:",
    [x, z],
    "lat",
    lat,
    "lng",
    lng
  );
  console.log({ lat, lng, x, z });

  return [x, -2, z]; // y is -2 for ground level
}

export default function Ground({
  onPositionChange,
  holeSize,
  physicalLocation,
}: GroundProps) {
  const groundRef = useRef<Mesh>(null);

  // Calculate initial position based on physical location
  const getInitialPosition = (): [number, number, number] => {
    if (physicalLocation) {
      return gpsToWorldCoordinates(physicalLocation.lat, physicalLocation.lng);
    }
    return [0, -2, 0]; // Default center position
  };

  const [targetPosition, setTargetPosition] = useState<
    [number, number, number]
  >(getInitialPosition());

  const [actualPosition, setActualPosition] = useState<
    [number, number, number]
  >(getInitialPosition());

  // const colorMap = useLoader(TextureLoader, "grass.png");

  // Update target position when physical location changes
  useEffect(() => {
    if (physicalLocation) {
      const newPosition = gpsToWorldCoordinates(
        physicalLocation.lat,
        physicalLocation.lng
      );
      setTargetPosition(newPosition);
    }
  }, [physicalLocation]);

  // Smooth interpolation of ground position
  useFrame(() => {
    // Use faster lerp for larger distances, slower for small distances
    const lerpFactor = 0.2;

    const newActualPosition: [number, number, number] = [
      lerp(actualPosition[0], targetPosition[0], lerpFactor),
      lerp(actualPosition[1], targetPosition[1], lerpFactor),
      lerp(actualPosition[2], targetPosition[2], lerpFactor),
    ];
    setActualPosition(newActualPosition);
  });

  useEffect(() => {
    if (groundRef.current) {
      // Create a custom geometry with a hole
      const groundShape = new Shape();
      const holeRadius = holeSize;
      const groundSize = GROUND_SIZE;

      // Create outer rectangle
      groundShape.moveTo(-groundSize / 2, -groundSize / 2);
      groundShape.lineTo(groundSize / 2, -groundSize / 2);
      groundShape.lineTo(groundSize / 2, groundSize / 2);
      groundShape.lineTo(-groundSize / 2, groundSize / 2);
      groundShape.lineTo(-groundSize / 2, -groundSize / 2);

      // Create hole in the middle
      const holeShape = new Shape();
      holeShape.absarc(0, 0, holeRadius, 0, Math.PI * 2, false);
      groundShape.holes.push(holeShape);

      // Create geometry
      const geometry = new ExtrudeGeometry(groundShape, {
        depth: 0.1,
        bevelEnabled: false,
      });

      groundRef.current.geometry.dispose();
      groundRef.current.geometry = geometry;
    }
  }, [holeSize]);

  // Arrow key controls for ground movement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const moveSpeed = 0.25;
      if (event.key === "ArrowUp") {
        setTargetPosition(([x, y, z]) => [x, y, z - moveSpeed]);
      } else if (event.key === "ArrowDown") {
        setTargetPosition(([x, y, z]) => [x, y, z + moveSpeed]);
      } else if (event.key === "ArrowLeft") {
        setTargetPosition(([x, y, z]) => [x - moveSpeed, y, z]);
      } else if (event.key === "ArrowRight") {
        setTargetPosition(([x, y, z]) => [x + moveSpeed, y, z]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Notify parent component when ground position changes
  useEffect(() => {
    if (onPositionChange) {
      onPositionChange(actualPosition);
    }
  }, [actualPosition, onPositionChange]);

  return (
    <>
      {/* Visual ground with hole */}
      <mesh
        ref={groundRef}
        position={actualPosition}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial color="lightgreen" />
      </mesh>

      {/* Physics bodies for ground segments around the hole */}
      {/* Left segment */}
      <RigidBody
        type="fixed"
        position={[
          actualPosition[0] - (holeSize + 20),
          actualPosition[1],
          actualPosition[2],
        ]}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, GROUND_SIZE]} />
          <meshStandardMaterial color="lightblue" transparent opacity={0} />
        </mesh>
      </RigidBody>

      {/* Right segment */}
      <RigidBody
        type="fixed"
        position={[
          actualPosition[0] + (holeSize + 20),
          actualPosition[1],
          actualPosition[2],
        ]}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, GROUND_SIZE]} />
          <meshStandardMaterial color="lightblue" transparent opacity={0} />
        </mesh>
      </RigidBody>

      {/* Top segment */}
      <RigidBody
        type="fixed"
        position={[
          actualPosition[0],
          actualPosition[1],
          actualPosition[2] + (holeSize + 20),
        ]}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[GROUND_SIZE - 40, 40]} />
          <meshStandardMaterial color="lightblue" transparent opacity={0} />
        </mesh>
      </RigidBody>

      {/* Bottom segment */}
      <RigidBody
        type="fixed"
        position={[
          actualPosition[0],
          actualPosition[1],
          actualPosition[2] - (holeSize + 20),
        ]}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[GROUND_SIZE - 40, 40]} />
          <meshStandardMaterial color="lightblue" transparent opacity={0} />
        </mesh>
      </RigidBody>
    </>
  );
}
