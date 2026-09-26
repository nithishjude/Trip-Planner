"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Itinerary, AppStatus } from "@/types/itinerary";
import { assignStopIds } from "@/lib/utils";
import PromptInput from "@/components/PromptInput";
import Dashboard from "@/components/Dashboard";
import ItineraryBoard from "@/components/ItineraryBoard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ErrorState from "@/components/ErrorState";

const SLOW_THRESHOLD_MS = 6000;
const SESSION_KEY = "wayfarer_session";

interface SessionData {
  itinerary: Itinerary;
  prompt: string;
}

function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

function saveSession(data: SessionData) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export default function Home() {
  const [status, setStatus] = useState<AppStatus>("landing");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [errorType, setErrorType] = useState<string | undefined>();
  const [lastPrompt, setLastPrompt] = useState<string>("");
  const [slowLoading, setSlowLoading] = useState(false);
  const [refinementToast, setRefinementToast] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (refinementToast) {
      const t = setTimeout(() => setRefinementToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [refinementToast]);

  // Restore session on mount
  useEffect(() => {
    const session = loadSession();
    if (session?.itinerary && session?.prompt) {
      setItinerary(session.itinerary);
      setLastPrompt(session.prompt);
      setStatus("ready");
    }
  }, []);

  // Save session whenever itinerary changes
  useEffect(() => {
    if (itinerary && lastPrompt) {
      saveSession({ itinerary, prompt: lastPrompt });
    }
  }, [itinerary, lastPrompt]);

  const clearSlowTimer = () => {
    if (slowTimerRef.current) {
      clearTimeout(slowTimerRef.current);
      slowTimerRef.current = null;
    }
    setSlowLoading(false);
  };

  const generate = useCallback(async (prompt: string) => {
    const id = ++requestIdRef.current;
    setLastPrompt(prompt);
    setStatus("loading");
    setErrorType(undefined);
    setSlowLoading(false);
    setRefinementToast(null);

    // Escalate to slow-loading message after threshold
    slowTimerRef.current = setTimeout(() => {
      if (id === requestIdRef.current) {
        setSlowLoading(true);
      }
    }, SLOW_THRESHOLD_MS);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      // Stale-request guard: a newer request already started
      if (id !== requestIdRef.current) return;

      clearSlowTimer();

      if (!res.ok) {
        let errType = "default";
        try {
          const errData = await res.json();
          errType = errData.error ?? "default";
        } catch {
          errType = res.status >= 500 ? "upstream_error" : "default";
        }
        setErrorType(errType);
        setStatus("error");
        return;
      }

      const rawData = await res.json();
      const withIds = assignStopIds(rawData);
      setItinerary(withIds);
      setStatus("ready");
    } catch {
      if (id !== requestIdRef.current) return;
      clearSlowTimer();
      setErrorType("network");
      setStatus("error");
    }
  }, []);

  const refine = useCallback(
    async (instruction: string) => {
      if (!itinerary) return;

      const id = ++requestIdRef.current;
      const previousItinerary = itinerary;
      setStatus("refining");
      setErrorType(undefined);
      setRefinementToast(null);

      // Strip client-side fields before sending to API
      const apiItinerary = {
        destination: itinerary.destination,
        days: itinerary.days.map((d) => ({
          day: d.day,
          label: d.label,
          stops: d.stops.map(({ id: _id, status: _status, lat: _lat, lng: _lng, ...rest }) => rest),
        })),
      };

      try {
        const res = await fetch("/api/refine", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ instruction, itinerary: apiItinerary }),
        });

        if (id !== requestIdRef.current) return;

        if (!res.ok) {
          let errType = "default";
          try {
            const errData = await res.json();
            errType = errData.error ?? "default";
          } catch {
            errType = "default";
          }
          // On refinement failure, restore previous itinerary silently
          setItinerary(previousItinerary);
          setStatus("ready");
          setRefinementToast("❌ Could not apply changes. Please try again.");
          // Show brief error in console but don't full-page error
          console.warn("Refinement failed:", errType);
          return;
        }

        const rawData = await res.json();
        // Preserve "kept" statuses across refinement if stop names match
        const keptNames = new Set(
          previousItinerary.days
            .flatMap((d) => d.stops)
            .filter((s) => s.status === "kept")
            .map((s) => s.name)
        );

        const withIds = assignStopIds(rawData);
        const merged: Itinerary = {
          ...withIds,
          days: withIds.days.map((d) => ({
            ...d,
            stops: d.stops.map((s) => ({
              ...s,
              status: keptNames.has(s.name) ? ("kept" as const) : s.status,
            })),
          })),
        };

        setItinerary(merged);
        setStatus("ready");
        setRefinementToast("✨ AI successfully updated your trip based on your request.");
      } catch {
        if (id !== requestIdRef.current) return;
        setItinerary(previousItinerary);
        setStatus("ready");
        setRefinementToast("❌ Could not connect to AI. Please try again.");
      }
    },
    [itinerary]
  );

  const handleReset = () => {
    ++requestIdRef.current; // invalidate any in-flight requests
    clearSlowTimer();
    clearSession();
    setItinerary(null);
    setStatus("empty"); // Go back to Dashboard, not the marketing landing page
    setErrorType(undefined);
    setLastPrompt("");
  };

  const handleRetry = () => {
    if (lastPrompt) {
      generate(lastPrompt);
    }
  };

  const handleItineraryUpdate = (updated: Itinerary) => {
    setItinerary(updated);
  };

  const handleLandingSubmit = (prompt: string) => {
    setLastPrompt(prompt);
    setStatus("empty");
  };

  // Render states
  if (status === "landing") {
    return (
      <main>
        <PromptInput
          onSubmit={handleLandingSubmit}
          isLoading={false}
          initialPrompt={lastPrompt}
        />
      </main>
    );
  }

  if (status === "empty") {
    return (
      <main className="h-dvh">
        <Dashboard
          onSubmit={generate}
          isLoading={false}
          initialPrompt={lastPrompt}
          onGoToLanding={() => {
            setLastPrompt("");
            setStatus("landing");
          }}
        />
      </main>
    );
  }

  if (status === "loading") {
    return (
      <main className="h-dvh flex flex-col">
        {/* Minimal header during loading */}
        <div className="px-4 py-3 border-b border-white/6 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-xs shadow-[0_0_15px_rgba(124,92,246,0.3)]">
            T
          </div>
          <span className="text-sm font-semibold text-gradient-violet">TripEasy</span>
          <span className="text-xs text-[var(--text-muted)] ml-2">
            Planning your trip…
          </span>
        </div>
        <LoadingSkeleton slowLoading={slowLoading} />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="h-dvh flex flex-col">
        <div className="px-4 py-3 border-b border-white/6 flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-xs shadow-[0_0_15px_rgba(124,92,246,0.3)]">
              T
            </div>
            <span className="text-sm font-semibold text-gradient-violet">TripEasy</span>
          </button>
        </div>
        <ErrorState
          onRetry={handleRetry}
          onReset={handleReset}
          errorType={errorType}
        />
      </main>
    );
  }

  if ((status === "ready" || status === "refining") && itinerary) {
    return (
      <main className="h-dvh flex flex-col relative">
        {refinementToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full shadow-lg backdrop-blur-md text-sm font-medium flex items-center gap-2">
              {refinementToast}
            </div>
          </div>
        )}
        
        {status === "refining" && (
          <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm flex items-center justify-center pointer-events-none animate-fade-in">
            <div className="glass-strong rounded-2xl px-6 py-4 flex items-center gap-3 shadow-2xl">
              <span className="w-5 h-5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin inline-block" />
              <span className="text-sm text-[var(--text-primary)]">Refining your plan…</span>
            </div>
          </div>
        )}
        <ItineraryBoard
          itinerary={itinerary}
          onUpdate={handleItineraryUpdate}
          onRefine={refine}
          onNewTrip={handleReset}
          isRefining={status === "refining"}
        />
      </main>
    );
  }

  return null;
}


