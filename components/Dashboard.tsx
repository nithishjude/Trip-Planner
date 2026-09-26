"use client";

import { useState, useRef, useEffect } from "react";

const NAV_ITEMS = [
  { icon: "🏠", label: "Home" },
  { icon: "💬", label: "Chats" },
  { icon: "🧳", label: "Trips" },
  { icon: "🤖", label: "Agents" },
  { icon: "🧭", label: "Explore" },
  { icon: "🔖", label: "Saved" },
  { icon: "🔔", label: "Updates" },
  { icon: "✚", label: "Create" },
];

const SUGGESTIONS = [
  "Plan a 5-day Tokyo food tour",
  "Weekend in Paris on a budget",
  "Beach week in Bali with friends",
  "New York City highlights in 3 days",
];

const FILTER_PROMPTS: Record<string, string> = {
  Where: "I want to visit ",
  When:  "I'm planning to travel in ",
  Who:   "I'm traveling with ",
  Budget: "My budget for this trip is ",
};

interface DashboardProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
  initialPrompt?: string;
  onGoToLanding?: () => void;
}

export default function Dashboard({ onSubmit, isLoading, initialPrompt, onGoToLanding }: DashboardProps) {
  const [prompt, setPrompt] = useState(initialPrompt ?? "");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");
  const [recentTrips, setRecentTrips] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load recent trips history
  useEffect(() => {
    try {
      const history = localStorage.getItem("tripeasy_history");
      if (history) setRecentTrips(JSON.parse(history).slice(0, 5));
    } catch {}
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [prompt]);

  // Auto-focus + move cursor to end on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = prompt.trim();
    if (!text || isLoading) return;
    try {
      const newHistory = [text, ...recentTrips.filter(t => t !== text)].slice(0, 10);
      localStorage.setItem("tripeasy_history", JSON.stringify(newHistory));
    } catch {}
    onSubmit(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Filter pill click: pre-fill the prompt with a starter phrase
  const handleFilterPill = (label: string) => {
    const starter = FILTER_PROMPTS[label] ?? "";
    setPrompt(starter);
    textareaRef.current?.focus();
    setTimeout(() => {
      if (textareaRef.current) {
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }, 0);
  };

  // Create a trip: submit immediately or focus input
  const handleCreateTrip = () => {
    if (prompt.trim()) {
      handleSubmit();
    } else {
      textareaRef.current?.focus();
    }
  };

  // Mic / Voice input via Web Speech API
  const handleMic = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Try Chrome.");
      return;
    }

    if (isListening) {
      // @ts-ignore
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt((prev) => prev ? `${prev} ${transcript}` : transcript);
      textareaRef.current?.focus();
    };

    // @ts-ignore
    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="db-root">
      {/* ── Left Sidebar ── */}
      <aside className={`db-sidebar ${sidebarCollapsed ? "db-sidebar--collapsed" : ""}`}>
        {/* Logo — click goes to landing page */}
        <div className="db-logo">
          <button
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={() => onGoToLanding?.()}
            title="Back to home"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div className="db-logo-mark">T</div>
            {!sidebarCollapsed && <span className="db-logo-text">TripEasy</span>}
          </button>
          <button
            className="db-collapse-btn"
            onClick={() => setSidebarCollapsed((v) => !v)}
            title={sidebarCollapsed ? "Expand" : "Collapse"}
            style={{ flexShrink: 0 }}
          >
            {sidebarCollapsed ? "›" : "‹"}
          </button>
        </div>

        {/* New Chat — clearly visible */}
        <button
          onClick={() => {
            setPrompt("");
            setActiveNav("Home");
            textareaRef.current?.focus();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarCollapsed ? "center" : "flex-start",
            gap: "8px",
            width: "100%",
            padding: "10px 14px",
            marginBottom: "8px",
            background: "rgba(124,92,246,0.3)",
            border: "1px solid rgba(124,92,246,0.5)",
            borderRadius: "10px",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          <span style={{ fontSize: "16px", flexShrink: 0 }}>✚</span>
          {!sidebarCollapsed && <span>New chat</span>}
        </button>

        {/* Nav */}
        <nav className="db-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={`db-nav-item ${activeNav === item.label ? "db-nav-item--active" : ""}`}
              onClick={() => {
                setActiveNav(item.label);
                // Pre-fill prompt based on nav item
                if (item.label === "Create") handleCreateTrip();
                else if (item.label !== "Home") {
                  setPrompt(`Show me ${item.label.toLowerCase()} options for my next trip`);
                  textareaRef.current?.focus();
                } else {
                  setPrompt("");
                  textareaRef.current?.focus();
                }
              }}
            >
              <span className="db-nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="db-nav-label">{item.label}</span>}
            </button>
          ))}

          {/* Recent Trips */}
          {!sidebarCollapsed && recentTrips.length > 0 && (
            <div className="mt-6 mb-2">
              <div className="text-xs font-semibold text-gray-500 px-3 mb-2 uppercase tracking-wider">
                Recent Trips
              </div>
              {recentTrips.map((trip, i) => (
                <button
                  key={i}
                  className="db-nav-item w-full"
                  style={{ opacity: 0.75 }}
                  onClick={() => {
                    setPrompt(trip);
                    textareaRef.current?.focus();
                  }}
                >
                  <span className="db-nav-icon" style={{ fontSize: 12 }}>🕒</span>
                  <span className="db-nav-label truncate">{trip}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="db-sidebar-footer">
          <div className="db-user-row">
            <div className="db-avatar">T</div>
            {!sidebarCollapsed && <span className="db-username">Traveler</span>}
          </div>
          {!sidebarCollapsed && (
            <p className="db-footer-links">Company · Contact · Help</p>
          )}
        </div>
      </aside>

      {/* ── Center Panel (no map) ── */}
      <div className="db-center">
        {/* Top bar */}
        <header className="db-topbar">
          <div className="db-topbar-title">
            {activeNav === "Home" ? "New chat" : activeNav}
            <span className="db-topbar-arrow">›</span>
          </div>
          <div className="db-topbar-filters">
            {["Where", "When", "Who", "Budget"].map((f) => (
              <button
                key={f}
                className="db-filter-pill"
                onClick={() => handleFilterPill(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="db-create-trip-btn" onClick={handleCreateTrip}>
            <span>✦</span> Create a trip
          </button>
        </header>

        {/* Chat body — welcome + input together, centered */}
        <div className="db-chat-body">
          <div className="db-welcome">
            <div className="db-welcome-globe">🌍</div>
            <h2 className="db-welcome-heading">Where to today?</h2>
            <p className="db-welcome-sub">
              Hey there, I&apos;m here to assist you in planning your experience.<br />
              Ask me anything travel related.
            </p>

            {/* Suggestion chips */}
            <div className="db-suggestions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="db-suggestion-chip"
                  onClick={() => {
                    setPrompt(s);
                    textareaRef.current?.focus();
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input bar — lives inside the welcome card */}
            <form onSubmit={handleSubmit} className="db-input-bar db-input-bar--inline">
              <textarea
                ref={textareaRef}
                id="db-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask TripEasy… e.g. 5 days in Tokyo"
                className="db-input-textarea"
                rows={1}
                disabled={isLoading}
              />
              <div className="db-input-right">
                <button
                  type="button"
                  className={`db-input-icon-btn ${isListening ? "db-mic-active" : ""}`}
                  title={isListening ? "Stop listening" : "Voice input"}
                  onClick={handleMic}
                >
                  {isListening ? "⏹" : "🎤"}
                </button>
                <button
                  type="submit"
                  disabled={!prompt.trim() || isLoading}
                  className="db-send-btn"
                  title="Send"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                  ) : (
                    "⏎"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
