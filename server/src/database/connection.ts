// ============================================================
// DATABASE CONNECTION — Mongoose connection to MongoDB
// Handles connect, disconnect, and connection error events
// ============================================================

import mongoose from "mongoose";
import { dbConfig } from "../config/db.config";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer: MongoMemoryServer | null = null;

/**
 * connectDatabase — Establishes connection to MongoDB
 * Logs success or exits process on failure.
 * Call this once at server startup.
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(dbConfig.uri, dbConfig.options);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error: any) {
    if (error.name === 'MongooseServerSelectionError' || (error.message && error.message.includes('ECONNREFUSED'))) {
      console.warn("⚠️  Local MongoDB not found. Starting in-memory database (data will not persist!)...");
      try {
        memoryServer = await MongoMemoryServer.create();
        const uri = memoryServer.getUri();
        await mongoose.connect(uri);
        console.log(`✅ In-memory MongoDB connected at: ${uri}`);
      } catch (memError) {
        console.error("❌ Failed to start in-memory MongoDB:", memError);
        process.exit(1);
      }
    } else {
      console.error("❌ MongoDB connection error:", error);
      process.exit(1);
    }
  }
};

/**
 * disconnectDatabase — Gracefully closes the MongoDB connection
 * Use during server shutdown or testing teardown.
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    console.log("🔌 MongoDB disconnected");
  } catch (error) {
    console.error("❌ MongoDB disconnect error:", error);
  }
};

// --- Connection event listeners for monitoring ---
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected");
});
