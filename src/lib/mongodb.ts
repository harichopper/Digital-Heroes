/**
 * MongoDB singleton connection via Mongoose.
 * Uses a global cache to prevent creating multiple connections
 * during Next.js hot-reload in development.
 *
 * NOTE: MONGODB_URI is read inside connectDB() — NOT at module load —
 * so that Next.js correctly picks it up from .env.local at runtime.
 */
import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      '❌ MONGODB_URI is not defined. Add it to .env.local and RESTART the dev server.'
    );
  }

  // Reset cache if URI changed (e.g. after env reload)
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      .then((mongoose) => {
        console.log('✅ MongoDB connected');
        return mongoose;
      })
      .catch((err) => {
        cached.promise = null; // Reset so next call retries
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
