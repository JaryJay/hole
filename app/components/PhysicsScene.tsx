"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { Mesh } from "three";
import Ground from "./Ground";

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
	cameraPosition,
	groundPosition,
}: {
	onGroundPositionChange: (position: [number, number, number]) => void;
	cameraPosition: [number, number, number];
	groundPosition: [number, number, number];
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
			<Ground onPositionChange={onGroundPositionChange} />

			{/* Physics objects */}
			<Goose position={[5, 5, 0]} />
			<Goose position={[5, 8, 0]} />
			<Goose position={[5, 6, 0]} />
			<Goose position={[5, 10, 0]} />
		</>
	);
}

export default function PhysicsScene() {
	const [groundPosition, setGroundPosition] = useState<
		[number, number, number]
	>([0, -2, 0]);

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

	return (
		<div className="w-full h-screen">
			<Canvas camera={{ position: cameraPosition, fov: 60 }}>
				<Physics gravity={[0, -9.81, 0]}>
					<Scene
						onGroundPositionChange={handleGroundPositionChange}
						cameraPosition={cameraPosition}
						groundPosition={groundPosition}
					/>
				</Physics>
			</Canvas>
		</div>
	);
}
