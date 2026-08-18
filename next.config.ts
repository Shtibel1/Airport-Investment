import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    GOOGLE_GENERATIVE_AI_API_KEY:
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      '',
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    OPENSKY_DEPARTURES_API_URL:
      process.env.OPENSKY_DEPARTURES_API_URL ||
      'https://opensky-network.org/api/flights/departure',
  },
};

export default nextConfig;
