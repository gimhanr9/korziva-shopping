import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Korziva API server running on http://localhost:${env.PORT}`);
  console.log(`📋 Health check available at http://localhost:${env.PORT}/api/health`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log("\n⏳ Gracefully shutting down Korziva API server...");
  server.close(() => {
    console.log("🛑 Korziva API server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
