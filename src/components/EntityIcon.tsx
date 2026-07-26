/* eslint-disable @next/next/no-img-element */
import clsx from "clsx";

interface Props {
  src: string | null;
  alt: string;
  rarity?: number;
  size?: number;
  className?: string;
  rounded?: "full" | "lg" | "md";
}

/**
 * Vignette d'entité. Les images proviennent de CDN externes non optimisables :
 * on utilise volontairement <img> avec chargement paresseux.
 */
export function EntityIcon({ src, alt, rarity, size = 64, className, rounded = "lg" }: Props) {
  const radius = rounded === "full" ? "rounded-full" : rounded === "md" ? "rounded-md" : "rounded-xl";
  const gradient =
    rarity === 5
      ? "linear-gradient(160deg,#8a5a1e,#c98b2e)"
      : rarity === 4
        ? "linear-gradient(160deg,#4a3568,#7a5aa8)"
        : "linear-gradient(160deg,#2a3a4d,#3f5d7a)";

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
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[var(--muted-dim)]">
          {alt.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}
