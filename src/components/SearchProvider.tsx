"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

/** Préfixe d'URL en production sur GitHub Pages (vide en local). */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const requested = useRef(false);
  const router = useRouter();

  /**
   * L'index (~166 Ko) est téléchargé à la première ouverture de la recherche
   * plutôt qu'inclus dans le HTML de chaque page.
   */
  const loadIndex = useCallback(async () => {
    if (requested.current) return;
    requested.current = true;
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_PATH}/search-index.json`);
      setIndex((await response.json()) as SearchEntry[]);
    } catch {
      requested.current = false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    void loadIndex();
  }, [loadIndex]);

  const fuse = useMemo(
    () => (index ? new Fuse(index, { keys: ["n"], threshold: 0.35, ignoreLocation: true }) : null),
    [index],
  );

  const results = useMemo(() => {
    if (!fuse || query.trim().length < 1) return [];
    return fuse.search(query.trim(), { limit: 24 }).map((result) => result.item);
  }, [fuse, query]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen((value) => {
          if (!value) void loadIndex();
          return !value;
        });
      }
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [loadIndex]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setQuery("");
  };

  return (
    <SearchContext.Provider value={{ open }}>
      {children}
      {isOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={close}
        >
          <div className="surface w-full max-w-2xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
            <div className="border-b border-[var(--border)] p-3">
              <input
                autoFocus
                className="input"
                placeholder="Rechercher un personnage, une arme, un set…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && results[0]) {
                    close();
                    router.push(results[0].u);
                  }
                }}
              />
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2">
              {isLoading && !index ? (
                <p className="p-6 text-center text-sm text-[var(--muted-dim)]">Chargement de l&apos;index…</p>
              ) : query.length === 0 ? (
                <p className="p-6 text-center text-sm text-[var(--muted-dim)]">
                  Tapez pour rechercher parmi {index?.length ?? "les"} entrées des trois jeux.
                </p>
              ) : results.length === 0 ? (
                <p className="p-6 text-center text-sm text-[var(--muted-dim)]">Aucun résultat.</p>
              ) : (
                results.map((entry) => (
                  <Link
                    key={`${entry.u}-${entry.n}`}
                    href={entry.u}
                    onClick={close}
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
