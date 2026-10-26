import { useMemo } from 'react';
import { RouteStop, ETAResult, Bus } from '../types';

export const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};

export const useETA = (
  bus: Bus | null,
  selectedStop: RouteStop | null,
  allStops: RouteStop[] = [],
  isTrafficAlertActive: boolean = false
): {
  etaResult: ETAResult | null;
  isWithinGeofence: boolean;
  distanceToStopKm: number;
} => {
  return useMemo(() => {
    if (!bus || !selectedStop) {
      return {
        etaResult: null,
        isWithinGeofence: false,
        distanceToStopKm: -1
      };
    }

    const { lat, lng, speed } = bus.currentLocation;
    const directDistance = calculateHaversineDistance(lat, lng, selectedStop.lat, selectedStop.lng);

    // Stop geofence boundary is 1.0 km
    const isWithinGeofence = directDistance <= (selectedStop.geofenceRadiusKm || 1.0);

    const targetOrder = selectedStop.order;
    const currentStopIndex = bus.currentStopIndex || 0;

    let intermediateStopsCount = 0;
    let distanceAlongRoute = 0;

    if (targetOrder < currentStopIndex) {
      return {
        etaResult: {
          stopId: selectedStop.id,
          stopName: selectedStop.name,
          distanceKm: 0,
          etaMinutes: 0,
          formattedEta: 'Departed',
          statusBadge: 'ON_TIME',
          delayMinutes: 0,
          intermediateStopsCount: 0,
          averageSpeedKmh: speed
        },
        isWithinGeofence: false,
        distanceToStopKm: directDistance
      };
    }

    if (targetOrder === currentStopIndex) {
      distanceAlongRoute = directDistance;
    } else {
      const nextStop = allStops[currentStopIndex] || selectedStop;
      distanceAlongRoute = calculateHaversineDistance(lat, lng, nextStop.lat, nextStop.lng);

      for (let i = currentStopIndex; i < targetOrder; i++) {
        if (allStops[i] && allStops[i + 1]) {
          distanceAlongRoute += calculateHaversineDistance(
            allStops[i].lat,
            allStops[i].lng,
            allStops[i + 1].lat,
            allStops[i + 1].lng
          );
          intermediateStopsCount++;
        }
      }
    }

    // Nominal speed safeguard: at least 15 km/h for realistic ETA
    const nominalSpeed = 25.0; // km/h
    const effectiveSpeed = Math.max(speed > 5 ? speed : nominalSpeed * 0.7, 12.0);

    const travelMinutes = (distanceAlongRoute / effectiveSpeed) * 60;
    const dwellMinutes = intermediateStopsCount * 1.5;
    const trafficPenalty = isTrafficAlertActive ? 10.0 : (bus.status === 'DELAYED' ? 6.0 : 0);

    const totalMinutes = Math.max(1, Math.round(travelMinutes + dwellMinutes + trafficPenalty));

    let statusBadge: ETAResult['statusBadge'] = 'ON_TIME';
    let delayMinutes = 0;

    if (isTrafficAlertActive || bus.status === 'DELAYED') {
      statusBadge = 'HEAVY_TRAFFIC';
      delayMinutes = 10;
    } else if (speed < 15 && speed > 0) {
      statusBadge = 'MODERATE_DELAY';
      delayMinutes = 4;
    }

    const etaResult: ETAResult = {
      stopId: selectedStop.id,
      stopName: selectedStop.name,
      distanceKm: Math.round(distanceAlongRoute * 10) / 10,
      etaMinutes: totalMinutes,
      formattedEta: totalMinutes <= 1 ? 'Arriving now' : `${totalMinutes} mins`,
      statusBadge,
      delayMinutes,
      intermediateStopsCount,
      averageSpeedKmh: Math.round(effectiveSpeed)
    };

    return {
      etaResult,
      isWithinGeofence,
      distanceToStopKm: Math.round(directDistance * 10) / 10
    };
  }, [bus, selectedStop, allStops, isTrafficAlertActive]);
};
