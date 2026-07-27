/**
 * Vérifie la cohérence du contenu éditorial avec les données générées :
 * slugs de personnages inexistants, colonnes de tier list inconnues,
 * membres d'équipe introuvables.
 *
 * Usage : npm run check-content
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const DATA = resolve(process.cwd(), "src/data/generated");
const SRC = resolve(process.cwd(), "src");

const read = async (name) => JSON.parse(await readFile(resolve(DATA, name), "utf8"));

const [gi, hsr, zzz] = await Promise.all([
  read("gi-characters.json"),
  read("hsr-characters.json"),
  read("zzz-characters.json"),
]);

const slugs = {
  gi: new Set(gi.map((c) => c.slug)),
  hsr: new Set(hsr.map((c) => c.slug)),
  zzz: new Set(zzz.map((c) => c.slug)),
};

const columns = {
  hsr: new Set(["dps", "sub", "amp", "sustain"]),
  gi: new Set(["dps", "sub", "support", "healer"]),
  zzz: new Set(["dps", "anomaly", "stun", "support"]),
};

const problems = [];

/** Parcourt un fichier TS en suivant la valeur courante de `game`. */
async function scan(file, handlers) {
  const text = await readFile(resolve(SRC, file), "utf8");
  let game = null;
  let line = 0;
  for (const raw of text.split("\n")) {
    line += 1;
    const gameMatch = raw.match(/game:\s*"(gi|hsr|zzz)"/);
    if (gameMatch) game = gameMatch[1];
    for (const handler of handlers) handler(raw, game, line, file);
  }
}

await scan("content/tierlists.ts", [
  (raw, game, line, file) => {
    const match = raw.match(/slug:\s*"([a-z0-9-]+)",\s*tier:\s*"([^"]+)",\s*column:\s*"([a-z]+)"/);
    if (!match || !game) return;
    const [, slug, tier, column] = match;
    if (!slugs[game].has(slug)) problems.push(`${file}:${line} — slug inconnu (${game}) : ${slug}`);
    if (!columns[game].has(column)) problems.push(`${file}:${line} — colonne inconnue (${game}) : ${column}`);
    if (!["T0", "T0.5", "T1", "T1.5", "T2", "T3"].includes(tier))
      problems.push(`${file}:${line} — tier invalide : ${tier}`);
  },
  (raw, game, line, file) => {
    // Une entrée mal formée (sans colonne) doit être signalée.
    if (/slug:\s*"[a-z0-9-]+",\s*tier:/.test(raw) && !/column:/.test(raw))
      problems.push(`${file}:${line} — entrée sans colonne`);
  },
]);

await scan("content/guides.ts", [
  (raw, game, line, file) => {
    const match = raw.match(/^\s*slug:\s*"([a-z0-9-]+)",\s*$/);
    if (!match || !game) return;
    if (!slugs[game].has(match[1])) problems.push(`${file}:${line} — guide sur slug inconnu (${game}) : ${match[1]}`);
  },
  (raw, game, line, file) => {
    const match = raw.match(/members:\s*\[([^\]]+)\]/);
    if (!match || !game) return;
    for (const member of match[1].split(",")) {
      const slug = member.trim().replace(/^"|"$/g, "");
      if (slug && !slugs[game].has(slug))
        problems.push(`${file}:${line} — membre d'équipe inconnu (${game}) : ${slug}`);
    }
  },
]);

await scan("content/beta.ts", [
  (raw, game, line, file) => {
    const match = raw.match(/^\s*slug:\s*"([a-z0-9-]+)",\s*$/);
    if (!match || !game) return;
    if (!slugs[game].has(match[1]))
      problems.push(`${file}:${line} — entrée bêta sur slug inconnu (${game}) : ${match[1]}`);
  },
]);

if (problems.length > 0) {
  console.error(`\n✖ ${problems.length} problème(s) de contenu :\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log("✓ Contenu éditorial cohérent avec les données générées.");
