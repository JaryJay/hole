"use client";

import { useHybridLocation } from "@/contexts/HybridLocationContext";

interface LocationCardProps {
  className?: string;
}

export default function LocationCard({ className = "" }: LocationCardProps) {
  const location = useHybridLocation();

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
        <h3 className="text-white font-semibold text-sm">Location Status</h3>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white/70 text-xs">Status:</span>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${getStatusColor(
                location?.locationStatus || "unknown"
              )}`}
            >
              67 | {getStatusIcon(location?.locationStatus || "unknown")}
            </span>
            <span
              className={`text-sm font-medium ${getStatusColor(
                location?.locationStatus || "unknown"
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
        <div className="mt-3 pt-3 border-t border-white/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-xs">Source:</span>
            <span className="text-white text-xs font-medium">
              {location.position.source?.toUpperCase() || "UNKNOWN"}
            </span>
          </div>

          {location.position.accuracy && (
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-xs">Accuracy:</span>
              <span className="text-white text-xs font-mono">
                {location.position.accuracy.toFixed(1)}m
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-white/70 text-xs">Last Update:</span>
            <span className="text-white text-xs">
              {location.lastUpdateTime
                ? `${Math.round(
                    (Date.now() - location.lastUpdateTime) / 1000
                  )}s ago`
                : "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  location.gpsPosition ? "bg-green-400" : "bg-gray-500"
                }`}
              ></div>
              <span className="text-xs text-white/70">GPS</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  location.accelerometerPosition ? "bg-blue-400" : "bg-gray-500"
                }`}
              ></div>
              <span className="text-xs text-white/70">Motion</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  location.accelerometerPosition
                    ? "bg-purple-400"
                    : "bg-gray-500"
                }`}
              ></div>
              <span className="text-xs text-white/70">Gyro</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
