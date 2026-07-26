"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { EntityIcon } from "./EntityIcon";
import { GAMES } from "@/lib/games";
import type { SearchEntry } from "@/lib/search";

interface SearchContextValue {
  open: () => void;
}

const SearchContext = createContext<SearchContextValue>({ open: () => {} });

export const useSearch = () => useContext(SearchContext);

export function SearchProvider({ index, children }: { index: SearchEntry[]; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const fuse = useMemo(
    () => new Fuse(index, { keys: ["n"], threshold: 0.35, ignoreLocation: true }),
    [index],
  );

  const results = useMemo(() => {
    if (query.trim().length < 1) return [];
    return fuse.search(query.trim()).slice(0, 24).map((r) => r.item);
  }, [fuse, query]);

  const open = useCallback(() => setIsOpen(true), []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen((value) => !value);
      }
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const go = (url: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(url);
  };

  return (
    <SearchContext.Provider value={{ open }}>
      {children}
      {isOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="surface w-full max-w-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-[var(--border)] p-3">
              <input
                autoFocus
                className="input"
                placeholder="Rechercher un personnage, une arme, un set…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && results[0]) go(results[0].u);
                }}
              />
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2">
              {query.length === 0 ? (
                <p className="p-6 text-center text-sm text-[var(--muted-dim)]">
                  Tapez pour rechercher parmi {index.length} entrées des trois jeux.
                </p>
              ) : results.length === 0 ? (
                <p className="p-6 text-center text-sm text-[var(--muted-dim)]">Aucun résultat.</p>
              ) : (
                results.map((entry) => (
                  <Link
                    key={`${entry.u}-${entry.n}`}
                    href={entry.u}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-[var(--panel-hover)]"
                  >
                    <EntityIcon
                      src={entry.i}
                      alt={entry.n}
                      size={38}
                      rarity={typeof entry.r === "number" ? entry.r : entry.r === "S" ? 5 : 4}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{entry.n}</p>
                      <p className="text-xs text-[var(--muted-dim)]">
                        {GAMES[entry.g].shortName} · {entry.t}
                      </p>
                    </div>
                    {entry.r ? <span className="chip">{entry.r}</span> : null}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </SearchContext.Provider>
  );
}
