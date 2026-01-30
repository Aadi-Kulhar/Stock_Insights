export interface SectorCompetitors {
  company_name: string;
  ticker: string;
  sector: string;
  industry?: string;
  competitors: string[];
  related_keywords: string[];
}

export interface ScrapedArticle {
  title: string;
  summary: string | null;
  url: string;
  published_date: string | null;
}

export interface ScrapedNewsResult {
  source: string;
  articles: ScrapedArticle[];
}

export interface ArticleSentiment {
  title: string;
  source: string;
  sentiment: "positive" | "neutral" | "negative";
  relevance: number;
}

export interface SentimentAnalysis {
  overall_sentiment: "bullish" | "bearish" | "neutral" | "mixed";
  confidence_score: number;
  summary: string;
  key_themes: string[];
  article_sentiments: ArticleSentiment[];
  risk_factors?: string[];
  opportunities?: string[];
}

export interface PipelineResult {
  sectorData: SectorCompetitors;
  newsResults: ScrapedNewsResult[];
  sentiment: SentimentAnalysis;
}

export async function analyzeStock(stock: string): Promise<PipelineResult> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stock }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? "Analysis failed");
  }

  return res.json();
}
