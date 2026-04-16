import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = parseInt(process.env.PORT || "5000", 10);

app.listen(PORT, () => {
  console.log(`ProfAI server running on port ${PORT}`);
});
