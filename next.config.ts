import type { NextConfig } from "next";

/**
 * Le site est 100 % pré-rendu : on l'exporte en HTML statique pour pouvoir
 * l'héberger sur GitHub Pages (ou n'importe quel hébergeur de fichiers).
 *
 * NEXT_PUBLIC_BASE_PATH est renseigné par le workflow GitHub Actions avec le
 * nom du dépôt (ex. « /ai-npc ») car les Project Pages sont servies dans un
 * sous-dossier. À laisser vide pour un domaine personnalisé ou en local.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  // GitHub Pages sert /a-propos/ plutôt que /a-propos : on génère des dossiers
  // avec index.html pour que les URL fonctionnent sans réécriture serveur.
  trailingSlash: true,
  // Les visuels proviennent de CDN communautaires : on les sert directement
  // via <img> (l'optimiseur Next est indisponible en export statique).
  images: { unoptimized: true },
};

export default nextConfig;
