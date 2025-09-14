'use client';

import React from 'react';
import { useLocation } from '@/hooks/useLocation';
import { formatCoordinates } from '@/lib/location-utils';

export default function LocationDemo() {
  const { 
    position, 
    error, 
    isLoading, 
    isSupported, 
    permission,
    getCurrentPosition, 
    requestPermission,
    refresh 
  } = useLocation();

  const handleGetLocation = async () => {
    try {
      await getCurrentPosition();
    } catch (err) {
      console.error('Failed to get location:', err);
    }
  };

  const handleRequestPermission = async () => {
    try {
      const result = await requestPermission();
      console.log('Permission result:', result);
    } catch (err) {
      console.error('Failed to request permission:', err);
    }
  };

  const renderLocationInfo = () => {
    if (!position) return null;

    const { coords, timestamp } = position;
    const formattedCoords = formatCoordinates(coords.latitude, coords.longitude);
    const date = new Date(timestamp).toLocaleString();

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Current Location</h3>
        <div className="space-y-2 text-sm text-green-700">
          <p><strong>Coordinates:</strong> {formattedCoords}</p>
          <p><strong>Accuracy:</strong> ±{coords.accuracy.toFixed(0)} meters</p>
          {coords.altitude && (
            <p><strong>Altitude:</strong> {coords.altitude.toFixed(1)}m</p>
          )}
          {coords.speed && (
            <p><strong>Speed:</strong> {coords.speed.toFixed(1)} m/s</p>
          )}
          {coords.heading && (
            <p><strong>Heading:</strong> {coords.heading.toFixed(0)}°</p>
          )}
          <p><strong>Last Updated:</strong> {date}</p>
        </div>
      </div>
    );
  };

  const renderError = () => {
    if (!error) return null;

    const getErrorColor = () => {
      switch (error.type) {
        case 'PERMISSION_DENIED':
          return 'bg-yellow-50 border-yellow-200 text-yellow-800';
        case 'NOT_SUPPORTED':
        case 'HTTPS_REQUIRED':
          return 'bg-red-50 border-red-200 text-red-800';
        default:
          return 'bg-orange-50 border-orange-200 text-orange-800';
      }
    };

    return (
      <div className={`border rounded-lg p-4 mt-4 ${getErrorColor()}`}>
        <h3 className="text-lg font-semibold mb-2">Location Error</h3>
        <p className="text-sm">{error.message}</p>
        {error.code && (
          <p className="text-xs mt-2 opacity-75">Error Code: {error.code}</p>
        )}
      </div>
    );
  };

  const renderPermissionStatus = () => {
    if (!permission) return null;

    const getPermissionColor = () => {
      switch (permission) {
        case 'granted':
          return 'text-green-600';
        case 'denied':
          return 'text-red-600';
        case 'prompt':
          return 'text-yellow-600';
        default:
          return 'text-gray-600';
      }
    };

    return (
      <p className={`text-sm ${getPermissionColor()}`}>
        <strong>Permission:</strong> {permission}
      </p>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Location Demo</h2>
      
      {/* Status Info */}
      <div className="space-y-2 mb-6 text-sm text-gray-600">
        <p><strong>Geolocation Supported:</strong> {isSupported ? '✅ Yes' : '❌ No'}</p>
        {renderPermissionStatus()}
        <p><strong>Loading:</strong> {isLoading ? '🔄 Yes' : '✅ No'}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleGetLocation}
          disabled={!isSupported || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Getting Location...' : 'Get Current Location'}
        </button>
        
        <button
          onClick={handleRequestPermission}
          disabled={!isSupported || permission === 'granted'}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Request Permission
        </button>
        
        <button
          onClick={refresh}
          disabled={!isSupported || isLoading || !position}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Refresh Location
        </button>
      </div>

      {/* Results */}
      {renderError()}
      {renderLocationInfo()}

      {/* Usage Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Usage Instructions</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>1. Click &quot;Request Permission&quot; to allow location access</p>
          <p>2. Click &quot;Get Current Location&quot; to fetch your GPS coordinates</p>
          <p>3. Use &quot;Refresh Location&quot; to get updated coordinates</p>
          <p className="pt-2 text-xs text-gray-500">
            <strong>Note:</strong> This works on both localhost and HTTPS production sites (like Vercel).
            High accuracy GPS coordinates may take 10-20 seconds to obtain.
          </p>
        </div>
      </div>
    </div>
  );
}
