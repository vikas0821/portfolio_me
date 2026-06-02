import mongoose from "mongoose";

// Suppress Mongoose's own deprecation warnings cleanly
mongoose.set("strictQuery", true);

global.isMongoDBconnected = false;

export const connectMongoDB = async (config) => {
  if (global.isMongoDBconnected) return mongoose;

  try {
    await mongoose.connect(config.mongo.uri, config.mongo.options);
    global.isMongoDBconnected = true;
    console.log(`[MongoDB] Connected → ${config.mongo.uri.replace(/\/\/.*@/, "//***@")}`);
  } catch (err) {
    console.error("[MongoDB] Connection failed:", err.message);
    throw err;
  }

  mongoose.connection.on("disconnected", () => {
    global.isMongoDBconnected = false;
    console.warn("[MongoDB] Disconnected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[MongoDB] Error:", err.message);
  });

  return mongoose;
};

export const disconnectMongoDB = async () => {
  if (!global.isMongoDBconnected) return;
  await mongoose.disconnect();
  global.isMongoDBconnected = false;
  console.log("[MongoDB] Disconnected cleanly");
};
