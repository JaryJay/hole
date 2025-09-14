# Location Context Implementation

This implementation provides a robust, production-ready location context for fetching precise GPS coordinates using the Browser Geolocation API. It works on both localhost and deployed Vercel applications.

## Features

- ✅ **High-accuracy GPS coordinates** using `enableHighAccuracy: true`
- ✅ **Production-ready** with proper HTTPS checks and Vercel compatibility
- ✅ **Comprehensive error handling** for all geolocation scenarios
- ✅ **TypeScript support** with full type safety
- ✅ **Automatic permission management**
- ✅ **Position watching** for real-time location updates
- ✅ **Memory leak prevention** with proper cleanup
- ✅ **Loading states and error boundaries**

## File Structure

```
├── types/location.ts           # TypeScript interfaces and types
├── lib/location-utils.ts       # Utility functions for geolocation
├── contexts/LocationContext.tsx # Main context and provider
├── hooks/useLocation.ts        # Custom hook for context consumption
├── components/LocationDemo.tsx  # Example usage component
└── app/layout.tsx              # LocationProvider integration
```

## Usage

### Basic Usage

```tsx
import { useLocation } from '@/hooks/useLocation';

function MyComponent() {
  const { position, error, isLoading, getCurrentPosition } = useLocation();

  const handleGetLocation = async () => {
    try {
      const location = await getCurrentPosition();
      console.log('Coordinates:', location.coords.latitude, location.coords.longitude);
    } catch (err) {
      console.error('Failed to get location:', err);
    }
  };

  if (isLoading) return <div>Getting location...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (position) {
    return (
      <div>
        <p>Latitude: {position.coords.latitude}</p>
        <p>Longitude: {position.coords.longitude}</p>
        <p>Accuracy: ±{position.coords.accuracy}m</p>
      </div>
    );
  }

  return <button onClick={handleGetLocation}>Get Location</button>;
}
```

### Advanced Usage with Options

```tsx
// In your layout or app root
<LocationProvider 
  options={{
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 60000,
    watchPosition: false,
    requestPermissionOnMount: true
  }}
>
  <YourApp />
</LocationProvider>
```

### Watch Position for Real-time Updates

```tsx
function RealtimeLocation() {
  const { watchPosition, clearWatch, position } = useLocation();

  useEffect(() => {
    const watchId = watchPosition();
    
    return () => {
      if (watchId) clearWatch(watchId);
    };
  }, [watchPosition, clearWatch]);

  return position ? (
    <div>Current location: {position.coords.latitude}, {position.coords.longitude}</div>
  ) : (
    <div>Watching for location updates...</div>
  );
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enableHighAccuracy` | boolean | `true` | Use GPS for precise coordinates |
| `timeout` | number | `20000` | Timeout in milliseconds (20 seconds) |
| `maximumAge` | number | `60000` | Cache duration in milliseconds (1 minute) |
| `watchPosition` | boolean | `false` | Automatically watch position changes |
| `requestPermissionOnMount` | boolean | `true` | Request permission when provider mounts |

## Error Handling

The context handles all common geolocation errors:

- **Permission Denied**: User blocked location access
- **Position Unavailable**: GPS/location services disabled
- **Timeout**: Location request took too long
- **Not Supported**: Browser doesn't support geolocation
- **HTTPS Required**: Geolocation requires secure context

## Production Deployment

This implementation is specifically designed for production deployment on platforms like Vercel:

1. **HTTPS Requirement**: Automatically detects secure contexts
2. **Localhost Support**: Works in development with HTTP
3. **Timeout Handling**: Generous 20-second timeout for GPS lock
4. **Error Recovery**: Comprehensive error handling and user guidance
5. **Memory Management**: Proper cleanup to prevent memory leaks

## Browser Compatibility

- ✅ Chrome/Edge (GPS support)
- ✅ Firefox (GPS support)
- ✅ Safari (GPS support)
- ✅ Mobile browsers (native GPS)
- ❌ HTTP sites (HTTPS required except localhost)

## Security Notes

- Location access requires HTTPS in production
- Users must explicitly grant permission
- Location data is not stored or transmitted
- All processing happens client-side

## Testing

1. **Localhost**: Works with HTTP during development
2. **Vercel Preview**: Works with HTTPS preview deployments
3. **Production**: Works with HTTPS production domains
4. **Mobile**: Test on actual devices for best GPS accuracy

The LocationDemo component provides a comprehensive testing interface for all features.