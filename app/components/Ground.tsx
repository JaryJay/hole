"use client";

import { useEffect, useRef, useState } from "react";
import { RigidBody } from "@react-three/rapier";
import { Mesh, Shape, ExtrudeGeometry } from "three";

interface GroundProps {
	onPositionChange?: (position: [number, number, number]) => void;
}

export default function Ground({ onPositionChange }: GroundProps) {
	const groundRef = useRef<Mesh>(null);
	const [groundPosition, setGroundPosition] = useState<
		[number, number, number]
	>([0, -2, 0]);

	useEffect(() => {
		if (groundRef.current) {
			// Create a custom geometry with a hole
			const groundShape = new Shape();
			const holeRadius = 2;
			const groundSize = 20;

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
	}, []);

	// Arrow key controls for ground movement
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const moveSpeed = 0.5;
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
				<meshStandardMaterial color="lightblue" />
			</mesh>

			{/* Physics bodies for ground segments around the hole */}
			{/* Left segment */}
			<RigidBody
				type="fixed"
				position={[
					groundPosition[0] - 6,
					groundPosition[1],
					groundPosition[2],
				]}
			>
				<mesh rotation={[-Math.PI / 2, 0, 0]}>
					<planeGeometry args={[8, 20]} />
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
					groundPosition[0] + 6,
					groundPosition[1],
					groundPosition[2],
				]}
			>
				<mesh rotation={[-Math.PI / 2, 0, 0]}>
					<planeGeometry args={[8, 20]} />
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
					groundPosition[2] + 6,
				]}
			>
				<mesh rotation={[-Math.PI / 2, 0, 0]}>
					<planeGeometry args={[4, 8]} />
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
					groundPosition[2] - 6,
				]}
			>
				<mesh rotation={[-Math.PI / 2, 0, 0]}>
					<planeGeometry args={[4, 8]} />
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
