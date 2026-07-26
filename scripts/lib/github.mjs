/**
 * Petit client GitHub "raw" utilisé par les scripts de synchronisation.
 * On passe par l'API contents/blobs de GitHub plutôt que par raw.githubusercontent
 * afin de rester compatible avec les environnements où seul api.github.com est joignable.
 */

const API = "https://api.github.com";

function headers(accept = "application/vnd.github+json") {
  const h = {
    Accept: accept,
    "User-Agent": "hoyodex-sync",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function request(url, accept) {
  let lastError;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const res = await fetch(url, { headers: headers(accept) });
      if (res.status === 403 || res.status === 429) {
        const reset = Number(res.headers.get("x-ratelimit-reset") || 0) * 1000;
        const wait = Math.min(Math.max(reset - Date.now(), 2000), 30_000);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
      return res;
    } catch (error) {
      lastError = error;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw lastError ?? new Error(`Échec de la requête : ${url}`);
}

/** Récupère un fichier JSON d'un dépôt GitHub. */
export async function getJson(repo, path, ref = "HEAD") {
  const url = `${API}/repos/${repo}/contents/${path}?ref=${ref}`;
  const res = await request(url, "application/vnd.github.raw");
  return res.json();
}

/** Liste les fichiers d'un dossier d'un dépôt GitHub. */
export async function listDir(repo, path, ref = "HEAD") {
  const url = `${API}/repos/${repo}/contents/${path}?ref=${ref}`;
  const res = await request(url);
  return res.json();
}

/** Exécute des tâches async avec une limite de parallélisme. */
export async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}
