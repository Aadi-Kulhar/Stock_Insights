import type { PipelineResult, ArticleSentiment } from "../api";

const glassCard =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-4 transition-all duration-300 hover:border-violet/20 hover:bg-white/[0.07] sm:px-6 sm:py-5";
const shadowStyle = {
  boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
};

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const styles: Record<string, string> = {
    bullish: "bg-[#C6FF33]/20 text-[#C6FF33] border-[#C6FF33]/40",
    bearish: "bg-red-500/20 text-red-300 border-red-500/40",
    neutral: "bg-white/10 text-white/80 border-white/20",
    mixed: "bg-[#7D39EB]/20 text-[#B794F6] border-[#7D39EB]/40",
  };
  const s = styles[sentiment] ?? styles.neutral;
  return (
    <span
      className={`rounded-full border px-3 py-1 text-sm font-medium capitalize transition-colors sm:px-4 sm:py-1.5 sm:text-base ${s}`}
    >
      {sentiment}
    </span>
  );
}

function ArticleRow({ a }: { a: ArticleSentiment }) {
  const sentimentColor =
    a.sentiment === "positive"
      ? "text-[#C6FF33]"
      : a.sentiment === "negative"
        ? "text-red-400"
        : "text-white/60";
  return (
    <div className="flex flex-col gap-1 border-b border-white/5 py-3 transition-colors hover:bg-white/[0.03] last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white/90 sm:text-base">{a.title}</p>
        <p className="mt-1 text-xs text-white/50">{a.source}</p>
      </div>
      <span className={`shrink-0 text-sm font-medium ${sentimentColor}`}>
        {a.sentiment}
      </span>
    </div>
  );
}

export default function InsightsCard({ result }: { result: PipelineResult }) {
  const { sectorData, sentiment } = result;

  return (
    <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-6">
      <div className={`${glassCard}`} style={shadowStyle}>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              {sectorData.company_name} ({sectorData.ticker})
            </h2>
            <p className="mt-1 text-sm text-white/60 sm:text-base">
              {sectorData.sector}
              {sectorData.industry ? ` · ${sectorData.industry}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <SentimentBadge sentiment={sentiment.overall_sentiment} />
            <span className="font-mono text-xs text-white/70 sm:text-sm">
              {(sentiment.confidence_score * 100).toFixed(0)}% confidence
            </span>
          </div>
        </div>
      </div>

      <div className={`${glassCard}`} style={shadowStyle}>
        <h3 className="mb-3 text-base font-semibold text-white sm:text-lg">
          Summary
        </h3>
        <p className="text-sm leading-relaxed text-white/80 sm:text-base">
          {sentiment.summary}
        </p>
      </div>

      {sentiment.key_themes && sentiment.key_themes.length > 0 && (
        <div className={`${glassCard}`} style={shadowStyle}>
          <h3 className="mb-3 text-base font-semibold text-white sm:text-lg">
            Key Themes
          </h3>
          <ul className="space-y-1">
            {sentiment.key_themes.map((t, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-white/80 sm:text-base">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: "#7D39EB" }}
                />
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        {sentiment.risk_factors && sentiment.risk_factors.length > 0 && (
          <div className={`${glassCard}`} style={shadowStyle}>
            <h3 className="mb-3 text-base font-semibold text-red-200 sm:text-lg">
              Risk Factors
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              {sentiment.risk_factors.map((r, i) => (
                <li key={i}>• {r}</li>
              ))}
            </ul>
          </div>
        )}
        {sentiment.opportunities && sentiment.opportunities.length > 0 && (
          <div className={`${glassCard}`} style={shadowStyle}>
            <h3 className="mb-3 text-base font-semibold text-[#C6FF33] sm:text-lg">
              Opportunities
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              {sentiment.opportunities.map((o, i) => (
                <li key={i}>• {o}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {sentiment.article_sentiments && sentiment.article_sentiments.length > 0 && (
        <div className={`${glassCard}`} style={shadowStyle}>
          <h3 className="mb-4 text-base font-semibold text-white sm:text-lg">
            Article Sentiment
          </h3>
          <div className="max-h-64 overflow-y-auto sm:max-h-80">
            {sentiment.article_sentiments.map((a, i) => (
              <ArticleRow key={i} a={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
