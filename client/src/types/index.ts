export type AppRole = 'student' | 'driver' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  assignedBusId?: string;
}

export interface BusLocation {
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  lastUpdated: string;
}

export type BusStatus = 'IDLE' | 'EN_ROUTE' | 'PAUSED' | 'DELAYED' | 'MAINTENANCE' | 'COMPLETED';

export interface Bus {
  id: string;
  busNumber: string;
  registrationNumber: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  currentOccupancy: number;
  status: BusStatus;
  routeId: string;
  currentLocation: BusLocation;
  currentStopIndex: number;
  isSOS: boolean;
}

export interface RouteStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
  scheduledTime: string;
  geofenceRadiusKm: number;
}

export interface Route {
  id: string;
  routeCode: string;
  name: string;
  description: string;
  totalDistanceKm: number;
  estimatedTotalMinutes: number;
  stops: RouteStop[];
  polylineCoordinates: [number, number][];
  assignedBusId?: string;
  morningStartTime: string;
  eveningReturnTime: string;
}

export interface ETAResult {
  stopId: string;
  stopName: string;
  distanceKm: number;
  etaMinutes: number;
  formattedEta: string;
  statusBadge: 'ON_TIME' | 'MODERATE_DELAY' | 'HEAVY_TRAFFIC';
  delayMinutes: number;
  intermediateStopsCount: number;
  averageSpeedKmh: number;
}

export type AlertType = 'SOS' | 'BREAKDOWN' | 'TRAFFIC_JAM' | 'ROUTE_DEVIATION' | 'GEOFENCE_APPROACH' | 'OVER_SPEED';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'RESOLVED' | 'DISMISSED';

export interface Alert {
  id: string;
  busId: string;
  busNumber: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  location: {
    lat: number;
    lng: number;
  };
  status: AlertStatus;
  reportedBy: 'DRIVER' | 'STUDENT' | 'SYSTEM';
  timestamp: string;
  resolvedAt?: string;
}

export interface GeofenceEvent {
  busId: string;
  busNumber: string;
  stop: RouteStop;
  distanceKm: number;
  message: string;
  timestamp: string;
}
