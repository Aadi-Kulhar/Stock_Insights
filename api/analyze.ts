import type { VercelRequest, VercelResponse } from "@vercel/node";
import { runPipeline } from "../backend/dist/orchestrator.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { stock } = (req.body ?? {}) as { stock?: string };
  if (!stock || typeof stock !== "string") {
    res.status(400).json({ error: "Missing or invalid 'stock' field" });
    return;
  }

  try {
    const result = await runPipeline(stock.trim());
    res.status(200).json(result);
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
}
