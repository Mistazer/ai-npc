/**
 * Migration ponctuelle : convertit les URL d'images ZZZ en listes de candidates.
 *
 * Hakushin (static.nanoka.cc) a fermé début 2026, ce qui cassait tous les
 * visuels ZZZ. Le composant EntityIcon essaie désormais chaque URL de la liste
 * dans l'ordre, ce script aligne donc les données déjà générées sur ce format.
 *
 * Idempotent : relancer le script ne fait rien si les données sont déjà migrées.
 */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const DATA = resolve(process.cwd(), "src/data/generated");

const CDNS = ["https://api.hakush.in/zzz/UI", "https://static.nanoka.cc/zzz/UI"];

/** Extrait le nom de fichier d'une URL Hakushin connue. */
function candidatesFor(value) {
  if (Array.isArray(value)) return value; // déjà migré
  if (typeof value !== "string") return value;
  const name = value.replace(/^.*\//, "").replace(/\.(png|webp)$/i, "");
  if (!name) return value;
  return CDNS.map((cdn) => `${cdn}/${name}.webp`);
}

const files = [
  "zzz-characters.json",
  "zzz-weapons.json",
  "zzz-discs.json",
  "zzz-bangboos.json",
];

let changed = 0;

for (const file of files) {
  const path = resolve(DATA, file);
  const entries = JSON.parse(await readFile(path, "utf8"));

  for (const entry of entries) {
    if (!entry.images) continue;
    for (const key of Object.keys(entry.images)) {
      const before = entry.images[key];
      if (!before || Array.isArray(before)) continue;
      entry.images[key] = candidatesFor(before);
      changed += 1;
    }
  }

  await writeFile(path, `${JSON.stringify(entries)}\n`, "utf8");
  console.log(`  ✓ ${file}`);
}

console.log(`\n${changed} URL converties en listes de candidates.`);
