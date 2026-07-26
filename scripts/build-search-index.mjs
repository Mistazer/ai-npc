/**
 * Génère public/search-index.json.
 *
 * L'index est volontairement servi comme fichier statique chargé à la demande :
 * s'il était passé en props depuis le layout racine, il serait sérialisé dans
 * le payload de chacune des ~950 pages (≈ 200 Ko par page).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const DATA = resolve(process.cwd(), "src/data/generated");
const OUT = resolve(process.cwd(), "public/search-index.json");

const read = async (name) => JSON.parse(await readFile(resolve(DATA, name), "utf8"));

const GAMES = {
  hsr: { slug: "honkai-star-rail", character: "Personnage", weapon: "Cône de lumière", set: "Set de reliques" },
  gi: { slug: "genshin-impact", character: "Personnage", weapon: "Arme", set: "Set d'artéfacts" },
  zzz: { slug: "zenless-zone-zero", character: "Agent", weapon: "W-Engine", set: "Set de disques" },
};

const entries = [];

const push = (list, game, kind, section) => {
  for (const item of list) {
    entries.push({
      n: item.name,
      u: `/${GAMES[game].slug}/${section}/${item.slug}/`,
      g: game,
      t: GAMES[game][kind],
      i: item.images?.icon ?? null,
      r: typeof item.rarity === "number" ? `${item.rarity}★` : (item.rarity ?? null),
    });
  }
};

const [
  hsrCharacters,
  hsrLightCones,
  hsrRelics,
  giCharacters,
  giWeapons,
  giArtifacts,
  zzzCharacters,
  zzzWeapons,
  zzzDiscs,
  zzzBangboos,
] = await Promise.all(
  [
    "hsr-characters.json",
    "hsr-lightcones.json",
    "hsr-relics.json",
    "gi-characters.json",
    "gi-weapons.json",
    "gi-artifacts.json",
    "zzz-characters.json",
    "zzz-weapons.json",
    "zzz-discs.json",
    "zzz-bangboos.json",
  ].map(read),
);

push(hsrCharacters, "hsr", "character", "personnages");
push(hsrLightCones, "hsr", "weapon", "armes");
push(hsrRelics, "hsr", "set", "sets");
push(giCharacters, "gi", "character", "personnages");
push(giWeapons, "gi", "weapon", "armes");
push(giArtifacts, "gi", "set", "sets");
push(zzzCharacters, "zzz", "character", "personnages");
push(zzzWeapons, "zzz", "weapon", "armes");
push(zzzDiscs, "zzz", "set", "sets");

for (const bangboo of zzzBangboos) {
  entries.push({
    n: bangboo.name,
    u: `/${GAMES.zzz.slug}/bangboo/`,
    g: "zzz",
    t: "Bangboo",
    i: bangboo.images?.icon ?? null,
    r: bangboo.rarity ?? null,
  });
}

await mkdir(resolve(process.cwd(), "public"), { recursive: true });
await writeFile(OUT, JSON.stringify(entries), "utf8");

const size = (await readFile(OUT)).byteLength;
console.log(`✓ public/search-index.json — ${entries.length} entrées (${(size / 1024).toFixed(0)} Ko)`);
