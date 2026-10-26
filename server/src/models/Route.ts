import mongoose, { Document, Schema } from 'mongoose';
import { isMongoConnected } from '../config/db';

export interface IRouteStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
  scheduledTime: string; // e.g. "07:45 AM"
  geofenceRadiusKm: number;
}

export interface IRoute {
  id: string;
  routeCode: string;
  name: string;
  description: string;
  totalDistanceKm: number;
  estimatedTotalMinutes: number;
  stops: IRouteStop[];
  polylineCoordinates: [number, number][]; // [lat, lng] array
  assignedBusId?: string;
  morningStartTime: string;
  eveningReturnTime: string;
}

export interface IRouteDocument extends Document, Omit<IRoute, 'id'> {}

const RouteStopSchema = new Schema<IRouteStop>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  order: { type: Number, required: true },
  scheduledTime: { type: String, required: true },
  geofenceRadiusKm: { type: Number, default: 1.0 }
});

const RouteSchema = new Schema<IRouteDocument>(
  {
    routeCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    totalDistanceKm: { type: Number, required: true },
    estimatedTotalMinutes: { type: Number, required: true },
    stops: [RouteStopSchema],
    polylineCoordinates: { type: [[Number]], required: true },
    assignedBusId: { type: String },
    morningStartTime: { type: String, required: true },
    eveningReturnTime: { type: String, required: true }
  },
  { timestamps: true }
);

export const RouteModel = mongoose.model<IRouteDocument>('Route', RouteSchema);

// Pre-seeded Nagpur college routes with real geolocations leading to JIT Lonara Campus
export const inMemoryRoutes: Map<string, IRoute> = new Map([
  [
    'ROUTE-01',
    {
      id: 'ROUTE-01',
      routeCode: 'R-01',
      name: 'Sitabuldi - Sadar - Koradi Rd Express',
      description: 'Zero Mile Sitabuldi via RBI, Sadar, Mankapur to JIT Lonara Campus',
      totalDistanceKm: 16.8,
      estimatedTotalMinutes: 42,
      assignedBusId: 'BUS-01',
      morningStartTime: '07:30 AM',
      eveningReturnTime: '04:15 PM',
      stops: [
        { id: 'STOP-101', name: 'Sitabuldi Interchange (Zero Mile)', lat: 21.1458, lng: 79.0882, order: 0, scheduledTime: '07:30 AM', geofenceRadiusKm: 1.0 },
        { id: 'STOP-102', name: 'RBI Square (Civil Lines)', lat: 21.1560, lng: 79.0820, order: 1, scheduledTime: '07:38 AM', geofenceRadiusKm: 1.0 },
        { id: 'STOP-103', name: 'Sadar Residency Road (Liberty Sq)', lat: 21.1685, lng: 79.0815, order: 2, scheduledTime: '07:45 AM', geofenceRadiusKm: 1.0 },
        { id: 'STOP-104', name: 'Mankapur Sports Complex / Ring Rd', lat: 21.1890, lng: 79.0840, order: 3, scheduledTime: '07:56 AM', geofenceRadiusKm: 1.0 },
        { id: 'STOP-105', name: 'Koradi Naka / Mahalaxmi Jagdamba', lat: 21.2110, lng: 79.0870, order: 4, scheduledTime: '08:08 AM', geofenceRadiusKm: 1.0 },
        { id: 'STOP-106', name: 'JIT Campus, Lonara Gate #1', lat: 21.2330, lng: 79.0880, order: 5, scheduledTime: '08:15 AM', geofenceRadiusKm: 1.0 }
      ],
      polylineCoordinates: [
        [21.1458, 79.0882],
        [21.1510, 79.0850],
        [21.1560, 79.0820],
        [21.1620, 79.0818],
        [21.1685, 79.0815],
        [21.1780, 79.0825],
        [21.1890, 79.0840],
        [21.1990, 79.0855],
        [21.2110, 79.0870],
        [21.2220, 79.0875],
        [21.2330, 79.0880]
      ]
    }
  ],
  [
    'ROUTE-02',
    {
      id: 'ROUTE-02',
      routeCode: 'R-02',
      name: 'Dharampeth - Seminary Hills - Katol Rd Route',
      description: 'West Nagpur pickup from Shivaji Nagar, Dharampeth, Katol Naka to JIT Campus',
      totalDistanceKm: 18.2,
      estimatedTotalMinutes: 48,
      assignedBusId: 'BUS-02',
      morningStartTime: '07:25 AM',
      eveningReturnTime: '04:15 PM',
      stops: [
        { id: 'STOP-201', name: 'Dharampeth Coffee House Sq', lat: 21.1420, lng: 79.0610, order: 0, scheduledTime: '07:25 AM', geofenceRadiusKm: 1.0 },
        { id: 'STOP-202', name: 'Law College Square', lat: 21.1490, lng: 79.0600, order: 1, scheduledTime: '07:33 AM', geofenceRadiusKm: 1.0 },
        { id: 'STOP-203', name: 'Ravi Nagar Square', lat: 21.1570, lng: 79.0550, order: 2, scheduledTime: '07:42 AM', geofenceRadiusKm: 1.0 },
        { id: 'STOP-204', name: 'Seminary Hills Airforce Gate', lat: 21.1690, lng: 79.0580, order: 3, scheduledTime: '07:51 AM', geofenceRadiusKm: 1.0 },
        { id: 'STOP-205', name: 'Katol Road Chhaoni / Friends Colony', lat: 21.1850, lng: 79.0660, order: 4, scheduledTime: '08:02 AM', geofenceRadiusKm: 1.0 },
        { id: 'STOP-206', name: 'JIT Campus, Lonara Gate #1', lat: 21.2330, lng: 79.0880, order: 5, scheduledTime: '08:15 AM', geofenceRadiusKm: 1.0 }
      ],
      polylineCoordinates: [
        [21.1420, 79.0610],
        [21.1490, 79.0600],
        [21.1570, 79.0550],
        [21.1630, 79.0560],
        [21.1690, 79.0580],
        [21.1760, 79.0610],
        [21.1850, 79.0660],
        [21.1980, 79.0740],
        [21.2150, 79.0810],
        [21.2330, 79.0880]
      ]
    }
  ],
  [
    'ROUTE-03',
    {
      id: 'ROUTE-03',
      routeCode: 'R-03',
      name: 'Wardha Rd - Medical Sq - Automotive Sq Route',
      description: 'South Nagpur line from Chatrapati Sq, Ajni, Kamal Chowk to JIT Lonara',
      totalDistanceKm: 21.5,
      estimatedTotalMinutes: 55,
      assignedBusId: 'BUS-03',
      morningStartTime: '07:15 AM',
      eveningReturnTime: '04:15 PM',
      stops: [
        { id: 'STOP-301', name: 'Chatrapati Square (Wardha Rd)', lat: 21.1030, lng: 79.0680, order: 0, scheduledTime: '07:15 AM', geofenceRadiusKm: 1.0 },
        { id: 'STOP-302', name: 'Rahate Colony Square', lat: 21.1210, lng: 79.0760, order: 1, scheduledTime: '07:24 AM', geofenceRadiusKm: 1.0 },
        { id: 'STOP-303', name: 'Medical Square / GMC Nagpur', lat: 21.1350, lng: 79.0980, order: 2, scheduledTime: '07:35 AM', geofenceRadiusKm: 1.0 },
        { id: 'STOP-304', name: 'Kamal Chowk / Indora', lat: 21.1720, lng: 79.1020, order: 3, scheduledTime: '07:48 AM', geofenceRadiusKm: 1.0 },
        { id: 'STOP-305', name: 'Automotive Square (Kamptee Rd)', lat: 21.1980, lng: 79.1090, order: 4, scheduledTime: '08:00 AM', geofenceRadiusKm: 1.0 },
        { id: 'STOP-306', name: 'JIT Campus, Lonara Gate #1', lat: 21.2330, lng: 79.0880, order: 5, scheduledTime: '08:15 AM', geofenceRadiusKm: 1.0 }
      ],
      polylineCoordinates: [
        [21.1030, 79.0680],
        [21.1120, 79.0720],
        [21.1210, 79.0760],
        [21.1350, 79.0980],
        [21.1550, 79.1010],
        [21.1720, 79.1020],
        [21.1850, 79.1050],
        [21.1980, 79.1090],
        [21.2180, 79.0980],
        [21.2330, 79.0880]
      ]
    }
  ]
]);

export class RouteRepository {
  static async getAll(): Promise<IRoute[]> {
    if (isMongoConnected) {
      const docs = await RouteModel.find().lean();
      return docs.map(doc => ({
        id: (doc as any)._id.toString(),
        routeCode: doc.routeCode,
        name: doc.name,
        description: doc.description,
        totalDistanceKm: doc.totalDistanceKm,
        estimatedTotalMinutes: doc.estimatedTotalMinutes,
        stops: doc.stops,
        polylineCoordinates: doc.polylineCoordinates as [number, number][],
        assignedBusId: doc.assignedBusId,
        morningStartTime: doc.morningStartTime,
        eveningReturnTime: doc.eveningReturnTime
      }));
    }
    return Array.from(inMemoryRoutes.values());
  }

  static async getById(id: string): Promise<IRoute | null> {
    if (isMongoConnected) {
      const doc = await RouteModel.findById(id).lean();
      if (!doc) return null;
      return {
        id: (doc as any)._id.toString(),
        routeCode: doc.routeCode,
        name: doc.name,
        description: doc.description,
        totalDistanceKm: doc.totalDistanceKm,
        estimatedTotalMinutes: doc.estimatedTotalMinutes,
        stops: doc.stops,
        polylineCoordinates: doc.polylineCoordinates as [number, number][],
        assignedBusId: doc.assignedBusId,
        morningStartTime: doc.morningStartTime,
        eveningReturnTime: doc.eveningReturnTime
      };
    }
    return inMemoryRoutes.get(id) || null;
  }
}
