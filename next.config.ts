import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack (default in Next.js 16) — no webpack config needed
  // Leaflet SSR is handled via dynamic import with ssr:false in MapPane
  turbopack: {},
};

export default nextConfig;
