import dotenv from "dotenv";
import app from "./app";
import { bootJobs } from "./jobs/runner";

dotenv.config();

const PORT = parseInt(process.env.PORT || "5000", 10);

app.listen(PORT, async () => {
  console.log(`ProfAI server running on port ${PORT}`);
  if (process.env.RUN_JOBS === "1") {
    try {
      await bootJobs();
    } catch (err) {
      console.error("[jobs] failed to boot:", err);
    }
  }
});
