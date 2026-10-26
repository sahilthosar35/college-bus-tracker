import mongoose, { Document, Schema } from 'mongoose';
import { isMongoConnected } from '../config/db';

export type AlertType = 'SOS' | 'BREAKDOWN' | 'TRAFFIC_JAM' | 'ROUTE_DEVIATION' | 'GEOFENCE_APPROACH' | 'OVER_SPEED';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'RESOLVED' | 'DISMISSED';

export interface IAlert {
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
  timestamp: string | Date;
  resolvedAt?: string | Date;
}

export interface IAlertDocument extends Document, Omit<IAlert, 'id'> {}

const AlertSchema = new Schema<IAlertDocument>(
  {
    busId: { type: String, required: true, index: true },
    busNumber: { type: String, required: true },
    type: {
      type: String,
      enum: ['SOS', 'BREAKDOWN', 'TRAFFIC_JAM', 'ROUTE_DEVIATION', 'GEOFENCE_APPROACH', 'OVER_SPEED'],
      required: true
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM'
    },
    message: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'RESOLVED', 'DISMISSED'],
      default: 'ACTIVE',
      index: true
    },
    reportedBy: {
      type: String,
      enum: ['DRIVER', 'STUDENT', 'SYSTEM'],
      default: 'SYSTEM'
    },
    timestamp: { type: Date, default: Date.now, index: true },
    resolvedAt: { type: Date }
  },
  { timestamps: true }
);

export const AlertModel = mongoose.model<IAlertDocument>('Alert', AlertSchema);

// In-Memory Pre-seeded Alerts
export const inMemoryAlerts: IAlert[] = [
  {
    id: 'ALT-1001',
    busId: 'BUS-04',
    busNumber: 'Bus #04 - Koradi & Jaripatka Shuttler',
    type: 'TRAFFIC_JAM',
    severity: 'MEDIUM',
    message: 'Heavy traffic congestion reported at Koradi flyover junction. 12-min delay expected.',
    location: { lat: 21.2050, lng: 79.0880 },
    status: 'ACTIVE',
    reportedBy: 'DRIVER',
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString()
  },
  {
    id: 'ALT-1002',
    busId: 'BUS-01',
    busNumber: 'Bus #01 - Sitabuldi Express',
    type: 'GEOFENCE_APPROACH',
    severity: 'LOW',
    message: 'Bus #01 has entered the 1.0 km approach zone for Sadar Residency Road stop.',
    location: { lat: 21.1685, lng: 79.0815 },
    status: 'ACTIVE',
    reportedBy: 'SYSTEM',
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  }
];

export class AlertRepository {
  static async getAll(activeOnly: boolean = false): Promise<IAlert[]> {
    if (isMongoConnected) {
      const filter = activeOnly ? { status: 'ACTIVE' } : {};
      const docs = await AlertModel.find(filter).sort({ timestamp: -1 }).lean();
      return docs.map(doc => ({
        id: (doc as any)._id.toString(),
        busId: doc.busId,
        busNumber: doc.busNumber,
        type: doc.type,
        severity: doc.severity,
        message: doc.message,
        location: doc.location,
        status: doc.status,
        reportedBy: doc.reportedBy,
        timestamp: doc.timestamp,
        resolvedAt: doc.resolvedAt
      }));
    }
    return activeOnly ? inMemoryAlerts.filter(a => a.status === 'ACTIVE') : [...inMemoryAlerts];
  }

  static async createAlert(alertData: Omit<IAlert, 'id' | 'timestamp'>): Promise<IAlert> {
    const newAlert: IAlert = {
      ...alertData,
      id: `ALT-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString()
    };

    if (isMongoConnected) {
      try {
        const doc = await AlertModel.create(newAlert);
        return {
          id: (doc as any)._id.toString(),
          busId: doc.busId,
          busNumber: doc.busNumber,
          type: doc.type,
          severity: doc.severity,
          message: doc.message,
          location: doc.location,
          status: doc.status,
          reportedBy: doc.reportedBy,
          timestamp: doc.timestamp,
          resolvedAt: doc.resolvedAt
        };
      } catch (err) {
        console.error('[Alert] Error creating alert in Mongo:', err);
      }
    }

    inMemoryAlerts.unshift(newAlert);
    return newAlert;
  }

  static async resolveAlert(id: string): Promise<IAlert | null> {
    if (isMongoConnected) {
      const updated = await AlertModel.findByIdAndUpdate(
        id,
        { $set: { status: 'RESOLVED', resolvedAt: new Date() } },
        { new: true }
      ).lean();
      if (!updated) return null;
      return {
        id: (updated as any)._id.toString(),
        busId: updated.busId,
        busNumber: updated.busNumber,
        type: updated.type,
        severity: updated.severity,
        message: updated.message,
        location: updated.location,
        status: updated.status,
        reportedBy: updated.reportedBy,
        timestamp: updated.timestamp,
        resolvedAt: updated.resolvedAt
      };
    }

    const item = inMemoryAlerts.find(a => a.id === id);
    if (!item) return null;
    item.status = 'RESOLVED';
    item.resolvedAt = new Date().toISOString();
    return item;
  }
}
