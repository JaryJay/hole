"use client";

import { useEffect, useState } from "react";

type GeolocationPosition = {
    lat: number;
    lng: number;
}
type LocationStatus = 'accessed' | 'denied' | 'unknown' | 'error';

export default function Location() {
    const [locationStatus, setLocationStatus] = useState<LocationStatus>('unknown');
    const [position, setPosition] = useState<GeolocationPosition | null>(null);

    useEffect(() => {
        let watchId: number | null = null;

        if ('geolocation' in navigator) {
            watchId = navigator.geolocation.watchPosition((position) => {
                setPosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
                setLocationStatus('accessed');
                console.log(position.coords.latitude, position.coords.longitude);
            }, (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationStatus('denied');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationStatus('unknown');
                        break;
                    case error.TIMEOUT:
                        setLocationStatus('error');
                        break;
                    default:
                        setLocationStatus('error');
                        break;
                }
            })
            return () => {
                if (watchId) {
                    navigator.geolocation.clearWatch(watchId);
                }
            }
        }
    }, []);

    return <></>;
}
