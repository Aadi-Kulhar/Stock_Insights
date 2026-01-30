import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { SECTOR_COMPETITORS_SYSTEM, SENTIMENT_ANALYSIS_SYSTEM } from "./prompts.js";

const SectorCompetitorsSchema = z.object({
  company_name: z.string(),
  ticker: z.string(),
  sector: z.string(),
  industry: z.string().optional(),
  competitors: z.array(z.string()).min(1).max(10),
  related_keywords: z.array(z.string()).max(8),
});

const ArticleSentimentSchema = z.object({
  title: z.string(),
  source: z.string(),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  relevance: z.number().min(0).max(1),
});

const SentimentAnalysisSchema = z.object({
  overall_sentiment: z.enum(["bullish", "bearish", "neutral", "mixed"]),
  confidence_score: z.number().min(0).max(1),
  summary: z.string(),
  key_themes: z.array(z.string()).max(5),
  article_sentiments: z.array(ArticleSentimentSchema),
  risk_factors: z.array(z.string()).max(5).optional(),
  opportunities: z.array(z.string()).max(5).optional(),
});

export type SectorCompetitors = z.infer<typeof SectorCompetitorsSchema>;
export type SentimentAnalysis = z.infer<typeof SentimentAnalysisSchema>;

const SECTOR_SCHEMA = {
  type: "object",
  properties: {
    company_name: { type: "string", description: "Legal or common company name" },
    ticker: { type: "string", description: "Primary exchange symbol" },
    sector: { type: "string", description: "e.g. Technology, Healthcare" },
    industry: { type: "string", description: "e.g. Software, Pharmaceuticals" },
    competitors: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      maxItems: 10,
      description: "Direct competitor company names",
    },
    related_keywords: {
      type: "array",
      items: { type: "string" },
      maxItems: 8,
      description: "Sector/industry terms for news search",
    },
  },
  required: ["company_name", "ticker", "sector", "competitors", "related_keywords"],
};

const SENTIMENT_SCHEMA = {
  type: "object",
  properties: {
    overall_sentiment: {
      type: "string",
      enum: ["bullish", "bearish", "neutral", "mixed"],
      description: "Aggregate sentiment",
    },
    confidence_score: {
      type: "number",
      minimum: 0,
      maximum: 1,
      description: "Confidence 0-1",
    },
    summary: { type: "string", description: "Executive summary" },
    key_themes: {
      type: "array",
      items: { type: "string" },
      maxItems: 5,
      description: "Main topics",
    },
    article_sentiments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          source: { type: "string" },
          sentiment: {
            type: "string",
            enum: ["positive", "neutral", "negative"],
          },
          relevance: { type: "number", minimum: 0, maximum: 1 },
        },
        required: ["title", "source", "sentiment", "relevance"],
      },
      description: "Per-article sentiment",
    },
    risk_factors: {
      type: "array",
      items: { type: "string" },
      maxItems: 5,
      description: "Risk factors from news",
    },
    opportunities: {
      type: "array",
      items: { type: "string" },
      maxItems: 5,
      description: "Opportunities from news",
    },
  },
  required: ["overall_sentiment", "confidence_score", "summary", "key_themes", "article_sentiments"],
};

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is required");
  return new GoogleGenAI({ apiKey });
}

export async function getSectorAndCompetitors(stockInput: string): Promise<SectorCompetitors> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `${SECTOR_COMPETITORS_SYSTEM}\n\nStock or company: ${stockInput}`,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: SECTOR_SCHEMA,
    } as Record<string, unknown>,
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from Gemini");

  const parsed = JSON.parse(text.trim()) as unknown;
  return SectorCompetitorsSchema.parse(parsed);
}

export async function analyzeSentiment(
  companyName: string,
  newsJson: Record<string, unknown>
): Promise<SentimentAnalysis> {
  const ai = getClient();
  const prompt = `${SENTIMENT_ANALYSIS_SYSTEM}\n\nCompany: ${companyName}\n\nNews data:\n${JSON.stringify(newsJson, null, 2)}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: SENTIMENT_SCHEMA,
    } as Record<string, unknown>,
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from Gemini");

  const parsed = JSON.parse(text.trim()) as unknown;
  return SentimentAnalysisSchema.parse(parsed);
}
