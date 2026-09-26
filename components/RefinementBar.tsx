"use client";

import { useState, useRef } from "react";
import { Itinerary } from "@/types/itinerary";

interface RefinementBarProps {
  itinerary: Itinerary;
  onRefine: (instruction: string) => void;
  isRefining: boolean;
}

const REFINEMENT_EXAMPLES = [
  "Swap day 2's museum for something outdoors",
  "Add a food market stop on day 1",
  "Make day 3 more relaxed — fewer stops",
  "Replace transit stops with local alternatives",
];

export default function RefinementBar({ itinerary, onRefine, isRefining }: RefinementBarProps) {
  const [instruction, setInstruction] = useState("");
  const [showExamples, setShowExamples] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isRefining) return;
    onRefine(instruction.trim());
    setInstruction("");
    setShowExamples(false);
  };

  return (
    <div className="refine-bar relative z-[100]">
      {/* Examples dropdown */}
      {showExamples && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#161920] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black animate-scale-in">
          <div style={{ padding: "6px 0" }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", padding: "4px 14px 8px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
              Try a refinement
            </p>
            {REFINEMENT_EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => {
                  setInstruction(ex);
                  setShowExamples(false);
                  inputRef.current?.focus();
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 16px",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  background: "transparent",
                  border: "none",
                  borderBottom: i < REFINEMENT_EXAMPLES.length - 1 ? "1px solid var(--border)" : "none",
                  cursor: "pointer",
                  transition: "background 0.12s, color 0.12s",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                  (e.target as HTMLElement).style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = "transparent";
                  (e.target as HTMLElement).style.color = "var(--text-secondary)";
                }}
              >
                <span style={{ color: "var(--accent)", fontSize: 12 }}>✦</span>
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="refine-inner">
        {/* Destination chip */}
        <div className="hidden sm:flex items-center gap-2 shrink-0" style={{
          padding: "6px 12px",
          borderRadius: 10,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid var(--border)",
          fontSize: 12,
          color: "var(--text-muted)",
          maxWidth: 160,
        }}>
          <span>📍</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {itinerary.destination}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="refine-inner" style={{ padding: 0, flex: 1, margin: 0 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              id="refinement-input"
              ref={inputRef}
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onFocus={() => !instruction && setShowExamples(true)}
              onBlur={() => setTimeout(() => setShowExamples(false), 150)}
              placeholder="Refine the plan… e.g. add more food stops on day 2"
              className="refine-input"
              style={{ width: "100%", paddingRight: instruction ? 36 : 16 }}
              disabled={isRefining}
            />
            {instruction && (
              <button
                type="button"
                onClick={() => setInstruction("")}
                style={{
                  position: "absolute",
                  right: 10, top: "50%", transform: "translateY(-50%)",
                  color: "var(--text-muted)", fontSize: 14, cursor: "pointer",
                  background: "none", border: "none",
                  transition: "color 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                ✕
              </button>
            )}
          </div>

          <button
            id="refine-btn"
            type="submit"
            disabled={!instruction.trim() || isRefining}
            className="refine-btn"
          >
            {isRefining ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="spinner" style={{ width: 14, height: 14 }} />
                <span className="hidden sm:inline">Refining…</span>
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="hidden sm:inline">Refine</span>
                <span>→</span>
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
