"use client";

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/6 bg-[var(--bg-surface)] p-4 animate-shimmer">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/6 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/6 rounded-md w-3/4" />
          <div className="h-3 bg-white/4 rounded-md w-1/2" />
          <div className="h-3 bg-white/4 rounded-md w-full" />
          <div className="h-3 bg-white/4 rounded-md w-5/6" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTab() {
  return (
    <div className="h-9 w-24 rounded-xl bg-white/5 animate-shimmer shrink-0" />
  );
}

export function SkeletonMap() {
  return (
    <div className="w-full h-full rounded-xl bg-white/3 animate-shimmer flex items-center justify-center">
      <div className="text-[var(--text-muted)] text-sm flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/30 animate-spin" />
        <span>Loading map…</span>
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ slowLoading }: { slowLoading?: boolean }) {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header bar skeleton */}
      <div className="px-4 py-4 border-b border-white/6 flex items-center justify-between">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonTab key={i} />
          ))}
        </div>
        <div className="h-8 w-32 rounded-lg bg-white/5 animate-shimmer" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Stop list skeleton */}
        <div className="w-full lg:w-[420px] shrink-0 p-4 space-y-3 overflow-y-auto">
          {slowLoading && (
            <div className="flex items-center gap-2 text-amber-400 text-sm mb-4 px-1">
              <span className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin inline-block shrink-0" />
              Still working on it…
            </div>
          )}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
              className="animate-fade-in-up"
            >
              <SkeletonCard />
            </div>
          ))}
        </div>

        {/* Map skeleton */}
        <div className="hidden lg:block flex-1 p-4">
          <SkeletonMap />
        </div>
      </div>
    </div>
  );
}
