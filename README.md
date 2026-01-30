# Investment Insights Dashboard

AI-powered investment analytics that analyzes stocks using Google Gemini and MINO web automation to scrape finance news and perform sentiment analysis.

## Flow

1. **User enters stock** (ticker or company name)
2. **Gemini** returns structured JSON: company name, sector, competitors, related keywords
3. **MINO** scrapes 6 finance news sources in parallel (Reuters, Yahoo Finance, CNBC, MarketWatch, Seeking Alpha, BBC Business)
4. **Gemini** performs sentiment analysis on the collected news

## Prerequisites

- Node.js 20+
- [Gemini API Key](https://aistudio.google.com/apikey)
- [MINO API Key](https://mino.ai/api-keys)

## Setup

1. Clone and install dependencies:

```bash
cd Investment_Insights
npm install --prefix backend
npm install --prefix frontend
```

2. Create `.env` in the `backend` directory:

```
GEMINI_API_KEY=your_gemini_api_key
MINO_API_KEY=your_mino_api_key
PORT=3001
```

3. Start the backend:

```bash
cd backend && npm run dev
```

4. In another terminal, start the frontend:

```bash
cd frontend && npm run dev
```

5. Open http://localhost:5173

## Project Structure

```
Investment_Insights/
├── backend/          # Express API
│   ├── src/
│   │   ├── index.ts
│   │   ├── gemini.ts      # Gemini client + structured output
│   │   ├── mino.ts        # MINO parallel news scraping
│   │   ├── orchestrator.ts
│   │   └── prompts.ts
│   └── .env.example
├── frontend/         # React + Vite + Tailwind
│   └── src/
│       ├── components/
│       │   ├── StockSearch.tsx
│       │   ├── LoadingState.tsx
│       │   └── InsightsCard.tsx
│       └── api.ts
└── README.md
```

## Deploy to Vercel

1. Push this repo to GitHub and import it in [Vercel](https://vercel.com).
2. Add environment variables in Project Settings → Environment Variables:
   - `GEMINI_API_KEY`
   - `MINO_API_KEY`
3. Deploy. The build runs `backend` and `frontend` builds; the API is served at `/api/analyze`.

## References

- [MINO API Docs](https://docs.mino.ai)
- [Gemini Structured Outputs](https://ai.google.dev/gemini-api/docs/structured-output)
