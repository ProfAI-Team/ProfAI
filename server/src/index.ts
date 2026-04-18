import dotenv from "dotenv";
import app from "./app";
import { bootJobs } from "./jobs/runner";
import { logger } from "./lib/logger";

dotenv.config();

const PORT = parseInt(process.env.PORT || "5000", 10);

app.listen(PORT, async () => {
  logger.info({ port: PORT }, "ProfAI server listening");
  if (process.env.RUN_JOBS === "1") {
    try {
      await bootJobs();
    } catch (err) {
      logger.error({ err }, "[jobs] failed to boot");
    }
  }
});
