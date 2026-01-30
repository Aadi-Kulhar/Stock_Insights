import { getSectorAndCompetitors, analyzeSentiment, type SectorCompetitors, type SentimentAnalysis } from "./gemini.js";
import { scrapeNewsInParallel, type ScrapedNewsResult } from "./mino.js";

export type PipelinePhase = "sector" | "news" | "sentiment" | "done";

export interface PipelineProgress {
  phase: PipelinePhase;
  message: string;
  newsCompleted?: number;
  newsTotal?: number;
}

export interface PipelineResult {
  sectorData: SectorCompetitors;
  newsResults: ScrapedNewsResult[];
  sentiment: SentimentAnalysis;
}

export async function runPipeline(
  stockInput: string,
  onProgress?: (p: PipelineProgress) => void
): Promise<PipelineResult> {
  onProgress?.({ phase: "sector", message: "Fetching company info..." });

  const sectorData = await getSectorAndCompetitors(stockInput.trim());

  onProgress?.({
    phase: "news",
    message: "Scraping finance news...",
    newsCompleted: 0,
    newsTotal: 6,
  });

  const newsResults = await scrapeNewsInParallel(
    sectorData,
    (completed, total) => {
      onProgress?.({
        phase: "news",
        message: `Scraping news (${completed}/${total} sites)`,
        newsCompleted: completed,
        newsTotal: total,
      });
    }
  );

  if (newsResults.length === 0) {
    throw new Error(
      "Could not retrieve news from any source. Please try again later."
    );
  }

  onProgress?.({ phase: "sentiment", message: "Analyzing sentiment..." });

  const newsPayload = {
    sources: newsResults.map((r) => ({
      source: r.source,
      articles: r.articles,
    })),
  };

  const sentiment = await analyzeSentiment(sectorData.company_name, newsPayload);

  onProgress?.({ phase: "done", message: "Complete" });

  return { sectorData, newsResults, sentiment };
}
