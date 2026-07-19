import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

const bootstrap = async () => {
  await connectDatabase();
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to bootstrap server", error);
  process.exit(1);
});

