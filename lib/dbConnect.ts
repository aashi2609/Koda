import mongoose from 'mongoose';

// Extend the global namespace to include mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}

// Initialize the cache on the global object
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Database connection utility using singleton pattern for serverless environments.
 * Reuses existing connections when available to optimize performance.
 * 
 * @throws {Error} If MONGODB_URI environment variable is not defined
 * @returns {Promise<mongoose.Mongoose>} The mongoose connection instance
 */
async function dbConnect(): Promise<mongoose.Mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Validate that connection string is provided
  if (!process.env.MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }

  // Create new connection promise if none exists
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts);
  }

  try {
    // Wait for connection to establish
    cached.conn = await cached.promise;
  } catch (error) {
    // Clear the promise on error so next call will retry
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;
