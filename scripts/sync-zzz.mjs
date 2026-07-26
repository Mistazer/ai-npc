/**
 * Synchronisation des données Zenless Zone Zero depuis le miroir
 * Genshin-Optimizer/zzz-hakushin-data (données Hakushin).
 */
import { getJson, mapLimit } from "./lib/github.mjs";
import { cleanText, dedupeSlugs, slugify, step, writeJson } from "./lib/utils.mjs";

const REPO = "Genshin-Optimizer/zzz-hakushin-data";
const CDN = "https://static.nanoka.cc/zzz/UI";
const asset = (file) => (file ? `${CDN}/${String(file).replace(/^.*\//, "").replace(/\.(png|webp)$/i, "")}.webp` : null);

const RARITY = { 2: "B", 3: "A", 4: "S" };

const SPECIALTY_FR = {
  Attack: "Attaque",
  Stun: "Étourdissement",
  Anomaly: "Anomalie",
  Support: "Soutien",
  Defense: "Défense",
  Rupture: "Rupture",
};

const ELEMENT_FR = {
  Physical: "Physique",
  Fire: "Feu",
  Ice: "Glace",
  Electric: "Électrique",
  Ether: "Éther",
  Frost: "Givre",
  "Auric Ink": "Encre aurique",
};

const first = (record) => (record && typeof record === "object" ? Object.values(record)[0] ?? null : null);

function skillBlocks(skill) {
  if (!skill) return [];
  const order = ["Basic", "Dodge", "Special", "Chain", "Assist"];
  const labels = {
    Basic: "Attaque de base",
    Dodge: "Esquive",
    Special: "Attaque spéciale",
    Chain: "Attaque en chaîne",
    Assist: "Assistance",
  };
  return order
    .filter((key) => skill[key])
    .map((key) => ({
      type: labels[key] ?? key,
      entries: (skill[key].Description ?? []).map((entry) => ({
        name: entry.Name,
        description: cleanText(entry.Desc),
      })),
    }));
}

function mindscapes(talent) {
  if (!talent) return [];
  return Object.values(talent)
    .map((entry) => ({
      level: entry.Level,
      name: entry.Name,
      description: cleanText(entry.Desc),
      extra: entry.Desc2 ? cleanText(entry.Desc2) : null,
    }))
    .sort((a, b) => a.level - b.level);
}

function coreSkills(passive) {
  const levels = passive?.Level;
  if (!levels) return [];
  const last = Object.values(levels).at(-1);
  if (!last) return [];
  const names = Array.isArray(last.Name) ? last.Name : [last.Name];
  const descriptions = Array.isArray(last.Desc) ? last.Desc : [last.Desc];
  return names.map((name, index) => ({
    name,
    description: cleanText(descriptions[index] ?? ""),
  }));
}

export async function syncZzz() {
  step("Zenless Zone Zero — index");
  const [charIndex, weaponIndex, discIndex, bangbooIndex] = await Promise.all([
    getJson(REPO, "character.json"),
    getJson(REPO, "weapon.json"),
    getJson(REPO, "equipment.json"),
    getJson(REPO, "bangboo.json"),
  ]);

  step("Zenless Zone Zero — agents");
  const ids = Object.keys(charIndex);
  const details = await mapLimit(ids, 6, async (id) => {
    try {
      return await getJson(REPO, `character/${id}.json`);
    } catch {
      return null;
    }
  });

  const characters = ids.map((id, index) => {
    const summary = charIndex[id];
    const detail = details[index];
    const specialty = first(detail?.WeaponType) ?? null;
    const element = first(detail?.ElementType) ?? null;
    const attack = first(detail?.HitType) ?? null;
    const faction = first(detail?.Camp) ?? null;
    const stats = detail?.Stats ?? {};
    const info = detail?.PartnerInfo ?? {};

    return {
      game: "zzz",
      id,
      slug: slugify(summary.EN || detail?.Name || id),
      name: summary.EN || detail?.Name || id,
      fullName: info.FullName || null,
      rarity: RARITY[summary.rank] ?? "A",
      rarityRank: summary.rank === 4 ? 5 : 4,
      specialty,
      specialtyFr: SPECIALTY_FR[specialty] ?? specialty,
      element,
      elementFr: ELEMENT_FR[element] ?? element,
      attackType: attack,
      faction,
      birthday: info.Birthday || null,
      gender: info.Gender || null,
      description: cleanText(summary.desc ?? ""),
      tagline: Array.isArray(detail?.Strategy) ? cleanText(detail.Strategy[1] ?? "") : null,
      role: Array.isArray(detail?.Strategy) ? cleanText(detail.Strategy[2] ?? "") : null,
      images: {
        icon: asset(String(summary.icon).replace("IconRole", "IconRoleSelect")),
        avatar: asset(String(summary.icon).replace("IconRole", "IconRoleCircle")),
        splash: asset(summary.icon),
      },
      stats: {
        hp: stats.HpMax ?? null,
        atk: stats.Attack ?? null,
        def: stats.Defence ?? null,
        impact: stats.BreakStun ?? null,
        critRate: stats.Crit ? stats.Crit / 100 : null,
        critDmg: stats.CritDamage ? stats.CritDamage / 100 : null,
        anomalyMastery: stats.ElementMystery ?? null,
        anomalyProficiency: stats.ElementAbnormalPower ?? null,
        energyRegen: stats.SpRecover ? stats.SpRecover / 100 : null,
      },
      skills: skillBlocks(detail?.Skill),
      coreSkills: coreSkills(detail?.Passive),
      mindscapes: mindscapes(detail?.Talent),
    };
  });
  characters.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  dedupeSlugs(characters);
  await writeJson("zzz-characters.json", characters);

  step("Zenless Zone Zero — W-Engines");
  const weaponDetails = await mapLimit(Object.keys(weaponIndex), 6, async (id) => {
    try {
      return [id, await getJson(REPO, `weapon/${id}.json`)];
    } catch {
      return [id, null];
    }
  });
  const weapons = weaponDetails.map(([id, detail]) => {
    const summary = weaponIndex[id];
    const talents = detail?.Talents ? Object.values(detail.Talents) : [];
    const refinement = talents.at(0) ?? null;
    return {
      game: "zzz",
      id,
      slug: slugify(summary.EN),
      name: summary.EN,
      rarity: RARITY[summary.rank] ?? "B",
      rarityRank: summary.rank === 4 ? 5 : summary.rank === 3 ? 4 : 3,
      specialty: first(detail?.WeaponType) ?? null,
      specialtyFr: SPECIALTY_FR[first(detail?.WeaponType)] ?? first(detail?.WeaponType),
      baseAtk: summary.atk ?? null,
      subStat: summary.sub ?? null,
      description: cleanText(summary.desc ?? ""),
      effectName: refinement?.Name ?? null,
      effect: refinement ? cleanText(refinement.Desc) : "",
      images: { icon: asset(summary.icon) },
    };
  });
  weapons.sort((a, b) => b.rarityRank - a.rarityRank || a.name.localeCompare(b.name, "fr"));
  dedupeSlugs(weapons);
  await writeJson("zzz-weapons.json", weapons);

  step("Zenless Zone Zero — disques driver");
  const discs = Object.entries(discIndex).map(([id, raw]) => {
    const info = raw.EN ?? raw.en ?? {};
    return {
      game: "zzz",
      id,
      slug: slugify(info.name ?? id),
      name: info.name ?? id,
      bonuses: [
        info.desc2 ? { pieces: 2, effect: cleanText(info.desc2) } : null,
        info.desc4 ? { pieces: 4, effect: cleanText(info.desc4) } : null,
      ].filter(Boolean),
      images: { icon: asset(raw.icon) },
    };
  });
  discs.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  dedupeSlugs(discs);
  await writeJson("zzz-discs.json", discs);

  step("Zenless Zone Zero — Bangboo");
  const bangboos = Object.entries(bangbooIndex).map(([id, raw]) => ({
    game: "zzz",
    id,
    slug: slugify(raw.EN ?? raw.codename ?? id),
    name: raw.EN ?? raw.codename ?? id,
    rarity: RARITY[raw.rank] ?? "A",
    rarityRank: raw.rank === 4 ? 5 : 4,
    description: cleanText(raw.desc ?? ""),
    images: { icon: asset(raw.icon) },
  }));
  bangboos.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  dedupeSlugs(bangboos);
  await writeJson("zzz-bangboos.json", bangboos);

  return {
    characters: characters.length,
    weapons: weapons.length,
    discs: discs.length,
    bangboos: bangboos.length,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncZzz().then((r) => console.log("\nZZZ OK", r));
}
