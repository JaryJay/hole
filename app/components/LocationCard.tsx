"use client";

import { useLocation } from "@/contexts/LocationContext";

interface LocationCardProps {
	className?: string;
}

export default function LocationCard({ className = "" }: LocationCardProps) {
	const location = useLocation();

	const getStatusColor = (status: string) => {
		switch (status) {
			case "accessed":
				return "text-green-400";
			case "denied":
				return "text-red-400";
			case "error":
				return "text-red-400";
			case "unknown":
				return "text-yellow-400";
			default:
				return "text-gray-400";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "accessed":
				return "✓";
			case "denied":
				return "✗";
			case "error":
				return "⚠";
			case "unknown":
				return "?";
			default:
				return "?";
		}
	};

	const formatCoordinate = (coord: number | undefined) => {
		if (coord === undefined || coord === null) return "N/A";
		return coord.toFixed(6);
	};

	return (
		<div
			className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl min-w-[280px] ${className}`}
		>
			<div className="flex items-center gap-2 mb-3">
				<div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
				<h3 className="text-white font-semibold text-sm">
					Location Status
				</h3>
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<span className="text-white/70 text-xs">Status:</span>
					<div className="flex items-center gap-2">
						<span
							className={`text-sm font-medium ${getStatusColor(
								location?.locationStatus
							)}`}
						>
							{getStatusIcon(location?.locationStatus)}
						</span>
						<span
							className={`text-sm font-medium ${getStatusColor(
								location?.locationStatus
							)}`}
						>
							{location?.locationStatus || "unknown"}
						</span>
					</div>
				</div>

				<div className="flex items-center justify-between">
					<span className="text-white/70 text-xs">Latitude:</span>
					<span className="text-white text-sm font-mono">
						{formatCoordinate(location?.position?.lat)}
					</span>
				</div>

				<div className="flex items-center justify-between">
					<span className="text-white/70 text-xs">Longitude:</span>
					<span className="text-white text-sm font-mono">
						{formatCoordinate(location?.position?.lng)}
					</span>
				</div>
			</div>

			{location?.locationStatus === "accessed" && location?.position && (
				<div className="mt-3 pt-3 border-t border-white/20">
					<div className="flex items-center gap-2">
						<div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
						<span className="text-green-400 text-xs">
							GPS Active
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
