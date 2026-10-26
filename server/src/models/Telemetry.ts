import mongoose, { Document, Schema } from 'mongoose';
import { isMongoConnected } from '../config/db';

export interface ITelemetry {
  id?: string;
  busId: string;
  lat: number;
  lng: number;
  speed: number; // in km/h
  heading: number; // in degrees (0 - 360)
  accuracy?: number; // in meters
  currentStopIndex?: number;
  timestamp: string | Date;
}

export interface ITelemetryDocument extends Document, Omit<ITelemetry, 'id'> {}

const TelemetrySchema = new Schema<ITelemetryDocument>(
  {
    busId: { type: String, required: true, index: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    speed: { type: Number, required: true },
    heading: { type: Number, default: 0 },
    accuracy: { type: Number },
    currentStopIndex: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

export const TelemetryModel = mongoose.model<ITelemetryDocument>('Telemetry', TelemetrySchema);

// Memory buffer for recent telemetry updates (keeps last 50 per bus)
export const inMemoryTelemetry: Map<string, ITelemetry[]> = new Map();

export class TelemetryRepository {
  static async logTelemetry(data: ITelemetry): Promise<ITelemetry> {
    const record: ITelemetry = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString()
    };

    if (isMongoConnected) {
      try {
        const doc = await TelemetryModel.create(record);
        return {
          id: (doc as any)._id.toString(),
          busId: doc.busId,
          lat: doc.lat,
          lng: doc.lng,
          speed: doc.speed,
          heading: doc.heading,
          accuracy: doc.accuracy,
          currentStopIndex: doc.currentStopIndex,
          timestamp: doc.timestamp
        };
      } catch (err) {
        console.error('[Telemetry] Error saving to MongoDB:', err);
      }
    }

    const list = inMemoryTelemetry.get(data.busId) || [];
    list.unshift(record);
    if (list.length > 50) list.pop();
    inMemoryTelemetry.set(data.busId, list);
    return record;
  }

  static async getLatest(busId: string): Promise<ITelemetry | null> {
    if (isMongoConnected) {
      const doc = await TelemetryModel.findOne({ busId }).sort({ timestamp: -1 }).lean();
      if (!doc) return null;
      return {
        id: (doc as any)._id.toString(),
        busId: doc.busId,
        lat: doc.lat,
        lng: doc.lng,
        speed: doc.speed,
        heading: doc.heading,
        accuracy: doc.accuracy,
        currentStopIndex: doc.currentStopIndex,
        timestamp: doc.timestamp
      };
    }

    const list = inMemoryTelemetry.get(busId);
    return list && list.length > 0 ? list[0] : null;
  }
}
