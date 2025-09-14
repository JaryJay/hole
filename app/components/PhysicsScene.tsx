"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useState } from "react";
import Ground from "./Ground";
import CameraController from "./CameraController";
import Goose from "./Goose";

const INITIAL_HOLE_SIZE = 2; // Initial hole size (matching Ground component)
import Tree from "./Tree";

function Scene({
	onGroundPositionChange,
	cameraPosition,
	groundPosition,
	holeSize,
	onObjectDespawn,
}: {
	onGroundPositionChange: (position: [number, number, number]) => void;
	cameraPosition: [number, number, number];
	groundPosition: [number, number, number];
	holeSize: number;
	onObjectDespawn: () => void;
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
			<Ground
				onPositionChange={onGroundPositionChange}
				holeSize={holeSize}
			/>

			{/* Physics objects */}
			<Goose position={[5, 5, 0]} onDespawn={onObjectDespawn} />
			<Goose position={[5, 8, 0]} onDespawn={onObjectDespawn} />
			<Goose position={[5, 6, 0]} onDespawn={onObjectDespawn} />
			<Goose position={[5, 10, 0]} onDespawn={onObjectDespawn} />

			<Tree position={[-2, 0, -5]} onDespawn={onObjectDespawn} />
			<Tree position={[1, 0, -5]} onDespawn={onObjectDespawn} />
		</>
	);
}

export default function PhysicsScene() {
	const [groundPosition, setGroundPosition] = useState<
		[number, number, number]
	>([0, -2, 0]);
	const [holeSize, setHoleSize] = useState(INITIAL_HOLE_SIZE); // Initial hole radius

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

	const onObjectDespawn = () => {
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
						onObjectDespawn={onObjectDespawn}
					/>
				</Physics>
			</Canvas>
		</div>
	);
}
