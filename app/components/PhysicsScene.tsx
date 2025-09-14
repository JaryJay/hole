"use client";

import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { Mesh } from "three";
import Ground from "./Ground";

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

function Scene({
	onGroundPositionChange,
}: {
	onGroundPositionChange: (position: [number, number, number]) => void;
}) {
	return (
		<>
			<ambientLight intensity={0.5} />
			<directionalLight position={[10, 10, 5]} intensity={1} />

			{/* Ground plane */}
			<Ground onPositionChange={onGroundPositionChange} />

			{/* Physics objects */}
			<Goose position={[10, 5, 0]} />
			<Goose position={[11, 8, 0]} />
			<Goose position={[11, 6, 0]} />
			<Goose position={[10, 10, 0]} />
		</>
	);
}

export default function PhysicsScene() {
	const [cameraPosition, setCameraPosition] = useState<
		[number, number, number]
	>([0, 11, 3]);
	const [groundPosition, setGroundPosition] = useState<
		[number, number, number]
	>([0, -2, 0]);

	// Update camera position to follow the ground
	useEffect(() => {
		// Keep the camera at a fixed offset relative to the ground
		const cameraOffset: [number, number, number] = [0, 13, 3];
		setCameraPosition([
			groundPosition[0] + cameraOffset[0],
			groundPosition[1] + cameraOffset[1],
			groundPosition[2] + cameraOffset[2],
		]);
	}, [groundPosition]);

	const handleGroundPositionChange = (position: [number, number, number]) => {
		setGroundPosition(position);
	};

	return (
		<div className="w-full h-screen">
			<Canvas camera={{ position: cameraPosition, fov: 60 }}>
				<Physics gravity={[0, -9.81, 0]}>
					<Scene
						onGroundPositionChange={handleGroundPositionChange}
					/>
				</Physics>
			</Canvas>
		</div>
	);
}
