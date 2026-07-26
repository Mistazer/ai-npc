import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les visuels proviennent de CDN communautaires : on les sert directement
  // via <img> plutôt que par l'optimiseur Next (évite un proxy sur 1000+ images).
  images: { unoptimized: true },
};

export default nextConfig;
