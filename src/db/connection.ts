import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "../config/env.js";

const databaseName = "goodboy";

export async function connectDatabase(): Promise<void> {
  if (env.mongoUri.startsWith("mongodb+srv:")) {
    // Lokálne DNS odmieta SRV dotazy, ktoré mongodb+srv potrebuje.
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }

  await mongoose.connect(env.mongoUri, {
    dbName: databaseName,
    serverSelectionTimeoutMS: 10_000,
  });
}

export function databaseStatus():
  | "connected"
  | "connecting"
  | "disconnecting"
  | "disconnected" {
  switch (mongoose.connection.readyState) {
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    default:
      return "disconnected";
  }
}
