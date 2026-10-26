import mongoose, { Document, Schema } from 'mongoose';
import { isMongoConnected } from '../config/db';

export interface IBusLocation {
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  lastUpdated: string | Date;
}

export interface IBus {
  id: string;
  busNumber: string;
  registrationNumber: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  currentOccupancy: number;
  status: 'IDLE' | 'EN_ROUTE' | 'PAUSED' | 'DELAYED' | 'MAINTENANCE' | 'COMPLETED';
  routeId: string;
  currentLocation: IBusLocation;
  currentStopIndex: number;
  isSOS: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBusDocument extends Document, Omit<IBus, 'id'> {}

const BusSchema = new Schema<IBusDocument>(
  {
    busNumber: { type: String, required: true, unique: true },
    registrationNumber: { type: String, required: true },
    driverId: { type: String, required: true },
    driverName: { type: String, required: true },
    driverPhone: { type: String, required: true },
    capacity: { type: Number, required: true, default: 50 },
    currentOccupancy: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['IDLE', 'EN_ROUTE', 'PAUSED', 'DELAYED', 'MAINTENANCE', 'COMPLETED'],
      default: 'IDLE'
    },
    routeId: { type: String, required: true },
    currentLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      heading: { type: Number, default: 0 },
      speed: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now }
    },
    currentStopIndex: { type: Number, default: 0 },
    isSOS: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const BusModel = mongoose.model<IBusDocument>('Bus', BusSchema);

// In-Memory Fallback Store Pre-seeded with Real Nagpur College Buses
export const inMemoryBuses: Map<string, IBus> = new Map([
  [
    'BUS-01',
    {
      id: 'BUS-01',
      busNumber: 'Bus #01 - Sitabuldi Express',
      registrationNumber: 'MH-31-FC-2021',
      driverId: 'DRV-101',
      driverName: 'Suresh Meshram',
      driverPhone: '+91 94221 78901',
      capacity: 52,
      currentOccupancy: 38,
      status: 'EN_ROUTE',
      routeId: 'ROUTE-01',
      currentLocation: {
        lat: 21.1685,
        lng: 79.0815,
        heading: 15,
        speed: 32,
        lastUpdated: new Date().toISOString()
      },
      currentStopIndex: 2,
      isSOS: false
    }
  ],
  [
    'BUS-02',
    {
      id: 'BUS-02',
      busNumber: 'Bus #02 - Dharampeth & West Nagpur',
      registrationNumber: 'MH-31-FC-2045',
      driverId: 'DRV-102',
      driverName: 'Pravin Wankhede',
      driverPhone: '+91 98234 11223',
      capacity: 48,
      currentOccupancy: 42,
      status: 'EN_ROUTE',
      routeId: 'ROUTE-02',
      currentLocation: {
        lat: 21.1550,
        lng: 79.0620,
        heading: 40,
        speed: 28,
        lastUpdated: new Date().toISOString()
      },
      currentStopIndex: 1,
      isSOS: false
    }
  ],
  [
    'BUS-03',
    {
      id: 'BUS-03',
      busNumber: 'Bus #03 - Wardha Road & South Nagpur',
      registrationNumber: 'MH-31-FC-2088',
      driverId: 'DRV-103',
      driverName: 'Santosh Sharma',
      driverPhone: '+91 97654 33210',
      capacity: 55,
      currentOccupancy: 30,
      status: 'IDLE',
      routeId: 'ROUTE-03',
      currentLocation: {
        lat: 21.1030,
        lng: 79.0680,
        heading: 0,
        speed: 0,
        lastUpdated: new Date().toISOString()
      },
      currentStopIndex: 0,
      isSOS: false
    }
  ],
  [
    'BUS-04',
    {
      id: 'BUS-04',
      busNumber: 'Bus #04 - Koradi & Jaripatka Shuttler',
      registrationNumber: 'MH-31-FC-2104',
      driverId: 'DRV-104',
      driverName: 'Gajanan Dhoble',
      driverPhone: '+91 98901 65432',
      capacity: 50,
      currentOccupancy: 25,
      status: 'DELAYED',
      routeId: 'ROUTE-01',
      currentLocation: {
        lat: 21.2050,
        lng: 79.0880,
        heading: 10,
        speed: 8,
        lastUpdated: new Date().toISOString()
      },
      currentStopIndex: 4,
      isSOS: false
    }
  ]
]);

export class BusRepository {
  static async getAll(): Promise<IBus[]> {
    if (isMongoConnected) {
      const docs = await BusModel.find().lean();
      return docs.map(doc => ({
        id: (doc as any)._id.toString(),
        busNumber: doc.busNumber,
        registrationNumber: doc.registrationNumber,
        driverId: doc.driverId,
        driverName: doc.driverName,
        driverPhone: doc.driverPhone,
        capacity: doc.capacity,
        currentOccupancy: doc.currentOccupancy,
        status: doc.status,
        routeId: doc.routeId,
        currentLocation: {
          lat: doc.currentLocation.lat,
          lng: doc.currentLocation.lng,
          heading: doc.currentLocation.heading,
          speed: doc.currentLocation.speed,
          lastUpdated: doc.currentLocation.lastUpdated
        },
        currentStopIndex: doc.currentStopIndex,
        isSOS: doc.isSOS
      }));
    }
    return Array.from(inMemoryBuses.values());
  }

  static async getById(id: string): Promise<IBus | null> {
    if (isMongoConnected) {
      const doc = await BusModel.findById(id).lean();
      if (!doc) return null;
      return {
        id: (doc as any)._id.toString(),
        busNumber: doc.busNumber,
        registrationNumber: doc.registrationNumber,
        driverId: doc.driverId,
        driverName: doc.driverName,
        driverPhone: doc.driverPhone,
        capacity: doc.capacity,
        currentOccupancy: doc.currentOccupancy,
        status: doc.status,
        routeId: doc.routeId,
        currentLocation: {
          lat: doc.currentLocation.lat,
          lng: doc.currentLocation.lng,
          heading: doc.currentLocation.heading,
          speed: doc.currentLocation.speed,
          lastUpdated: doc.currentLocation.lastUpdated
        },
        currentStopIndex: doc.currentStopIndex,
        isSOS: doc.isSOS
      };
    }
    return inMemoryBuses.get(id) || null;
  }

  static async updateLocation(
    id: string,
    loc: IBusLocation,
    currentStopIndex?: number,
    tripStatus?: IBus['status']
  ): Promise<IBus | null> {
    if (isMongoConnected) {
      const updateData: any = {
        'currentLocation.lat': loc.lat,
        'currentLocation.lng': loc.lng,
        'currentLocation.heading': loc.heading,
        'currentLocation.speed': loc.speed,
        'currentLocation.lastUpdated': new Date()
      };
      if (typeof currentStopIndex === 'number') updateData.currentStopIndex = currentStopIndex;
      if (tripStatus) updateData.status = tripStatus;

      const updated = await BusModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
      if (!updated) return null;
      return {
        id: (updated as any)._id.toString(),
        busNumber: updated.busNumber,
        registrationNumber: updated.registrationNumber,
        driverId: updated.driverId,
        driverName: updated.driverName,
        driverPhone: updated.driverPhone,
        capacity: updated.capacity,
        currentOccupancy: updated.currentOccupancy,
        status: updated.status,
        routeId: updated.routeId,
        currentLocation: {
          lat: updated.currentLocation.lat,
          lng: updated.currentLocation.lng,
          heading: updated.currentLocation.heading,
          speed: updated.currentLocation.speed,
          lastUpdated: updated.currentLocation.lastUpdated
        },
        currentStopIndex: updated.currentStopIndex,
        isSOS: updated.isSOS
      };
    }

    const bus = inMemoryBuses.get(id);
    if (!bus) return null;
    bus.currentLocation = { ...loc, lastUpdated: new Date().toISOString() };
    if (typeof currentStopIndex === 'number') bus.currentStopIndex = currentStopIndex;
    if (tripStatus) bus.status = tripStatus;
    inMemoryBuses.set(id, bus);
    return bus;
  }

  static async updateStatus(id: string, status: IBus['status'], isSOS?: boolean): Promise<IBus | null> {
    if (isMongoConnected) {
      const updateData: any = { status };
      if (typeof isSOS === 'boolean') updateData.isSOS = isSOS;
      const updated = await BusModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
      if (!updated) return null;
      return {
        id: (updated as any)._id.toString(),
        busNumber: updated.busNumber,
        registrationNumber: updated.registrationNumber,
        driverId: updated.driverId,
        driverName: updated.driverName,
        driverPhone: updated.driverPhone,
        capacity: updated.capacity,
        currentOccupancy: updated.currentOccupancy,
        status: updated.status,
        routeId: updated.routeId,
        currentLocation: {
          lat: updated.currentLocation.lat,
          lng: updated.currentLocation.lng,
          heading: updated.currentLocation.heading,
          speed: updated.currentLocation.speed,
          lastUpdated: updated.currentLocation.lastUpdated
        },
        currentStopIndex: updated.currentStopIndex,
        isSOS: updated.isSOS
      };
    }

    const bus = inMemoryBuses.get(id);
    if (!bus) return null;
    bus.status = status;
    if (typeof isSOS === 'boolean') bus.isSOS = isSOS;
    inMemoryBuses.set(id, bus);
    return bus;
  }
}
