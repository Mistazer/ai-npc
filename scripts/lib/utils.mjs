import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export const ROOT = resolve(process.cwd());
export const DATA_DIR = resolve(ROOT, "src/data/generated");

/** Transforme un nom en identifiant d'URL. */
export function slugify(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[''']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Nettoie les balises de mise en forme propriétaires des jeux HoYoverse. */
export function cleanText(value) {
  return String(value ?? "")
    .replace(/<color=[^>]*>/gi, "")
    .replace(/<\/color>/gi, "")
    .replace(/<i>|<\/i>|<b>|<\/b>/gi, "")
    .replace(/<IconMap:[^>]*>/gi, "")
    .replace(/<unbreak>|<\/unbreak>/gi, "")
    .replace(/\{LAYOUT_[A-Z]+#([^}]*)\}/g, "$1")
    .replace(/\{NON_BREAK_SPACE\}/g, " ")
    .replace(/\\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

/** Écrit un JSON formaté dans src/data/generated. */
export async function writeJson(name, payload) {
  const file = resolve(DATA_DIR, name);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(payload, null, 0)}\n`, "utf8");
  const size = Buffer.byteLength(JSON.stringify(payload));
  console.log(`  ✓ ${name} (${(size / 1024).toFixed(0)} Ko)`);
}

/** Journalise une étape. */
export function step(label) {
  console.log(`\n▸ ${label}`);
}

/** Garantit l'unicité des slugs d'une liste (suffixe numérique si collision). */
export function dedupeSlugs(entries) {
  const seen = new Map();
  for (const entry of entries) {
    const base = entry.slug;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    if (count > 0) entry.slug = `${base}-${count + 1}`;
  }
  return entries;
}
