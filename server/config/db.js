import mongoose from "mongoose";

// The network path between this host and Atlas silently drops the pooled
// connection's TCP socket after it sits idle for a while (seen in practice
// as the first DB-backed request after a quiet period taking ~27s -- right
// up against Mongoose's default 30s serverSelectionTimeoutMS -- while a
// route that never touches the DB, like /api/health, stays instantly fast).
// Mongoose's driver doesn't notice the dead socket until a real query tries
// to use it and has to pay the full reconnect/server-selection cost. A
// trivial periodic ping keeps the pooled connection active so it's never
// idle long enough to be reaped.
const KEEPALIVE_INTERVAL_MS = 4 * 60 * 1000;

const startKeepAlive = () => {
  setInterval(() => {
    mongoose.connection.db?.admin()?.ping()?.catch(() => {});
  }, KEEPALIVE_INTERVAL_MS).unref();
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    startKeepAlive();
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
  }
};

export default connectDB;
