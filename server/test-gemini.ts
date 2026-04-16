import "dotenv/config";
import { analyzeExam } from "./src/services/analysisService";

async function main() {
  const filePath = process.argv[2];
  const mimeType = process.argv[3] || "application/pdf";

  if (!filePath) {
    console.error("Usage: tsx test-gemini.ts <filePath> [mimeType]");
    process.exit(1);
  }

  console.log(`Analyzing: ${filePath} (${mimeType})`);
  console.log(`Model: ${process.env.GEMINI_MODEL || "default"}`);
  console.log(`API key present: ${!!process.env.GEMINI_API_KEY}`);
  console.log("---");

  const start = Date.now();
  const result = await analyzeExam(filePath, mimeType);
  const elapsed = Date.now() - start;

  console.log(`Took ${elapsed}ms`);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
