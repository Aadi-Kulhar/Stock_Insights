import { useState } from "react";
import StockSearch from "./components/StockSearch";
import LoadingState from "./components/LoadingState";
import InsightsCard from "./components/InsightsCard";
import type { PipelineResult } from "./api";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);

  const handleSearch = async (stock: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      const data: PipelineResult = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #000000 0%, #0a0512 25%, #1a0d2e 50%, #2d1b4e 75%, #1a0d2e 100%)",
      }}
    >
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 text-center sm:mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Investment Insights
          </h1>
          <p className="mt-2 text-base text-white/70 sm:text-lg">
            AI-powered sentiment analysis from finance news
          </p>
        </header>

        <StockSearch onSearch={handleSearch} disabled={loading} />

        {loading && <LoadingState />}

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-red-200 backdrop-blur-md sm:px-6">
            {error}
          </div>
        )}

        {result && <InsightsCard result={result} />}
      </div>

      <footer className="mt-12 py-6 text-center">
        <p className="text-xs text-white/50 sm:text-sm">
          Powered by TinyFish AI 🐟
        </p>
      </footer>
    </div>
  );
}
