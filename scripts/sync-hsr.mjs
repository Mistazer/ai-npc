/**
 * Synchronisation des données Honkai: Star Rail depuis le dépôt communautaire
 * Mar-7th/StarRailRes (index JSON + assets images).
 */
import { getJson } from "./lib/github.mjs";
import { cleanText, dedupeSlugs, slugify, step, writeJson } from "./lib/utils.mjs";

const REPO = "Mar-7th/StarRailRes";
const CDN = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master";
const asset = (path) => (path ? `${CDN}/${path}` : null);

const PATH_FR = {
  Destruction: "Destruction",
  "The Hunt": "Chasse",
  Hunt: "Chasse",
  Erudition: "Érudition",
  Harmony: "Harmonie",
  Nihility: "Néant",
  Preservation: "Préservation",
  Abundance: "Abondance",
  Remembrance: "Souvenir",
  Elation: "Allégresse",
};

const ELEMENT_FR = {
  Physical: "Physique",
  Fire: "Feu",
  Ice: "Glace",
  Lightning: "Foudre",
  Thunder: "Foudre",
  Wind: "Vent",
  Quantum: "Quantique",
  Imaginary: "Imaginaire",
};

/** Les identifiants internes diffèrent parfois des noms affichés en jeu. */
const ELEMENT_LABEL = { Thunder: "Lightning" };

/** Injecte les valeurs numériques dans la description d'une compétence. */
function renderSkill(desc, params) {
  if (!desc) return "";
  const values = params ?? [];
  return cleanText(
    desc.replace(/#(\d+)\[(i|f\d)\](%?)/g, (_, index, format, percent) => {
      const value = values[Number(index) - 1];
      if (value === undefined) return "";
      const scaled = percent ? value * 100 : value;
      const digits = format === "i" ? 0 : Number(format.slice(1));
      return `${Number(scaled.toFixed(digits))}${percent}`;
    }),
  );
}

export async function syncHsr() {
  step("Honkai: Star Rail — téléchargement des index");
  const [chars, skills, ranks, promotions, lightCones, lightConeRanks, relicSets, paths, elements] =
    await Promise.all([
      getJson(REPO, "index_min/en/characters.json"),
      getJson(REPO, "index_min/en/character_skills.json"),
      getJson(REPO, "index_min/en/character_ranks.json"),
      getJson(REPO, "index_min/en/character_promotions.json"),
      getJson(REPO, "index_min/en/light_cones.json"),
      getJson(REPO, "index_min/en/light_cone_ranks.json"),
      getJson(REPO, "index_min/en/relic_sets.json"),
      getJson(REPO, "index_min/en/paths.json"),
      getJson(REPO, "index_min/en/elements.json"),
    ]);

  step("Honkai: Star Rail — personnages");
  const characters = Object.values(chars).map((raw) => {
    const promo = promotions[raw.id]?.values?.at(-1);
    const maxLevel = 80;
    const stat = (key) =>
      promo?.[key] ? Math.round(promo[key].base + promo[key].step * (maxLevel - 1)) : null;

    return {
      game: "hsr",
      id: raw.id,
      slug: slugify(raw.name === "{NICKNAME}" ? `trailblazer-${raw.path}-${raw.element}` : raw.name),
      name: raw.name === "{NICKNAME}" ? `Trailblazer (${raw.element})` : raw.name,
      rarity: raw.rarity,
      path: paths[raw.path]?.name ?? raw.path,
      pathFr: PATH_FR[paths[raw.path]?.name] ?? paths[raw.path]?.name ?? raw.path,
      pathIcon: asset(paths[raw.path]?.icon),
      element: ELEMENT_LABEL[raw.element] ?? elements[raw.element]?.name ?? raw.element,
      elementFr: ELEMENT_FR[raw.element] ?? raw.element,
      elementIcon: asset(elements[raw.element]?.icon),
      maxSp: raw.max_sp ?? null,
      images: {
        icon: asset(raw.icon),
        preview: asset(raw.preview),
        splash: asset(raw.portrait),
      },
      stats: promo
        ? {
            hp: stat("hp"),
            atk: stat("atk"),
            def: stat("def"),
            spd: promo.spd ? Math.round(promo.spd.base) : null,
            critRate: promo.crit_rate ? promo.crit_rate.base : null,
            critDmg: promo.crit_dmg ? promo.crit_dmg.base : null,
          }
        : null,
      skills: (raw.skills ?? [])
        .map((id) => skills[id])
        .filter(Boolean)
        .map((skill) => ({
          id: skill.id,
          name: skill.name,
          type: skill.type_text || skill.type,
          effect: skill.effect_text || null,
          icon: asset(skill.icon),
          simple: cleanText(skill.simple_desc ?? ""),
          description: renderSkill(skill.desc, skill.params?.at(-1)),
        })),
      eidolons: (raw.ranks ?? [])
        .map((id) => ranks[id])
        .filter(Boolean)
        .map((rank) => ({
          level: rank.rank,
          name: rank.name,
          icon: asset(rank.icon),
          description: cleanText(rank.desc),
        })),
    };
  });
  characters.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  dedupeSlugs(characters);
  await writeJson("hsr-characters.json", characters);

  step("Honkai: Star Rail — cônes de lumière");
  const cones = Object.values(lightCones).map((raw) => {
    const rank = lightConeRanks[raw.id];
    return {
      game: "hsr",
      id: raw.id,
      slug: slugify(raw.name),
      name: raw.name,
      rarity: raw.rarity,
      path: paths[raw.path]?.name ?? raw.path,
      pathFr: PATH_FR[paths[raw.path]?.name] ?? paths[raw.path]?.name ?? raw.path,
      description: cleanText(raw.desc),
      effectName: rank?.skill ? null : null,
      effect: rank ? renderSkill(rank.desc, rank.params?.[0]) : "",
      images: { icon: asset(raw.icon), splash: asset(raw.portrait), preview: asset(raw.preview) },
    };
  });
  cones.sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name, "fr"));
  dedupeSlugs(cones);
  await writeJson("hsr-lightcones.json", cones);

  step("Honkai: Star Rail — reliques");
  const relics = Object.values(relicSets).map((raw) => ({
    game: "hsr",
    id: raw.id,
    slug: slugify(raw.name),
    name: raw.name,
    // Les sets 1xx sont des reliques (4 pièces), les 3xx des ornements planaires (2 pièces).
    kind: Number(raw.id) >= 300 ? "planar" : "relic",
    kindFr: Number(raw.id) >= 300 ? "Ornement planaire" : "Relique",
    bonuses: (raw.desc ?? [])
      .map((desc, index) => (desc ? { pieces: index === 0 ? 2 : 4, effect: cleanText(desc) } : null))
      .filter(Boolean),
    images: { icon: asset(raw.icon) },
  }));
  relics.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  dedupeSlugs(relics);
  await writeJson("hsr-relics.json", relics);

  return { characters: characters.length, lightCones: cones.length, relics: relics.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncHsr().then((r) => console.log("\nHSR OK", r));
}
