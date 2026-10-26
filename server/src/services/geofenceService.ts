import { ETAService } from './etaService';
import { IRouteStop } from '../models/Route';
import { AlertRepository } from '../models/Alert';

export interface GeofenceTriggerResult {
  hasTriggered: boolean;
  stop: IRouteStop | null;
  distanceKm: number;
  message: string;
}

export class GeofenceService {
  // Store trigger history to avoid sending repeated alerts for the same stop within 10 minutes
  private static recentTriggers: Map<string, number> = new Map();

  /**
   * Evaluates if current coordinates are within any stop's geofence boundary (default 1.0 km)
   */
  public static checkProximity(
    busId: string,
    busNumber: string,
    currentLat: number,
    currentLng: number,
    stops: IRouteStop[]
  ): GeofenceTriggerResult {
    const DEFAULT_RADIUS_KM = 1.0;

    for (const stop of stops) {
      const distance = ETAService.calculateHaversineDistance(
        currentLat,
        currentLng,
        stop.lat,
        stop.lng
      );

      const threshold = stop.geofenceRadiusKm || DEFAULT_RADIUS_KM;

      if (distance <= threshold) {
        const triggerKey = `${busId}_${stop.id}`;
        const lastTrigger = GeofenceService.recentTriggers.get(triggerKey);
        const now = Date.now();

        // 10-minute cooldown per stop per bus
        if (!lastTrigger || now - lastTrigger > 10 * 60 * 1000) {
          GeofenceService.recentTriggers.set(triggerKey, now);

          const message = `Bus ${busNumber} is approaching ${stop.name} (~${Math.round(distance * 1000)}m away). Please proceed to the boarding point.`;

          // Log to system alerts
          AlertRepository.createAlert({
            busId,
            busNumber,
            type: 'GEOFENCE_APPROACH',
            severity: 'LOW',
            message,
            location: { lat: currentLat, lng: currentLng },
            status: 'ACTIVE',
            reportedBy: 'SYSTEM'
          }).catch(err => console.error('[Geofence] Error logging alert:', err));

          return {
            hasTriggered: true,
            stop,
            distanceKm: distance,
            message
          };
        }
      }
    }

    return {
      hasTriggered: false,
      stop: null,
      distanceKm: -1,
      message: ''
    };
  }

  public static clearTripCache(busId: string): void {
    for (const key of GeofenceService.recentTriggers.keys()) {
      if (key.startsWith(`${busId}_`)) {
        GeofenceService.recentTriggers.delete(key);
      }
    }
  }
}
