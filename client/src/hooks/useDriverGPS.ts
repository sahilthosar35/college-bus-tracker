import { useState, useEffect, useRef, useCallback } from 'react';
import { Route } from '../types';

export interface GPSReading {
  lat: number;
  lng: number;
  speed: number; // in km/h
  heading: number; // in degrees
  accuracy: number; // in meters
  timestamp: number;
}

export const useDriverGPS = (
  isTracking: boolean,
  activeRoute?: Route,
  isSimulationMode: boolean = false,
  onLocationUpdate?: (reading: GPSReading) => void
) => {
  const [currentReading, setCurrentReading] = useState<GPSReading | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(isSimulationMode);

  const watchIdRef = useRef<number | null>(null);
  const simulationStepRef = useRef<number>(0);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number; time: number } | null>(null);

  // Helper to compute bearing between two points
  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
    const x =
      Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
      Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));

    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  };

  // Helper to compute distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Real Hardware GPS Watcher via HTML5 Geolocation API
  useEffect(() => {
    if (!isTracking || isSimulating) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      setGpsError('HTML5 Geolocation is not supported by your browser.');
      return;
    }

    setGpsError(null);

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, speed, heading, accuracy } = position.coords;
      let calculatedSpeed = (speed !== null && speed >= 0) ? speed * 3.6 : 0; // m/s to km/h
      let calculatedHeading = (heading !== null && !isNaN(heading)) ? heading : 0;

      // Fallback calculation for desktop browsers that report speed/heading as null
      if (lastPositionRef.current && (calculatedSpeed === 0 || calculatedHeading === 0)) {
        const dt = (position.timestamp - lastPositionRef.current.time) / 1000; // in seconds
        if (dt > 1) {
          const distKm = calculateDistance(
            lastPositionRef.current.lat,
            lastPositionRef.current.lng,
            latitude,
            longitude
          );
          calculatedSpeed = Math.round((distKm / (dt / 3600)) * 10) / 10;
          calculatedHeading = Math.round(
            calculateBearing(
              lastPositionRef.current.lat,
              lastPositionRef.current.lng,
              latitude,
              longitude
            )
          );
        }
      }

      lastPositionRef.current = {
        lat: latitude,
        lng: longitude,
        time: position.timestamp
      };

      const reading: GPSReading = {
        lat: latitude,
        lng: longitude,
        speed: Math.min(80, calculatedSpeed),
        heading: calculatedHeading,
        accuracy: Math.round(accuracy),
        timestamp: position.timestamp
      };

      setCurrentReading(reading);
      if (onLocationUpdate) onLocationUpdate(reading);
    };

    const handleError = (error: GeolocationPositionError) => {
      console.warn('[DriverGPS] Geolocation error:', error.message);
      setGpsError(`${error.message} (You can switch to Route Simulation Mode).`);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isTracking, isSimulating, onLocationUpdate]);

  // Simulation Engine: Moves bus step-by-step along the route polyline every 3 seconds
  useEffect(() => {
    if (!isTracking || !isSimulating || !activeRoute || !activeRoute.polylineCoordinates.length) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      return;
    }

    const polyline = activeRoute.polylineCoordinates;

    // Reset step if out of bounds
    if (simulationStepRef.current >= polyline.length) {
      simulationStepRef.current = 0;
    }

    const tickSimulation = () => {
      const currentIndex = simulationStepRef.current;
      const nextIndex = (currentIndex + 1) % polyline.length;

      const [currLat, currLng] = polyline[currentIndex];
      const [nextLat, nextLng] = polyline[nextIndex];

      const bearing = Math.round(calculateBearing(currLat, currLng, nextLat, nextLng));
      const simulatedSpeed = Math.floor(28 + Math.random() * 12); // Realistic 28 - 40 km/h

      const reading: GPSReading = {
        lat: currLat,
        lng: currLng,
        speed: simulatedSpeed,
        heading: bearing,
        accuracy: 5,
        timestamp: Date.now()
      };

      setCurrentReading(reading);
      if (onLocationUpdate) onLocationUpdate(reading);

      simulationStepRef.current = nextIndex;
    };

    tickSimulation();
    simulationIntervalRef.current = setInterval(tickSimulation, 3000);

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
    };
  }, [isTracking, isSimulating, activeRoute, onLocationUpdate]);

  const toggleSimulation = useCallback(() => {
    setIsSimulating(prev => !prev);
  }, []);

  return {
    currentReading,
    gpsError,
    isSimulating,
    toggleSimulation
  };
};
