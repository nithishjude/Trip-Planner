"use client";

import { useEffect, useState, useRef } from "react";

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

export default function UndoToast({
  message,
  onUndo,
  onDismiss,
  duration = 5000,
}: UndoToastProps) {
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onDismiss();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [duration, onDismiss]);

  return (
    <div className="animate-toast fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="glass-strong rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
        {/* Progress bar */}
        <div
          className="h-0.5 bg-gradient-to-r from-violet-500 to-blue-500 transition-none origin-left"
          style={{ width: `${progress}%` }}
        />
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="text-base">🗑️</span>
            <span className="text-sm text-[var(--text-secondary)]">{message}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="undo-btn"
              onClick={onUndo}
              className="px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 text-xs font-medium hover:bg-violet-500/30 transition-colors"
            >
              Undo
            </button>
            <button
              onClick={onDismiss}
              className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-sm"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
