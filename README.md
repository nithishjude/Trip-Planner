# TripEasy 🌍

TripEasy is a modern, AI-powered travel planner that generates highly customized, actionable travel itineraries in seconds. Designed with a premium, map-first interface, it allows users to chat with an AI assistant to plan, visualize, and refine their travel experiences intuitively.

---

## 🚀 Features

- **AI-Powered Itinerary Generation:** Simply type your destination, preferences, and constraints, and TripEasy builds a full day-by-day plan.
- **Interactive Map Integration:** View your entire trip on a dynamic Leaflet map. Route lines animate to show the flow of your travel day.
- **Auto-Expanding Side Sheets:** Click a map pin to instantly auto-scroll and expand the corresponding location card to see photos and detailed descriptions.
- **Conversational Refinement:** Want changes? Just type "Make day 2 cheaper" or "Add a museum on day 1". The AI instantly updates the itinerary while maintaining the stops you already like.
- **Rich Media Cards:** Location cards feature dynamic destination photos to help you visualize your trip.
- **Seamless UI/UX:** A beautiful, responsive interface featuring a white-themed marketing landing page, a dark-themed chat dashboard, and a split-pane itinerary board.
- **Voice Input:** Use the Web Speech API to talk to the travel planner instead of typing.
- **Export & Share:** Export your final itinerary as a clean, formatted PDF for offline access.

---

## 🏗️ Architecture

TripEasy is built with modern web technologies, prioritizing speed, edge-compatibility, and seamless UX:

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling:** Vanilla CSS (`globals.css`) + Tailwind CSS (hybrid approach for maximum design flexibility).
- **Language:** TypeScript
- **State Management:** React Hooks (`useState`, `useRef`, `useCallback`)
- **Maps:** `react-leaflet` / Leaflet
- **Icons & Visuals:** Inline SVGs, CSS Gradients, and Glassmorphism effects.

### Data Flow

1. **Input:** The user submits a prompt via the Landing Page or Dashboard (e.g., "3 days in Paris").
2. **Generation:** The prompt is sent to the `/api/generate` Next.js Route Handler.
3. **AI Processing:** The API calls an LLM (e.g., Gemini) to generate a structured JSON itinerary.
4. **Rendering:** The client receives the JSON, parses it, and updates the `AppStatus` to `ready`, rendering the `ItineraryBoard` and `MapPane`.
5. **Refinement:** The user submits a refinement query. The `/api/refine` route merges the new instructions with the existing JSON state and returns the updated itinerary.

---

## 🧭 Workflow and Key Components

The app follows a state-machine driven workflow defined by `AppStatus` (`"landing" | "empty" | "loading" | "ready" | "refining" | "error"`):

1. **`PromptInput.tsx` (Status: `landing`)**
   - The initial marketing page.
   - Features parallax scrolling, feature highlights, and inspiration cards.
   - Submitting a prompt transitions the app to the Dashboard.

2. **`Dashboard.tsx` (Status: `empty`)**
   - A dark-themed, chat-like interface.
   - Contains navigation, recent trip history, filter pills, and a pinned input box (with Voice Input support).
   - Submitting the final prompt here triggers the generation API.

3. **`page.tsx` (Status: `loading`)**
   - Orchestrates the transitions.
   - Shows a beautiful `LoadingSkeleton` while waiting for the AI response.

4. **`ItineraryBoard.tsx` (Status: `ready` / `refining`)**
   - The main workspace split into two panes:
     - **Left Pane:** The list of days and draggable `StopCard` components.
     - **Right Pane:** The `MapPaneInner` rendering Leaflet maps and animated route lines.
   - Includes a sticky header for exporting to PDF and quick booking links.
   - Includes the `RefinementBar` to continue chatting with the AI to adjust the plan.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Create a `.env.local` file in the root directory and add your AI provider API keys (e.g., Gemini / OpenAI):
   ```env
   # Add necessary API keys here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎨 Design Philosophy

TripEasy is built to **"Wow"**. It avoids generic UI patterns in favor of:
- **Vibrant Colors & Gradients:** Used strategically to draw attention (e.g., loading states, active map pins).
- **Micro-animations:** Elements scale, fade, and pulse to provide immediate feedback.
- **Glassmorphism:** Frosted glass effects ensure text is readable while maintaining context of the map or background behind it.

## 📝 License
MIT License
