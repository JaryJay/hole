"use client";

import { useEffect, useRef, useState } from "react";
import { RigidBody } from "@react-three/rapier";
import { Mesh, Shape, ExtrudeGeometry } from "three";

interface GroundProps {
	onPositionChange?: (position: [number, number, number]) => void;
	holeSize: number;
}

const GROUND_SIZE = 200; // Ground plane size (10x bigger than before)
const INITIAL_HOLE_SIZE = 0.2; // Initial hole size

export default function Ground({ onPositionChange, holeSize }: GroundProps) {
	const groundRef = useRef<Mesh>(null);
	const [groundPosition, setGroundPosition] = useState<
		[number, number, number]
	>([0, -2, 0]);

	// const colorMap = useLoader(TextureLoader, "grass.png");

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
				setGroundPosition(([x, y, z]) => [x, y, z - moveSpeed]);
			} else if (event.key === "ArrowDown") {
				setGroundPosition(([x, y, z]) => [x, y, z + moveSpeed]);
			} else if (event.key === "ArrowLeft") {
				setGroundPosition(([x, y, z]) => [x - moveSpeed, y, z]);
			} else if (event.key === "ArrowRight") {
				setGroundPosition(([x, y, z]) => [x + moveSpeed, y, z]);
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
			onPositionChange(groundPosition);
		}
	}, [groundPosition, onPositionChange]);

	return (
		<>
			{/* Visual ground with hole */}
			<mesh
				ref={groundRef}
				position={groundPosition}
				rotation={[-Math.PI / 2, 0, 0]}
			>
				<meshStandardMaterial color="lightgreen" />
			</mesh>

			{/* Physics bodies for ground segments around the hole */}
			{/* Left segment */}
			<RigidBody
				type="fixed"
				position={[
					groundPosition[0] - (holeSize + 20),
					groundPosition[1],
					groundPosition[2],
				]}
			>
				<mesh rotation={[-Math.PI / 2, 0, 0]}>
					<planeGeometry args={[40, GROUND_SIZE]} />
					<meshStandardMaterial
						color="lightblue"
						transparent
						opacity={0}
					/>
				</mesh>
			</RigidBody>

			{/* Right segment */}
			<RigidBody
				type="fixed"
				position={[
					groundPosition[0] + (holeSize + 20),
					groundPosition[1],
					groundPosition[2],
				]}
			>
				<mesh rotation={[-Math.PI / 2, 0, 0]}>
					<planeGeometry args={[40, GROUND_SIZE]} />
					<meshStandardMaterial
						color="lightblue"
						transparent
						opacity={0}
					/>
				</mesh>
			</RigidBody>

			{/* Top segment */}
			<RigidBody
				type="fixed"
				position={[
					groundPosition[0],
					groundPosition[1],
					groundPosition[2] + (holeSize + 20),
				]}
			>
				<mesh rotation={[-Math.PI / 2, 0, 0]}>
					<planeGeometry args={[GROUND_SIZE - 40, 40]} />
					<meshStandardMaterial
						color="lightblue"
						transparent
						opacity={0}
					/>
				</mesh>
			</RigidBody>

			{/* Bottom segment */}
			<RigidBody
				type="fixed"
				position={[
					groundPosition[0],
					groundPosition[1],
					groundPosition[2] - (holeSize + 20),
				]}
			>
				<mesh rotation={[-Math.PI / 2, 0, 0]}>
					<planeGeometry args={[GROUND_SIZE - 40, 40]} />
					<meshStandardMaterial
						color="lightblue"
						transparent
						opacity={0}
					/>
				</mesh>
			</RigidBody>
		</>
	);
}
