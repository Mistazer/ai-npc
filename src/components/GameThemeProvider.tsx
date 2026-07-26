import type { CSSProperties, ReactNode } from "react";
import type { GameConfig } from "@/lib/types";

/** Applique les variables CSS d'accentuation d'un jeu à un sous-arbre. */
export function GameTheme({ game, children }: { game: GameConfig; children: ReactNode }) {
  const style = {
    "--accent": game.accent,
    "--accent-soft": game.accentSoft,
  } as CSSProperties;

  return (
    <div style={style} className="contents">
      {children}
    </div>
  );
}
