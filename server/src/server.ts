// ============================================================
// SERVER ENTRY POINT — Starts the Express server
// Connects to the database and begins listening for requests
// ============================================================

import { createApp } from "./app";
import { connectDatabase } from "./database/connection";
import { envConfig } from "./config/env.config";

/**
 * startServer — Main entry point for the application.
 *
 * Sequence:
 *   1. Connect to MongoDB
 *   2. Create Express app
 *   3. Start listening on configured port
 *   4. Log startup info
 *
 * On failure, logs error and exits process.
 */
const startServer = async (): Promise<void> => {
  try {
    // Step 1: Connect to MongoDB
    await connectDatabase();

    // Step 2: Create the Express application
    const app = createApp();

    // Step 3: Start the HTTP server
    const PORT = envConfig.PORT;
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 E-Commerce Server is running!               ║
║                                                   ║
║   🌐 URL:  http://localhost:${PORT}                ║
║   📦 Mode: ${envConfig.NODE_ENV.padEnd(20)}       ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// ---- Start the server ----
startServer();

// ---- Graceful shutdown ----
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received. Shutting down gracefully...");
  process.exit(0);
});
