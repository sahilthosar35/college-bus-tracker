import { IRouteStop } from '../models/Route';
import { config } from '../config/config';

export interface ETAResult {
  stopId: string;
  stopName: string;
  distanceKm: number;
  etaMinutes: number;
  formattedEta: string; // e.g. "8 mins"
  statusBadge: 'ON_TIME' | 'MODERATE_DELAY' | 'HEAVY_TRAFFIC';
  delayMinutes: number;
  intermediateStopsCount: number;
  averageSpeedKmh: number;
}

export class ETAService {
  private static readonly EARTH_RADIUS_KM = 6371.0;

  /**
   * Calculates the Great-Circle Distance between two coordinate points
   * using the Haversine formula.
   */
  public static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const radLat1 = toRadians(lat1);
    const radLat2 = toRadians(lat2);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(ETAService.EARTH_RADIUS_KM * c * 100) / 100; // in km rounded to 2 decimals
  }

  /**
   * Calculates bearing (compass angle in degrees 0-360) from point 1 to point 2
   */
  public static calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const toRadians = (deg: number) => (deg * Math.PI) / 180;
    const toDegrees = (rad: number) => (rad * 180) / Math.PI;

    const y = Math.sin(toRadians(lon2 - lon1)) * Math.cos(toRadians(lat2));
    const x =
      Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
      Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(toRadians(lon2 - lon1));

    const bearing = (toDegrees(Math.atan2(y, x)) + 360) % 360;
    return Math.round(bearing);
  }

  /**
   * Dynamic ETA Calculation:
   * ETA (minutes) = (Distance Remaining in km / max(Current Speed, Nominal Speed 25 km/h)) * 60
   *                 + (Dwell Time per Intermediate Stop * 1.5 mins)
   *                 + (Traffic delay penalty if bus is in traffic or paused)
   */
  public static calculateDynamicETA(
    currentLat: number,
    currentLng: number,
    currentSpeedKmh: number,
    targetStop: IRouteStop,
    allStops: IRouteStop[],
    currentStopIndex: number = 0,
    isTrafficAlertActive: boolean = false,
    isPaused: boolean = false
  ): ETAResult {
    const targetOrder = targetStop.order;
    let intermediateStopsCount = 0;
    let distanceKm = 0;

    if (targetOrder < currentStopIndex) {
      // Stop is already passed
      return {
        stopId: targetStop.id,
        stopName: targetStop.name,
        distanceKm: 0,
        etaMinutes: 0,
        formattedEta: 'Departed',
        statusBadge: 'ON_TIME',
        delayMinutes: 0,
        intermediateStopsCount: 0,
        averageSpeedKmh: currentSpeedKmh
      };
    }

    if (targetOrder === currentStopIndex) {
      // Approaching or at this current stop directly
      distanceKm = ETAService.calculateHaversineDistance(currentLat, currentLng, targetStop.lat, targetStop.lng);
      intermediateStopsCount = 0;
    } else {
      // Step 1: Distance from current bus position to the next immediate stop in sequence
      const nextStop = allStops[currentStopIndex] || targetStop;
      distanceKm = ETAService.calculateHaversineDistance(currentLat, currentLng, nextStop.lat, nextStop.lng);

      // Step 2: Sum along consecutive stops until reaching the target stop
      for (let i = currentStopIndex; i < targetOrder; i++) {
        if (allStops[i] && allStops[i + 1]) {
          distanceKm += ETAService.calculateHaversineDistance(
            allStops[i].lat,
            allStops[i].lng,
            allStops[i + 1].lat,
            allStops[i + 1].lng
          );
          intermediateStopsCount++;
        }
      }
    }

    // Nominal speed safeguard: avoid dividing by 0 or unrealistic crawl speeds
    const effectiveSpeed = Math.max(
      currentSpeedKmh > 5 ? currentSpeedKmh : config.nominalSpeedKmh * 0.7,
      12.0
    );

    // Pure travel time in minutes
    let travelTimeMinutes = (distanceKm / effectiveSpeed) * 60;

    // Dwell time: 1.5 mins per passenger stop
    const totalDwellMinutes = intermediateStopsCount * config.dwellTimeMinutesPerStop;

    // Traffic or incident penalty
    let trafficPenaltyMinutes = 0;
    if (isTrafficAlertActive) {
      trafficPenaltyMinutes = 8.0;
    }
    if (isPaused) {
      trafficPenaltyMinutes += 5.0;
    }

    const totalMinutes = Math.max(1, Math.round(travelTimeMinutes + totalDwellMinutes + trafficPenaltyMinutes));

    // Determine status badge
    let statusBadge: ETAResult['statusBadge'] = 'ON_TIME';
    let delayMinutes = 0;

    if (isTrafficAlertActive || totalMinutes > 25 && intermediateStopsCount <= 1) {
      statusBadge = 'HEAVY_TRAFFIC';
      delayMinutes = 12;
    } else if (trafficPenaltyMinutes > 0 || currentSpeedKmh < 15 && currentSpeedKmh > 0) {
      statusBadge = 'MODERATE_DELAY';
      delayMinutes = 5;
    }

    return {
      stopId: targetStop.id,
      stopName: targetStop.name,
      distanceKm: Math.round(distanceKm * 10) / 10,
      etaMinutes: totalMinutes,
      formattedEta: totalMinutes <= 1 ? 'Arriving now' : `${totalMinutes} mins`,
      statusBadge,
      delayMinutes,
      intermediateStopsCount,
      averageSpeedKmh: Math.round(effectiveSpeed)
    };
  }
}
