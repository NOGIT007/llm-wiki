import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { WIKI_DIR, RAW_DIR, VAULTS_DIR, CONFIG_FILE } from "./paths";
import { parseFrontmatter, extractWikilinks } from "./frontmatter";
import type { VaultInfo, WikiPage } from "./types";

export const DEFAULT_VAULT: VaultInfo = { name: "default", wikiDir: WIKI_DIR, rawDir: RAW_DIR };

export function sanitizeVaultName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function resolveVault(name?: string | null): VaultInfo {
  if (!name || name === "default") return DEFAULT_VAULT;
  const safeName = sanitizeVaultName(name);
  if (!safeName) return DEFAULT_VAULT;
  const wikiDir = resolve(VAULTS_DIR, safeName, "wiki");
  const rawDir = resolve(VAULTS_DIR, safeName, "raw");
  if (!wikiDir.startsWith(VAULTS_DIR) || !rawDir.startsWith(VAULTS_DIR)) return DEFAULT_VAULT;
  return { name: safeName, wikiDir, rawDir };
}

async function loadDir(dir: string, pages: Map<string, WikiPage>) {
  const files = await readdir(dir).catch(() => [] as string[]);
  for (const file of files) {
    if (!file.endsWith(".md") || file === "index.md" || file === "log.md") continue;
    const raw = await readFile(join(dir, file), "utf-8");
    const slug = file.replace(/\.md$/, "");
    const { meta, content } = parseFrontmatter(raw);
    const links = extractWikilinks(content);
    if (Array.isArray(meta.sources)) {
      for (const s of meta.sources) links.push(...extractWikilinks(s));
    }
    pages.set(slug, {
      slug,
      title: meta.title || slug,
      type: meta.type || "unknown",
      created: meta.created || "",
      updated: meta.updated || "",
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      sources: Array.isArray(meta.sources) ? meta.sources : [],
      content,
      links: [...new Set(links)],
    });
  }
}

export async function loadVault(v: VaultInfo): Promise<Map<string, WikiPage>> {
  const pages = new Map<string, WikiPage>();
  await loadDir(v.wikiDir, pages);
  return pages;
}

// Per-vault page storage
export const vaultPages = new Map<string, Map<string, WikiPage>>();

// Vaults "deleted" but still on disk — persisted in config
function loadHiddenVaults(): Set<string> {
  try {
    const config = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
    return new Set(Array.isArray(config.hiddenVaults) ? config.hiddenVaults : []);
  } catch { return new Set(); }
}

export const hiddenVaults = loadHiddenVaults();

export async function saveHiddenVaults() {
  let config: Record<string, any> = {};
  try { config = JSON.parse(await readFile(CONFIG_FILE, "utf-8")); } catch {}
  config.hiddenVaults = [...hiddenVaults];
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export function getPages(vaultName?: string | null): Map<string, WikiPage> {
  return vaultPages.get(vaultName || "default") || new Map();
}

export async function reloadAllVaults() {
  vaultPages.set("default", await loadVault(DEFAULT_VAULT));
  if (existsSync(VAULTS_DIR)) {
    for (const d of await readdir(VAULTS_DIR)) {
      if (hiddenVaults.has(d)) continue;
      const v = resolveVault(d);
      if (existsSync(v.wikiDir)) vaultPages.set(d, await loadVault(v));
    }
  }
}

export async function listVaults(): Promise<string[]> {
  const names = ["default"];
  if (existsSync(VAULTS_DIR)) {
    const dirs = await readdir(VAULTS_DIR);
    for (const d of dirs) {
      if (!hiddenVaults.has(d) && existsSync(join(VAULTS_DIR, d, "wiki"))) names.push(d);
    }
  }
  return names;
}
