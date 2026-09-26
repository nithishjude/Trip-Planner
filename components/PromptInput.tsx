"use client";

import { useState, useRef, useEffect } from "react";

const DESTINATION_CARDS = [
  { title: "Paris: A Locals Guide", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80" },
  { title: "Authenticity and Culture in Rome", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80" },
  { title: "Foodie's Delight: San Francisco", image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80" },
  { title: "Urban Adventure in Tokyo", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80" },
  { title: "A Harbourside Adventure in Sydney", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80" },
  { title: "A NYC Classic", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80" },
];

const FEATURES = [
  { title: "Photos, maps + reviews", desc: "Don’t just read about a place; experience it. With vibrant photos, interactive maps and reviews, you’ll feel like you’re already there.", icon: "📸" },
  { title: "Tailored recommendations", desc: "From the best restaurants in your town to the best beaches around the world, we’ve got you covered. Favorite the recommendations you like.", icon: "🎯" },
  { title: "Customizable trip plans", desc: "In seconds, we’ll create customizable itineraries for anywhere you’d like to go. Include specifics for your requests.", icon: "🗓️" },
  { title: "Collaboration tools", desc: "Plan together in real time — add ideas, comments and likes. Chat as a group within your trip.", icon: "🤝" },
];

const PLACEHOLDERS = [
  "Where do you want to go?",
  "e.g. A 4-day foodie trip to Tokyo...",
  "e.g. Weekend getaway in Amsterdam...",
  "e.g. Relaxing beach week in Bali..."
];

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
  initialPrompt?: string;
  onGoToApp?: () => void;
}

export default function PromptInput({ onSubmit, isLoading, initialPrompt, onGoToApp }: PromptInputProps) {
  const [prompt, setPrompt] = useState(initialPrompt ?? "");
  const [focused, setFocused] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  // Parallax scroll listener
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Rotating placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      if (!focused && !prompt) {
        setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [focused, prompt]);

  // Scroll reveal observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          observerRef.current?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    const elements = document.querySelectorAll(".reveal-base");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    // Always navigate to dashboard — even if no text yet
    onSubmit(prompt.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="travel-scroll-root">
      {/* Hero Section with Parallax */}
      <section className="travel-hero-section">
        <div 
          className="travel-hero-bg" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')",
            transform: `translateY(${scrollY * 0.4}px) scale(1.02)` // Parallax effect
          }}
        />
        <div className="travel-hero-overlay" />
        
        {/* Floating Destination Images */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
          {/* Top Left - Eiffel Tower */}
          <div className="absolute top-[15%] left-[5%] xl:left-[10%] w-32 h-40 sm:w-40 sm:h-52 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/20 animate-float-1 transform -rotate-6">
            <img src="https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&q=80" alt="Paris" className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-3 text-white text-xs font-bold drop-shadow-md">Paris, France</div>
          </div>
          
          {/* Top Right - Statue of Liberty */}
          <div className="absolute top-[20%] right-[5%] xl:right-[10%] w-28 h-36 sm:w-36 sm:h-48 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/20 animate-float-2 transform rotate-6">
            <img src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80" alt="New York" className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-3 text-white text-xs font-bold drop-shadow-md">NYC, USA</div>
          </div>

          {/* Bottom Left - Mount Fuji */}
          <div className="absolute bottom-[5%] left-[2%] xl:left-[5%] w-36 h-28 sm:w-48 sm:h-36 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/20 animate-float-3 transform -rotate-3 hidden md:block">
            <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80" alt="Kyoto" className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-3 text-white text-xs font-bold drop-shadow-md">Kyoto, Japan</div>
          </div>

          {/* Bottom Right - Colosseum */}
          <div className="absolute bottom-[5%] right-[2%] xl:right-[5%] w-32 h-32 sm:w-44 sm:h-44 rounded-full overflow-hidden shadow-2xl shadow-black/50 border-4 border-white/20 animate-float-4 transform rotate-3 hidden md:block">
            <img src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80" alt="Rome" className="w-full h-full object-cover" />
            <div className="absolute bottom-3 text-center w-full text-white text-xs font-bold drop-shadow-md">Rome, Italy</div>
          </div>
        </div>

        {/* Navbar */}
        <nav className="travel-nav animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <div className="travel-nav-inner flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-bold text-lg leading-none shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                T
              </div>
              <span className="text-xl font-bold tracking-tight text-white">TripEasy</span>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="travel-hero-content animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <h1 className="travel-h1">Travel differently.</h1>
          <p className="travel-subtitle">
            TripEasy brings the world to you and empowers you to experience it your way.
          </p>

          <div className={`travel-search-container mx-auto transition-transform duration-500 ${focused ? "scale-[1.02]" : "scale-100"}`}>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-4 text-white/50 text-xl animate-pulse">✦</div>
                <textarea
                  id="trip-prompt"
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, 1000))}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder={PLACEHOLDERS[placeholderIdx]}
                  className="travel-search-input transition-all duration-300"
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              <button type="submit" disabled={!!isLoading} className="travel-search-btn relative overflow-hidden group">
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isLoading ? "Planning..." : "Start chatting"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Page Content */}
      <div className="travel-page-content">
        
        {/* How it Works Section */}
        <section className="py-24 px-6 overflow-hidden bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold mb-16 text-center text-gray-900 reveal-base">How it Works</h2>
            
            <div className="flex flex-col gap-24">
              {/* Row 1: Chatting (Text Left, Image Right) */}
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6 reveal-base group">
                  <div className="h-1 w-12 bg-violet-600 rounded-full transform origin-left transition-transform duration-300 group-hover:scale-x-150" />
                  <h3 className="text-3xl font-bold text-gray-900">Start chatting with us.</h3>
                  <p className="text-gray-600 text-xl leading-relaxed">
                    Ask for suggestions for any destination or an entire itinerary. Tell us how you like to travel, what you look for in a new place, and any preferences or pet peeves you have. The more you share, the more personalized your recommendations and plans become.
                  </p>
                </div>
                <div className="flex-1 reveal-base reveal-delay-200">
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 relative group">
                    <img src="https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=800&q=80" alt="Start chatting" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-violet-900/5 mix-blend-overlay" />
                  </div>
                </div>
              </div>

              {/* Row 2: Browse (Image Left, Text Right) */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                <div className="flex-1 space-y-6 reveal-base group">
                  <div className="h-1 w-12 bg-violet-600 rounded-full transform origin-left transition-transform duration-300 group-hover:scale-x-150" />
                  <h3 className="text-3xl font-bold text-gray-900">Browse popular itineraries.</h3>
                  <p className="text-gray-600 text-xl leading-relaxed">
                    Visit our Inspiration page to get ideas and inspiration from other TripEasy users. Add their suggestions to a new trip plan and customize it to make it your own.
                  </p>
                </div>
                <div className="flex-1 reveal-base reveal-delay-200">
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 relative group">
                    <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80" alt="Browse inspiration" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-violet-900/5 mix-blend-overlay" />
                  </div>
                </div>
              </div>

              {/* Row 3: Recommendations (Text Left, Image Right) */}
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6 reveal-base group">
                  <div className="h-1 w-12 bg-violet-600 rounded-full transform origin-left transition-transform duration-300 group-hover:scale-x-150" />
                  <h3 className="text-3xl font-bold text-gray-900">Get personalized recommendations.</h3>
                  <p className="text-gray-600 text-xl leading-relaxed">
                    We’ll provide personalized, actionable travel experiences based on your preferences. Check out photos, reviews, maps and more. Favorite the items you like and add them to your trip plan.
                  </p>
                </div>
                <div className="flex-1 reveal-base reveal-delay-200">
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 relative group">
                    <img src="https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80" alt="Personalized recommendations" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-violet-900/5 mix-blend-overlay" />
                  </div>
                </div>
              </div>

              {/* Row 4: Crew (Image Left, Text Right) */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                <div className="flex-1 space-y-6 reveal-base group">
                  <div className="h-1 w-12 bg-violet-600 rounded-full transform origin-left transition-transform duration-300 group-hover:scale-x-150" />
                  <h3 className="text-3xl font-bold text-gray-900">Plan with your crew.</h3>
                  <p className="text-gray-600 text-xl leading-relaxed">
                    Invite friends and family to your trip, start a group chat and build an itinerary that works for everyone — no endless group texts required.
                  </p>
                </div>
                <div className="flex-1 reveal-base reveal-delay-200">
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 relative group">
                    <img src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&q=80" alt="Friends traveling" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-violet-900/5 mix-blend-overlay" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New at TripEasy Section */}
        <section className="py-24 px-6 bg-gray-50 border-y border-gray-200">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold mb-16 text-center text-gray-900 reveal-base">
              🎉 New at TripEasy
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm reveal-base reveal-delay-100 flex flex-col h-full">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Events</h3>
                <p className="text-gray-600 mb-6 flex-grow text-sm">
                  From concerts and comedy to farmers’ markets and family fun, we’ll show you what’s happening nearby that fits your vibe. Get the scoop, make a plan, even snag tickets.
                </p>
                <button className="text-violet-600 font-semibold text-sm hover:text-violet-700 text-left transition-colors flex items-center gap-1">
                  Try it Now <span>→</span>
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm reveal-base reveal-delay-200 flex flex-col h-full">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Google Pins</h3>
                <p className="text-gray-600 mb-6 flex-grow text-sm">
                  Import your saved places from Google Maps into TripEasy and — boom — they become a themed collection you can use to plan.
                </p>
                <button className="text-violet-600 font-semibold text-sm hover:text-violet-700 text-left transition-colors flex items-center gap-1">
                  Try it Now <span>→</span>
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm reveal-base reveal-delay-300 flex flex-col h-full">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Collections</h3>
                <p className="text-gray-600 mb-6 flex-grow text-sm">
                  See a place you love? Save it to a collection — your favorites sorted by destination, theme or vibe. Invite friends to collaborate and watch that “someday” trip take shape.
                </p>
                <button className="text-violet-600 font-semibold text-sm hover:text-violet-700 text-left transition-colors flex items-center gap-1">
                  Try it Now <span>→</span>
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm reveal-base reveal-delay-100 flex flex-col h-full">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">Start Anywhere®</h3>
                <p className="text-gray-600 mb-6 flex-grow text-sm">
                  Feeling inspired? TripEasy it. Share your favorite travel content, and we’ll whip up a custom list or itinerary in seconds. You can even start with a photo, screenshot or PDF!
                </p>
                <button className="text-violet-600 font-semibold text-sm hover:text-violet-700 text-left transition-colors flex items-center gap-1">
                  Try it Now <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold mb-16 text-center text-gray-900 reveal-base">
              Everything you need for your next adventure
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {FEATURES.map((feature, i) => (
                <div key={i} className={`bg-gray-50 p-8 rounded-3xl border border-gray-100 transition-all duration-300 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-2 reveal-base reveal-delay-${(i % 4) * 100 + 100}`}>
                  <div className="text-4xl mb-6 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inspiration Grid */}
        <section className="py-24 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 reveal-base">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">Get inspired.</h2>
              <p className="text-xl text-gray-600">Explore popular destinations and start planning your TripEasy trip.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {DESTINATION_CARDS.map((card, i) => (
                <div 
                  key={i} 
                  className={`group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-md reveal-base reveal-delay-${(i % 3) * 100 + 100}`}
                  onClick={() => {
                    setPrompt(card.title);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    textareaRef.current?.focus();
                  }}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                    style={{ backgroundImage: `url('${card.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-bold text-white leading-tight mb-2">{card.title}</h3>
                    <span className="text-sm font-medium text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 flex items-center gap-2">
                      Plan this trip <span>→</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 text-center text-gray-500 border-t border-gray-200 bg-white reveal-base">
          <p>© {new Date().getFullYear()} TripEasy AI Trip Planner. Travel differently.</p>
        </footer>

      </div>
    </div>
  );
}
