import { buildMinoNewsGoal } from "./prompts.js";
import type { SectorCompetitors } from "./gemini.js";

const MINO_API_URL = "https://mino.ai/v1/automation/run";

export interface NewsSource {
  name: string;
  url: (query: string, ticker?: string) => string;
  useStealth?: boolean;
}

export const NEWS_SOURCES: NewsSource[] = [
  {
    name: "Reuters",
    url: (q) => `https://www.reuters.com/search/news?blob=${encodeURIComponent(q)}`,
  },
  {
    name: "Yahoo Finance",
    url: (_, ticker) =>
      ticker
        ? `https://finance.yahoo.com/quote/${ticker}/news`
        : `https://finance.yahoo.com/news/?q=${encodeURIComponent("stocks")}`,
  },
  {
    name: "CNBC",
    url: (q) => `https://www.cnbc.com/search/?query=${encodeURIComponent(q)}`,
  },
  {
    name: "MarketWatch",
    url: (q) => `https://www.marketwatch.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    name: "Seeking Alpha",
    url: (q) => `https://seekingalpha.com/search?q=${encodeURIComponent(q)}`,
    useStealth: true,
  },
  {
    name: "BBC Business",
    url: (q) => `https://www.bbc.com/search?q=${encodeURIComponent(q + " business")}`,
  },
];

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

async function runMinoAutomation(
  url: string,
  goal: string,
  useStealth = false
): Promise<Record<string, unknown> | null> {
  const apiKey = process.env.MINO_API_KEY;
  if (!apiKey) throw new Error("MINO_API_KEY is required");

  const res = await fetch(MINO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      url,
      goal,
      browser_profile: useStealth ? "stealth" : "lite",
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`MINO request failed (${res.status}):`, err);
    return null;
  }

  const data = (await res.json()) as {
    status?: string;
    result?: Record<string, unknown>;
    error?: { message?: string };
  };

  if (data.status === "FAILED" || data.error) {
    console.error("MINO run failed:", data.error?.message ?? data);
    return null;
  }

  return (data.result ?? null) as Record<string, unknown> | null;
}

function normalizeScrapedResult(raw: Record<string, unknown>, sourceName: string): ScrapedNewsResult {
  const articles: ScrapedArticle[] = [];

  const rawArticles = raw.articles ?? raw.Articles;
  const arr = Array.isArray(rawArticles) ? rawArticles : [];

  for (const item of arr) {
    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      articles.push({
        title: String(obj.title ?? obj.Title ?? ""),
        summary: obj.summary ?? obj.Summary ? String(obj.summary ?? obj.Summary) : null,
        url: String(obj.url ?? obj.URL ?? obj.link ?? ""),
        published_date: obj.published_date ?? obj.publishedDate
          ? String(obj.published_date ?? obj.publishedDate)
          : null,
      });
    }
  }

  return { source: sourceName, articles };
}

export async function scrapeNewsInParallel(
  sectorData: SectorCompetitors,
  onProgress?: (completed: number, total: number) => void
): Promise<ScrapedNewsResult[]> {
  const { company_name, ticker, sector, competitors, related_keywords } = sectorData;

  const queries: { query: string; source: NewsSource }[] = [];
  const companyQuery = `${company_name} OR ${ticker}`;

  for (const src of NEWS_SOURCES) {
    const q = companyQuery;
    queries.push({ query: q, source: src });
  }

  const total = queries.length;
  let completed = 0;
  const results: ScrapedNewsResult[] = [];

  const runOne = async (q: string, src: NewsSource): Promise<ScrapedNewsResult | null> => {
    const url = src.url(q, ticker);
    const goal = buildMinoNewsGoal(q, src.name);
    const raw = await runMinoAutomation(url, goal, src.useStealth);
    completed++;
    onProgress?.(completed, total);
    if (raw) return normalizeScrapedResult(raw, src.name);
    return null;
  };

  const promises = queries.map(({ query, source }) => runOne(query, source));
  const outputs = await Promise.all(promises);

  for (const out of outputs) {
    if (out && out.articles.length > 0) results.push(out);
  }

  return results;
}
