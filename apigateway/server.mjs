import { createServer } from "node:http";
import { loadConfig } from "./config/config.mjs";
import { connectMongoDB, disconnectMongoDB } from "./domain/db.mongo.mjs";
import app from "./app.mjs";

const config = loadConfig();
const port = config.httpPort;
const hostname = config.hostName;

const server = createServer(app);

// Connect to MongoDB before accepting traffic, then start the HTTP server.
connectMongoDB(config)
  .then(() => {
    server.listen(port, hostname, () => {
      console.log(`[backend] HTTP server running at http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error("[backend] Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

server.on("error", (error) => {
  switch (error.code) {
    case "EACCES":
      console.error(`Port ${port} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`Port ${port} is already in use`);
      process.exit(1);
      break;
    default:
      console.error(`Server error: ${error.message}`);
      throw error;
  }
});

async function shutdown() {
  console.log("[backend] Shutting down...");
  server.close(async () => {
    try {
      await disconnectMongoDB();
    } finally {
      process.exit(0);
    }
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
