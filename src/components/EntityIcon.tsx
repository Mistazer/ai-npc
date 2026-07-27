"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import clsx from "clsx";

interface Props {
  /** URL principale, ou liste d'URL candidates essayées dans l'ordre. */
  src: string | string[] | null;
  alt: string;
  rarity?: number;
  size?: number;
  className?: string;
  rounded?: "full" | "lg" | "md";
}

/**
 * Vignette d'entité, avec repli automatique sur les URL suivantes.
 *
 * Les visuels proviennent de CDN communautaires qui ferment régulièrement
 * (Hakushin/nanoka.cc a disparu début 2026) : on essaie donc plusieurs sources
 * successives avant d'afficher un remplacement textuel.
 */
export function EntityIcon({ src, alt, rarity, size = 64, className, rounded = "lg" }: Props) {
  const candidates = (Array.isArray(src) ? src : [src]).filter(Boolean) as string[];
  const first = candidates[0] ?? "";

  // State dérivé : on réinitialise l'index quand la source change, sans effet.
  const [state, setState] = useState({ key: first, index: 0 });
  const index = state.key === first ? state.index : 0;
  if (state.key !== first) setState({ key: first, index: 0 });

  const radius = rounded === "full" ? "rounded-full" : rounded === "md" ? "rounded-md" : "rounded-xl";
  const gradient =
    rarity === 5
      ? "linear-gradient(160deg,#8a5a1e,#c98b2e)"
      : rarity === 4
        ? "linear-gradient(160deg,#4a3568,#7a5aa8)"
        : "linear-gradient(160deg,#2a3a4d,#3f5d7a)";

  const current = candidates[index];

  return (
    <div
      className={clsx("relative shrink-0 overflow-hidden border", radius, className)}
      style={{
        width: size,
        height: size,
        background: rarity ? gradient : "var(--bg-elevated)",
        borderColor: "var(--border-strong)",
      }}
    >
      {current ? (
        <img
          key={current}
          src={current}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setState({ key: first, index: index + 1 })}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center px-1 text-center text-[0.6rem] font-bold leading-tight text-[var(--muted-dim)]">
          {alt.slice(0, 12)}
        </div>
      )}
    </div>
  );
}
