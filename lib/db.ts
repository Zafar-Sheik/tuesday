import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/project-management';

interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseConnection | undefined;
}

// Initialize cached connection object if it doesn't exist
let cached: MongooseConnection = global.mongoose ?? { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  // If we have a cached connection that's connected, return it
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  // If we already have a connection promise in progress, wait for it
  if (cached.promise) {
    return cached.promise;
  }

  // No connection attempt in progress, create one
  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  };

  const connectWithRetry = async (retries = 3, delay = 1000): Promise<typeof mongoose> => {
    try {
      const mongooseInstance = await mongoose.connect(MONGODB_URI, opts);
      return mongooseInstance;
    } catch (error) {
      if (retries <= 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectWithRetry(retries - 1, delay * 1.5);
    }
  };

  // Set the promise to track the connection attempt
  cached.promise = connectWithRetry();

  try {
    // Wait for the connection to complete and cache it
    cached.conn = await cached.promise;
  } catch (e) {
    // If connection failed, clear the promise so next attempt can retry
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;