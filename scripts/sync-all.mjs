/**
 * Point d'entrée de la synchronisation : régénère tous les JSON de src/data/generated.
 * Usage : npm run sync            (les trois jeux)
 *         npm run sync -- gi hsr  (sélection)
 */
import { syncGenshin } from "./sync-genshin.mjs";
import { syncHsr } from "./sync-hsr.mjs";
import { syncZzz } from "./sync-zzz.mjs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { DATA_DIR, writeJson } from "./lib/utils.mjs";

const tasks = { gi: syncGenshin, hsr: syncHsr, zzz: syncZzz };

const requested = process.argv.slice(2).filter((arg) => arg in tasks);
const selected = requested.length > 0 ? requested : Object.keys(tasks);

const started = Date.now();
const summary = {};

for (const key of selected) {
  summary[key] = await tasks[key]();
}

// On fusionne avec le meta existant pour ne pas perdre les jeux non re-synchronisés.
let previous = { games: {} };
try {
  previous = JSON.parse(await readFile(resolve(DATA_DIR, "meta.json"), "utf8"));
} catch {
  /* premier lancement */
}

await writeJson("meta.json", {
  syncedAt: new Date().toISOString(),
  games: { ...previous.games, ...summary },
  sources: {
    gi: "genshin-db (npm)",
    hsr: "Mar-7th/StarRailRes",
    zzz: "Genshin-Optimizer/zzz-hakushin-data (Hakushin)",
  },
});

console.log(`\n✔ Synchronisation terminée en ${((Date.now() - started) / 1000).toFixed(1)}s`);
console.table(summary);
