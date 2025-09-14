"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

interface CameraControllerProps {
	cameraPosition: [number, number, number];
	groundPosition: [number, number, number];
}

export default function CameraController({
	cameraPosition,
	groundPosition,
}: CameraControllerProps) {
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
