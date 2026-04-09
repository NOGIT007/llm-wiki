import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { WIKI_DIR, RAW_DIR, VAULTS_DIR, CONFIG_FILE, QUEUE_FILE } from "./paths";
import { resolveVault, hiddenVaults } from "./vaults";
import type { BackupStatus } from "./types";

export const GCS_BUCKET = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || "";

export let backupStatus: BackupStatus = {
  lastBackup: null, lastLabel: null, filesUploaded: 0, inProgress: false, error: null,
};

let cachedToken = { token: "", expiresAt: 0 };

async function getAccessToken(): Promise<string> {
  if (cachedToken.token && Date.now() < cachedToken.expiresAt) return cachedToken.token;
  const proc = Bun.spawn(["gcloud", "auth", "application-default", "print-access-token"], {
    stdout: "pipe", stderr: "pipe",
  });
  const token = (await new Response(proc.stdout).text()).trim();
  const exitCode = await proc.exited;
  if (exitCode !== 0 || !token) {
    throw new Error("Failed to get GCP access token. Run: gcloud auth application-default login");
  }
  cachedToken = { token, expiresAt: Date.now() + 50 * 60 * 1000 };
  return token;
}

async function uploadToGCS(objectPath: string, content: string, token: string): Promise<void> {
  const url = `https://storage.googleapis.com/upload/storage/v1/b/${GCS_BUCKET}/o?uploadType=media&name=${encodeURIComponent(objectPath)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "authorization": `Bearer ${token}`, "content-type": "text/plain; charset=utf-8" },
    body: content,
  });
  if (!res.ok) throw new Error(`GCS upload failed for ${objectPath}: ${res.status}`);
}

async function uploadDirToGCS(dir: string, prefix: string, token: string): Promise<string[]> {
  const manifest: string[] = [];
  const files = await readdir(dir).catch(() => [] as string[]);
  for (const f of files.filter(f => f.endsWith(".md"))) {
    const content = await readFile(join(dir, f), "utf-8");
    await uploadToGCS(`${prefix}/${f}`, content, token);
    manifest.push(`${prefix}/${f}`);
  }
  return manifest;
}

export async function runBackup(): Promise<void> {
  if (!GCS_BUCKET) throw new Error("GOOGLE_CLOUD_STORAGE_BUCKET not set");
  backupStatus.inProgress = true;
  backupStatus.error = null;
  try {
    const token = await getAccessToken();
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const prefix = `backups/${ts}`;
    const manifest: string[] = [];

    manifest.push(...await uploadDirToGCS(WIKI_DIR, `${prefix}/wiki`, token));
    manifest.push(...await uploadDirToGCS(RAW_DIR, `${prefix}/raw`, token));

    if (existsSync(VAULTS_DIR)) {
      for (const d of await readdir(VAULTS_DIR)) {
        if (hiddenVaults.has(d)) continue;
        const v = resolveVault(d);
        if (existsSync(v.wikiDir)) {
          manifest.push(...await uploadDirToGCS(v.wikiDir, `${prefix}/vaults/${d}/wiki`, token));
          manifest.push(...await uploadDirToGCS(v.rawDir, `${prefix}/vaults/${d}/raw`, token));
        }
      }
    }

    for (const [name, path] of [[".wiki-config.json", CONFIG_FILE], [".wiki-queue.json", QUEUE_FILE]] as const) {
      try {
        const content = await readFile(path, "utf-8");
        await uploadToGCS(`${prefix}/${name}`, content, token);
        manifest.push(`${prefix}/${name}`);
      } catch {}
    }

    await uploadToGCS(`${prefix}/manifest.json`, JSON.stringify({ timestamp: ts, files: manifest }, null, 2), token);

    backupStatus = {
      lastBackup: new Date().toISOString(),
      lastLabel: ts,
      filesUploaded: manifest.length,
      inProgress: false,
      error: null,
    };
  } catch (err: any) {
    backupStatus.inProgress = false;
    backupStatus.error = err.message;
    throw err;
  }
}
