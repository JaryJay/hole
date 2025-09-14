"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useState, useEffect } from "react";
import Ground from "./Ground";
import CameraController from "./CameraController";
import Building from "./Building";

interface BuildingsData {
	targetCoordinates: [number, number];
	radiusKm: number;
	totalBuildings: number;
	coordinates: [number, number][][][];
}

const INITIAL_HOLE_SIZE = 2; // Initial hole size (matching Ground component)
const SIZE_SCALE = 10000; // Scale factor for building coordinates
const BUILDING_HEIGHT = 0.2; // Height for all buildings
import Tree from "./Tree";
import PineTree from "./PineTree";
import LargeTree from "./LargeTree";

function Scene({
	onGroundPositionChange,
	cameraPosition,
	groundPosition,
	holeSize,
	onObjectDespawn,
	buildingsData,
}: {
	onGroundPositionChange: (position: [number, number, number]) => void;
	cameraPosition: [number, number, number];
	groundPosition: [number, number, number];
	holeSize: number;
	onObjectDespawn: () => void;
	buildingsData: BuildingsData | null;
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

			{/* Test building to verify Building component works */}

			{/* Render all buildings from JSON data */}
			{buildingsData?.coordinates?.map(
				(building: [number, number][][], buildingIndex: number) => {
					// The building is an array containing one array of coordinates
					const buildingPoints = building[0];

					// Convert coordinates to [x, z] format and scale them
					const scaledPoints: [number, number][] = buildingPoints.map(
						(point: [number, number]) => [
							(point[0] - buildingsData.targetCoordinates[0]) *
								SIZE_SCALE,
							(point[1] - buildingsData.targetCoordinates[1]) *
								SIZE_SCALE,
						]
					);

					// Calculate building center for positioning
					const centerX =
						scaledPoints.reduce((sum, point) => sum + point[0], 0) /
						scaledPoints.length;
					const centerZ =
						scaledPoints.reduce((sum, point) => sum + point[1], 0) /
						scaledPoints.length;

					// Offset points relative to center
					const centeredPoints: [number, number][] = scaledPoints.map(
						(point) => [point[0] - centerX, point[1] - centerZ]
					);

					return (
						<Building
							key={buildingIndex}
							points={centeredPoints}
							height={BUILDING_HEIGHT}
							position={[centerX + 5, -2, centerZ]}
							color={`hsl(${
								(buildingIndex * 137.5) % 360
							}, 70%, 50%)`} // Different color for each building
						/>
					);
				}
			)}
		</>
	);
}

export default function PhysicsScene() {
	const [groundPosition, setGroundPosition] = useState<
		[number, number, number]
	>([0, -2, 0]);
	const [holeSize, setHoleSize] = useState(INITIAL_HOLE_SIZE); // Initial hole radius
	const [buildingsData, setBuildingsData] = useState<BuildingsData | null>(
		null
	);

	// Load buildings data
	useEffect(() => {
		fetch("/buildings/filtered_buildings.json")
			.then((response) => response.json())
			.then((data) => {
				setBuildingsData(data);
				console.log(`Loaded ${data.totalBuildings} buildings`);
				console.log("Target coordinates:", data.targetCoordinates);
				console.log("First building coordinates:", data.coordinates[0]);

				// Calculate some sample scaled coordinates
				const sampleBuilding = data.coordinates[0];
				const sampleBuildingPoints = sampleBuilding[0];
				const samplePoint = sampleBuildingPoints[0];
				const scaledX =
					(samplePoint[0] - data.targetCoordinates[0]) * SIZE_SCALE;
				const scaledZ =
					(samplePoint[1] - data.targetCoordinates[1]) * SIZE_SCALE;
				console.log("Sample scaled coordinates:", { scaledX, scaledZ });
			})
			.catch((error) => {
				console.error("Error loading buildings data:", error);
			});
	}, []);

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
						buildingsData={buildingsData}
					/>
				</Physics>
			</Canvas>
		</div>
	);
}
