import "dotenv/config";
import express from "express";
import cors from "cors";
import { runPipeline } from "./orchestrator.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.post("/api/analyze", async (req, res) => {
  const { stock } = req.body as { stock?: string };
  if (!stock || typeof stock !== "string") {
    res.status(400).json({ error: "Missing or invalid 'stock' field" });
    return;
  }

  try {
    const result = await runPipeline(stock);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status =
      message.includes("Company not found") ||
      message.includes("GEMINI_API_KEY") ||
      message.includes("MINO_API_KEY")
        ? 400
        : 500;
    res.status(status).json({ error: message });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
