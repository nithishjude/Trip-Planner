"use client";

interface ErrorStateProps {
  onRetry: () => void;
  onReset: () => void;
  errorType?: string;
}

const ERROR_MESSAGES: Record<string, { title: string; message: string; emoji: string }> = {
  malformed_or_wrong_shape: {
    emoji: "🗺️",
    title: "Couldn't read that plan back",
    message: "The AI returned something in an unexpected shape. This can happen with very unusual prompts. Try again or rephrase.",
  },
  empty_response: {
    emoji: "🌫️",
    title: "Got an empty response",
    message: "The AI didn't return any content. This is usually temporary — try again.",
  },
  upstream_error: {
    emoji: "🔌",
    title: "Connection issue",
    message: "Couldn't reach the AI service. Check your connection and try again.",
  },
  server_misconfigured: {
    emoji: "⚙️",
    title: "Server misconfigured",
    message: "The API key isn't set up. Check your .env.local file.",
  },
  network: {
    emoji: "📡",
    title: "Network error",
    message: "Lost connection while fetching the plan. Your prompt is preserved — just retry.",
  },
  default: {
    emoji: "✦",
    title: "Something went wrong",
    message: "Couldn't generate that itinerary. Your prompt is preserved — try again.",
  },
};

export default function ErrorState({ onRetry, onReset, errorType }: ErrorStateProps) {
  const err = ERROR_MESSAGES[errorType ?? "default"] ?? ERROR_MESSAGES.default;

  return (
    <div className="flex-1 flex items-center justify-center p-6 animate-scale-in">
      <div className="max-w-sm w-full text-center">
        {/* Error icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-3xl mx-auto mb-5">
          {err.emoji}
        </div>

        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          {err.title}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
          {err.message}
        </p>

        {/* Subtle error badge */}
        {errorType && errorType !== "default" && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/4 border border-white/8 text-xs text-[var(--text-muted)] mb-5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
            {errorType}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            id="retry-btn"
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-medium text-sm hover:brightness-110 hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-200 active:scale-95"
          >
            Try again
          </button>
          <button
            id="reset-btn"
            onClick={onReset}
            className="px-5 py-2.5 rounded-xl bg-white/6 border border-white/10 text-[var(--text-secondary)] font-medium text-sm hover:bg-white/10 hover:text-[var(--text-primary)] transition-all duration-200"
          >
            New trip
          </button>
        </div>
      </div>
    </div>
  );
}
