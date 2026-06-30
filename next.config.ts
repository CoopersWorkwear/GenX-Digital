import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The Dreamscape API key and signing logic must only ever run server-side.
  // Never expose DREAMSCAPE_* secrets to the client via NEXT_PUBLIC_*.
};

export default nextConfig;
