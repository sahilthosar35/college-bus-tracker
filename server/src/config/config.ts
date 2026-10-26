import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env if present
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  clientUrl: string;
  mongoUri: string;
  authSecret: string;
  adminEmail: string;
  adminPassword: string;
  adminName: string;
  collegeCoordinates: {
    lat: number;
    lng: number;
    name: string;
  };
  geofenceRadiusKm: number;
  nominalSpeedKmh: number;
  dwellTimeMinutesPerStop: number;
}

export const config: ServerConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/college_bus_tracker',
  authSecret: process.env.AUTH_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'local-development-only-secret-change-before-deploy'),
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  adminName: process.env.ADMIN_NAME || 'Transport Administrator',
  collegeCoordinates: {
    lat: parseFloat(process.env.COLLEGE_LAT || '21.2330'),
    lng: parseFloat(process.env.COLLEGE_LNG || '79.0880'),
    name: process.env.COLLEGE_NAME || 'Jhulelal Institute of Technology (JIT), Lonara, Nagpur'
  },
  geofenceRadiusKm: parseFloat(process.env.GEOFENCE_RADIUS_KM || '1.0'),
  nominalSpeedKmh: 25.0, // Standard urban bus speed for Nagpur routes
  dwellTimeMinutesPerStop: 1.5 // Average passenger boarding dwell time
};
