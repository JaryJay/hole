"use client";

import { useMemo, useRef } from "react";
import { RigidBody } from "@react-three/rapier";
import { Mesh, Shape, ExtrudeGeometry, Vector2 } from "three";

interface BuildingProps {
	points: [number, number][]; // Array of [x, z] coordinates defining the building footprint
	height: number; // Height of the building
	position?: [number, number, number]; // Optional position offset
	color?: string; // Optional color for the building
}

export default function Building({
	points,
	height,
	position = [0, 0, 0],
	color = "#8B4513",
}: BuildingProps) {
	const meshRef = useRef<Mesh>(null);

	// Create the building geometry from points and height
	const buildingGeometry = useMemo(() => {
		if (points.length < 3) {
			console.warn(
				"Building needs at least 3 points to create a valid shape"
			);
			return null;
		}

		// Create a shape from the points
		const shape = new Shape();

		// Start from the first point
		shape.moveTo(points[0][0], points[0][1]);

		// Add lines to all other points
		for (let i = 1; i < points.length; i++) {
			shape.lineTo(points[i][0], points[i][1]);
		}

		// Close the shape by connecting back to the first point
		shape.lineTo(points[0][0], points[0][1]);

		// Create extruded geometry
		const geometry = new ExtrudeGeometry(shape, {
			depth: height,
			bevelEnabled: false,
		});

		// Rotate the geometry so it extrudes upward (Y direction) instead of forward (Z direction)
		geometry.rotateX(-Math.PI / 2);

		return geometry;
	}, [points, height]);

	if (!buildingGeometry) {
		return null;
	}

	return (
		<RigidBody
			type="dynamic"
			position={position}
			mass={10} // Heavy mass
			restitution={0.1} // Low bounce
			friction={0.8} // High friction
			linearDamping={0.1} // Air resistance
			angularDamping={0.1} // Angular resistance
		>
			<mesh ref={meshRef} geometry={buildingGeometry}>
				<meshStandardMaterial color={color} />
			</mesh>
		</RigidBody>
	);
}
