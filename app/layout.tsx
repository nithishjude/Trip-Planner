import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TripEasy — AI Trip Planner",
  description:
    "Turn a free-text trip description into a structured, editable itinerary. Drag to reorder, refine with a prompt, and never trust a wall of AI text again.",
  keywords: ["AI trip planner", "itinerary generator", "travel planning", "AI travel"],
  openGraph: {
    title: "TripEasy — AI Trip Planner",
    description: "Your itinerary isn't a wall of text. It's a living plan you can bend, break, and rebuild — in real time.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
