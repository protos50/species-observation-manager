import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  devIndicators: false,
  eslint: {
    // Evita que el build falle por errores de ESLint en producción
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Evita que el build falle por errores de TypeScript en producción
    ignoreBuildErrors: true,
  },
};

export default nextConfig;