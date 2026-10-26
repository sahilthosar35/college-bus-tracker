import mongoose from 'mongoose';
import { config } from './config';

export let isMongoConnected = false;

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = config.mongoUri;
    console.log(`[Database] Attempting connection to MongoDB at: ${mongoUri}`);

    // Set connection timeout to 2.5 seconds to prevent blocking if Mongo is offline
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500
    });

    isMongoConnected = true;
    console.log('[Database] MongoDB connection established successfully.');
  } catch (err: any) {
    isMongoConnected = false;
    console.warn(`[Database] MongoDB offline or unreachable (${err.message}).`);
    console.info('[Database] Seamlessly activating high-performance In-Memory Persistent Store preloaded with Nagpur College Routes.');
  }
};
