import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");

export const WIKI_DIR = join(ROOT, "wiki");
export const RAW_DIR = join(ROOT, "raw");
export const VAULTS_DIR = join(ROOT, "vaults");
export const CONFIG_FILE = join(ROOT, ".wiki-config.json");
export const QUEUE_FILE = join(ROOT, ".wiki-queue.json");
export const PUBLIC_DIR = join(ROOT, "public");

export const NO_CACHE = {
  "cache-control": "no-store, no-cache, must-revalidate",
  "pragma": "no-cache",
} as const;
