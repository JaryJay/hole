"use client";

import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { Mesh } from "three";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface GooseProps {
	position: [number, number, number];
	useGoose2?: boolean;
	onDespawn: () => void;
}

export default function Goose({ position, useGoose2, onDespawn }: GooseProps) {
	const meshRef = useRef<Mesh>(null);
	const rigidBodyRef = useRef<RapierRigidBody>(null);
	const [isVisible, setIsVisible] = useState(true);
	const obj = useLoader(
		GLTFLoader,
		useGoose2 ? "/3d_models/Goose2.glb" : "/3d_models/Goose.glb"
	);

	useEffect(() => {
		const checkDespawn = () => {
			if (!rigidBodyRef.current || !isVisible) return;

			const currentPosition = rigidBodyRef.current.translation();
			const despawnThreshold = -2 - 100; // Ground Y position (-2) minus 100 units

			if (currentPosition.y < despawnThreshold) {
				// Remove the rigid body from the physics world and hide the mesh
				rigidBodyRef.current.setEnabled(false);
				setIsVisible(false);
				onDespawn(); // Notify parent that goose despawned
			}
		};

		const interval = setInterval(checkDespawn, 100); // Check every 100ms
		return () => clearInterval(interval);
	}, [isVisible, onDespawn]);

	if (!isVisible) {
		return null; // Don't render anything if the goose has despawned
	}

	return (
		<RigidBody ref={rigidBodyRef} position={position}>
			<primitive object={obj.scene} scale={0.02} />
			{/* Set visible to true to see the box */}
			<mesh ref={meshRef} visible={false}>
				<boxGeometry args={[1, 1, 0.6]} />
				<meshStandardMaterial color="white" />
			</mesh>
		</RigidBody>
	);
}
