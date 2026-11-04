import dotenv from "dotenv";

dotenv.config();

function readPort(value: string | undefined): number {
  const port = Number(value ?? 3000);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Neplatný PORT: ${value}`);
  }

  return port;
}

function readMongoUri(value: string | undefined): string {
  const uri = value?.trim();

  if (!uri) {
    throw new Error("Chýba MONGODB_URI");
  }

  return uri;
}

export const env = {
  port: readPort(process.env.PORT),
  nodeEnv: process.env.NODE_ENV ?? "development",
  mongoUri: readMongoUri(process.env.MONGODB_URI),
};
