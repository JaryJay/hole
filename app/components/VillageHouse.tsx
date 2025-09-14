"use client";

import PhysicsObject from "./PhysicsObject";

interface VillageHouseProps {
	position: [number, number, number];
	onDespawn: () => void;
}

export default function VillageHouse({
	position,
	onDespawn,
}: VillageHouseProps) {
	return (
		<PhysicsObject
			position={position}
			onDespawn={onDespawn}
			modelPath="/3d_models/low_poly_village_house_cute.glb"
			scale={1}
			collisionBox={[4, 6, 4]}
		/>
	);
}
