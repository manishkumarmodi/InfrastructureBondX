import { app } from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/db";

async function bootstrap() {
  await connectDatabase();
  app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`InfraBondX API listening on port ${env.PORT}`);
});
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
