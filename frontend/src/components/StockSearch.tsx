import { useState, FormEvent } from "react";

interface StockSearchProps {
  onSearch: (stock: string) => void;
  disabled?: boolean;
}

export default function StockSearch({ onSearch, disabled }: StockSearchProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed && !disabled) onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-violet/30 sm:flex-row"
        style={{
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter stock ticker or company name (e.g. AAPL, Microsoft)"
          disabled={disabled}
          className="flex-1 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none transition placeholder:transition focus:placeholder-white/20 disabled:opacity-60 sm:px-6 sm:py-4"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="px-6 py-3 font-medium text-black transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed sm:px-8 sm:py-4"
          style={{
            background: "linear-gradient(135deg, #C6FF33 0%, #a8e020 100%)",
            boxShadow: "0 4px 14px rgba(198, 255, 51, 0.3)",
          }}
        >
          Analyze
        </button>
      </div>
    </form>
  );
}
