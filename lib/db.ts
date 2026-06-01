import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/project-management';

interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseConnection | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached!.conn && cached!.conn.connection.readyState === 1) {
    return cached!.conn;
  }

  // Reset cache if connection is not ready (disconnected/closed)
  cached!.conn = null;
  cached!.promise = null;

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

  cached!.promise = connectWithRetry();

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default dbConnect;
