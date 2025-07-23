import mongoose from 'mongoose';
const MONGODB_URI = process.env.MONGODB_URI as string;
    
    if (!MONGODB_URI || MONGODB_URI.trim()==='') {
      throw new Error('Please define the MONGODB_URI environment variable');
    }
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

// Use custom global to avoid conflict with imported `mongoose`
let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
    

let cached = global.mongooseCache!;
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

function mongoClient() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoClient not initialized. Call connectDB() first.');
  }
  return mongoose.connection.getClient(); 
}

export default connectDB;
export { mongoClient };
