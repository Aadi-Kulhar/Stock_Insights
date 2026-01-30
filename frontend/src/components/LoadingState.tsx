export default function LoadingState() {
  return (
    <div
      className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-12 backdrop-blur-xl transition-all duration-300 hover:border-violet/20 sm:mt-8 sm:px-8 sm:py-16"
      style={{
        boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-white/20"
        style={{ borderTopColor: "#7D39EB" }}
        aria-hidden
      />
      <p className="mt-4 text-base text-white/90 sm:text-lg">Fetching company info and analyzing news...</p>
      <p className="mt-2 text-sm text-white/50">This may take 1–2 minutes</p>
    </div>
  );
}
