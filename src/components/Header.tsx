import Link from "next/link";
import { GAME_LIST } from "@/lib/games";
import { SearchTrigger } from "./SearchTrigger";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[rgba(10,12,18,0.86)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg text-sm font-black text-black"
            style={{ background: "linear-gradient(135deg,#7c9cff,#5fd0c5 50%,#ffd23f)" }}
          >
            H
          </span>
          <span className="text-[0.95rem] font-bold tracking-tight">HoyoDex</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {GAME_LIST.map((game) => (
            <Link
              key={game.id}
              href={`/${game.slug}`}
              className="rounded-lg px-3 py-1.5 text-[0.83rem] font-medium text-[var(--muted)] transition hover:bg-[var(--panel)] hover:text-[var(--text)]"
            >
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: game.accent }} />
              {game.shortName}
            </Link>
          ))}
          <span className="mx-1 h-4 w-px bg-[var(--border)]" />
          <Link
            href="/actualites"
            className="rounded-lg px-3 py-1.5 text-[0.83rem] font-medium text-[var(--muted)] transition hover:bg-[var(--panel)] hover:text-[var(--text)]"
          >
            Actualités
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchTrigger />
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-[var(--border)] px-4 py-2 md:hidden">
        {GAME_LIST.map((game) => (
          <Link
            key={game.id}
            href={`/${game.slug}`}
            className="chip"
            style={{ borderColor: game.accent, color: game.accent }}
          >
            {game.shortName}
          </Link>
        ))}
        <Link href="/actualites" className="chip">
          Actualités
        </Link>
      </nav>
    </header>
  );
}
