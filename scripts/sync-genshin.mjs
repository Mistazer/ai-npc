/**
 * Synchronisation des données Genshin Impact depuis le paquet npm `genshin-db`
 * (données extraites du jeu, mises à jour à chaque patch).
 */
import genshindb from "genshin-db";
import { cleanText, dedupeSlugs, slugify, step, writeJson } from "./lib/utils.mjs";

const ENKA = "https://enka.network/ui";
const query = { matchCategories: true, verboseCategories: true };

const ELEMENT_FR = {
  Anemo: "Anémo",
  Geo: "Géo",
  Electro: "Électro",
  Dendro: "Dendro",
  Hydro: "Hydro",
  Pyro: "Pyro",
  Cryo: "Cryo",
  None: "Aucun",
};

const WEAPON_FR = {
  Sword: "Épée",
  Claymore: "Espadon",
  Polearm: "Lance",
  Bow: "Arc",
  Catalyst: "Catalyseur",
};

function icon(images) {
  if (!images) return null;
  if (images.filename_icon) return `${ENKA}/${images.filename_icon}.png`;
  return images.mihoyo_icon ?? images.icon ?? null;
}

function splash(images) {
  if (!images) return null;
  if (images.filename_gachaSplash) return `${ENKA}/${images.filename_gachaSplash}.png`;
  return images.cover1 ?? images.portrait ?? images.card ?? null;
}

function talentEntry(entry) {
  if (!entry) return null;
  return {
    name: entry.name,
    description: cleanText(entry.descriptionRaw ?? entry.description),
  };
}

function ascensionMaterials(costs) {
  if (!costs) return [];
  const total = new Map();
  for (const list of Object.values(costs)) {
    for (const mat of list ?? []) {
      const previous = total.get(mat.name) ?? 0;
      total.set(mat.name, previous + (mat.count ?? 0));
    }
  }
  return [...total].map(([name, count]) => ({ name, count }));
}

export async function syncGenshin() {
  step("Genshin Impact — personnages");
  const characters = [];
  for (const raw of genshindb.characters("names", query)) {
    if (!raw?.name) continue;
    const talents = genshindb.talents(raw.name, { verboseCategories: true });
    const constellations = genshindb.constellations(raw.name, { verboseCategories: true });
    const statsAt90 = typeof raw.stats === "function" ? raw.stats(90) : null;

    characters.push({
      game: "gi",
      id: String(raw.id),
      slug: slugify(raw.name),
      name: raw.name,
      title: raw.title || null,
      rarity: raw.rarity,
      element: raw.elementText,
      elementFr: ELEMENT_FR[raw.elementText] ?? raw.elementText,
      weapon: raw.weaponText,
      weaponFr: WEAPON_FR[raw.weaponText] ?? raw.weaponText,
      region: raw.region || null,
      affiliation: raw.affiliation || null,
      substat: raw.substatText || null,
      gender: raw.gender || null,
      birthday: raw.birthday || null,
      constellationName: raw.constellation || null,
      version: raw.version || null,
      description: cleanText(raw.description),
      images: {
        icon: icon(raw.images),
        splash: splash(raw.images),
        card: raw.images?.filename_iconCard ? `${ENKA}/${raw.images.filename_iconCard}.png` : null,
      },
      stats: statsAt90
        ? {
            hp: Math.round(statsAt90.hp),
            atk: Math.round(statsAt90.attack),
            def: Math.round(statsAt90.defense),
            special: statsAt90.specialized ?? null,
          }
        : null,
      cv: raw.cv ?? null,
      talents: talents
        ? {
            combat: [talents.combat1, talents.combat2, talents.combat3].filter(Boolean).map(talentEntry),
            passives: [talents.passive1, talents.passive2, talents.passive3]
              .filter(Boolean)
              .map(talentEntry),
          }
        : { combat: [], passives: [] },
      constellations: constellations
        ? ["c1", "c2", "c3", "c4", "c5", "c6"]
            .map((key, index) => {
              const entry = constellations[key];
              if (!entry) return null;
              return { level: index + 1, name: entry.name, description: cleanText(entry.descriptionRaw ?? entry.description) };
            })
            .filter(Boolean)
        : [],
      materials: ascensionMaterials(raw.costs),
    });
  }
  characters.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  dedupeSlugs(characters);
  await writeJson("gi-characters.json", characters);

  step("Genshin Impact — armes");
  const weapons = [];
  for (const raw of genshindb.weapons("names", query)) {
    if (!raw?.name) continue;
    weapons.push({
      game: "gi",
      id: String(raw.id),
      slug: slugify(raw.name),
      name: raw.name,
      rarity: raw.rarity,
      type: raw.weaponText,
      typeFr: WEAPON_FR[raw.weaponText] ?? raw.weaponText,
      baseAtk: raw.baseAtkValue ?? null,
      mainStat: raw.mainStatText || null,
      effectName: raw.effectName || null,
      effect: cleanText(raw.r1?.description ?? raw.effectTemplateRaw ?? ""),
      refinements: ["r1", "r2", "r3", "r4", "r5"]
        .map((key) => (raw[key] ? cleanText(raw[key].description) : null))
        .filter(Boolean),
      description: cleanText(raw.description),
      version: raw.version || null,
      images: {
        icon: raw.images?.filename_icon ? `${ENKA}/${raw.images.filename_icon}.png` : raw.images?.icon ?? null,
        splash: raw.images?.filename_gacha ? `${ENKA}/${raw.images.filename_gacha}.png` : null,
      },
    });
  }
  weapons.sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name, "fr"));
  dedupeSlugs(weapons);
  await writeJson("gi-weapons.json", weapons);

  step("Genshin Impact — artéfacts");
  const artifacts = [];
  for (const raw of genshindb.artifacts("names", query)) {
    if (!raw?.name) continue;
    artifacts.push({
      game: "gi",
      id: String(raw.id),
      slug: slugify(raw.name),
      name: raw.name,
      rarities: raw.rarityList ?? [],
      rarity: Math.max(...(raw.rarityList ?? [5])),
      bonuses: [
        raw.effect1Pc ? { pieces: 1, effect: cleanText(raw.effect1Pc) } : null,
        raw.effect2Pc ? { pieces: 2, effect: cleanText(raw.effect2Pc) } : null,
        raw.effect4Pc ? { pieces: 4, effect: cleanText(raw.effect4Pc) } : null,
      ].filter(Boolean),
      pieces: ["flower", "plume", "sands", "goblet", "circlet"]
        .map((key) => {
          const piece = raw[key];
          if (!piece) return null;
          return {
            slot: key,
            name: piece.name,
            description: cleanText(piece.description),
            icon: raw.images?.[`filename_${key}`] ? `${ENKA}/${raw.images[`filename_${key}`]}.png` : raw.images?.[key] ?? null,
          };
        })
        .filter(Boolean),
      version: raw.version || null,
      images: {
        icon:
          raw.images?.filename_flower
            ? `${ENKA}/${raw.images.filename_flower}.png`
            : raw.images?.flower ?? raw.images?.circlet ?? null,
      },
    });
  }
  artifacts.sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name, "fr"));
  dedupeSlugs(artifacts);
  await writeJson("gi-artifacts.json", artifacts);

  return { characters: characters.length, weapons: weapons.length, artifacts: artifacts.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncGenshin().then((r) => console.log("\nGenshin OK", r));
}
