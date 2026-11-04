import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { keepAlive } from "./utils/keepAlive.js";
import { connectDatabase } from "./db/connection.js";

function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Neznáma chyba";
  return message.replace(/mongodb(?:\+srv)?:\/\/\S+/gi, "mongodb://***");
}

async function main(): Promise<void> {
  await connectDatabase();

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Server beží na http://localhost:${env.port}`);
    keepAlive();
  });
}

main().catch((error: unknown) => {
  console.error(`Server sa nespustil: ${safeErrorMessage(error)}`);
  process.exit(1);
});
