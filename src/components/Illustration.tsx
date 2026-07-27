"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import clsx from "clsx";
import type { ImageSource } from "@/lib/types";

/**
 * Illustration pleine largeur avec repli sur les URL suivantes.
 * Même logique que EntityIcon, pour les visuels de grande taille.
 */
export function Illustration({
  src,
  alt,
  className,
}: {
  src: ImageSource;
  alt: string;
  className?: string;
}) {
  const candidates = (Array.isArray(src) ? src : [src]).filter(Boolean) as string[];
  const [index, setIndex] = useState(0);
  const current = candidates[index];

  if (!current) return null;

  return (
    <img
      key={current}
      src={current}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setIndex((value) => value + 1)}
      className={clsx("w-full rounded-lg", className)}
    />
  );
}
