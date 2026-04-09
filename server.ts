import { readdir, readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const WIKI_DIR = join(import.meta.dir, "wiki");
const RAW_DIR = join(import.meta.dir, "raw");
const VAULT_DIR = join(import.meta.dir, "vault");
const CONFIG_FILE = join(import.meta.dir, ".wiki-config.json");
const QUEUE_FILE = join(import.meta.dir, ".wiki-queue.json");
const NO_CACHE = {
  "cache-control": "no-store, no-cache, must-revalidate",
  "pragma": "no-cache",
};

// ── LLM Chat configuration ──
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

const WIKI_CHAT_SYSTEM_PROMPT = `You are a helpful assistant for a personal knowledge base wiki. Answer questions based on the provided wiki context. Cite pages using [[wikilinks]] format. Be concise and accurate. If the context doesn't contain enough information, say so honestly.`;

interface WikiPage {
  slug: string;
  title: string;
  type: string;
  created: string;
  updated: string;
  tags: string[];
  sources: string[];
  content: string;
  links: string[];
  vault: boolean;
}

function parseFrontmatter(raw: string): {
  meta: Record<string, any>;
  content: string;
} {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };

  const meta: Record<string, any> = {};
  let currentKey = "";
  let inArray = false;

  for (const line of match[1].split("\n")) {
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      if (value === "") {
        meta[key] = [];
        currentKey = key;
        inArray = true;
      } else {
        meta[key] = value.replace(/^["']|["']$/g, "");
        inArray = false;
      }
    } else if (inArray && line.match(/^\s+-\s+/)) {
      const val = line.replace(/^\s+-\s+/, "").replace(/^["']|["']$/g, "");
      meta[currentKey].push(val);
    }
  }

  return { meta, content: match[2] };
}

function extractWikilinks(text: string): string[] {
  const links = new Set<string>();
  const re = /\[\[([^\]]+)\]\]/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    // Support [[slug|alias]] — use the slug part (before |)
    const target = m[1].split("|")[0].trim();
    links.add(target.toLowerCase().replace(/\s+/g, "-"));
  }
  return [...links];
}

async function loadDir(dir: string, isVault: boolean, pages: Map<string, WikiPage>) {
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
      vault: isVault,
    });
  }
}

async function loadWiki(): Promise<Map<string, WikiPage>> {
  const pages = new Map<string, WikiPage>();
  await loadDir(WIKI_DIR, false, pages);
  await loadDir(VAULT_DIR, true, pages);
  return pages;
}

// Ensure vault directory exists
if (!existsSync(VAULT_DIR)) await mkdir(VAULT_DIR, { recursive: true });

// Mutable — reloaded on demand
let pages = await loadWiki();
let lastLoad = Date.now();

async function reloadIfNeeded() {
  // Reload wiki data every 5 seconds max
  if (Date.now() - lastLoad > 5000) {
    pages = await loadWiki();
    lastLoad = Date.now();
  }
}

function buildGraphData() {
  const nodes: { id: string; title: string; type: string; links: number }[] = [];
  const edges: { source: string; target: string }[] = [];
  const slugs = new Set(pages.keys());

  for (const [slug, page] of pages) {
    nodes.push({
      id: slug,
      title: page.title,
      type: page.type,
      links: page.links.length,
      vault: page.vault,
    });
    for (const link of page.links) {
      if (slugs.has(link) && link !== slug) {
        edges.push({ source: slug, target: link });
      }
    }
  }

  return { nodes, edges };
}

function searchPages(query: string) {
  const q = query.toLowerCase();
  const results: { slug: string; title: string; type: string; score: number }[] = [];

  for (const [slug, page] of pages) {
    let score = 0;
    if (page.title.toLowerCase().includes(q)) score += 10;
    if (slug.includes(q)) score += 5;
    if (page.tags.some((t) => t.includes(q))) score += 3;
    if (page.content.toLowerCase().includes(q)) score += 1;
    if (score > 0) results.push({ slug, title: page.title, type: page.type, score, vault: page.vault });
  }

  return results.sort((a, b) => b.score - a.score);
}

// ── LLM Chat helpers ──

function gatherChatContext(query: string): { context: string; sources: string[] } {
  const results = searchPages(query).slice(0, 5);
  const sources: string[] = [];
  const parts: string[] = [];
  let charBudget = 6000;

  for (const r of results) {
    const p = pages.get(r.slug);
    if (!p) continue;
    const text = `## [[${p.slug}]] — ${p.title}\n${p.content}`;
    if (parts.join('\n\n').length + text.length > charBudget) {
      const remaining = charBudget - parts.join('\n\n').length;
      if (remaining > 200) {
        parts.push(text.slice(0, remaining) + '\n...(truncated)');
        sources.push(p.slug);
      }
      break;
    }
    parts.push(text);
    sources.push(p.slug);
  }

  return { context: parts.join('\n\n'), sources };
}

async function callMistral(system: string, user: string): Promise<string> {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: { "authorization": `Bearer ${MISTRAL_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Mistral API error: ${res.status} ${await res.text()}`);
  const d = await res.json() as any;
  return d.choices[0].message.content;
}

async function callClaude(system: string, user: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API error: ${res.status} ${await res.text()}`);
  const d = await res.json() as any;
  return d.content[0].text;
}

async function callGemini(system: string, user: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [{ parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: 1024 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
  const d = await res.json() as any;
  return d.candidates[0].content.parts[0].text;
}

async function callLLM(model: string, system: string, user: string): Promise<string> {
  if (model === "claude") return callClaude(system, user);
  if (model === "gemini") return callGemini(system, user);
  return callMistral(system, user);
}

// ── GCP Cloud Storage Backup ──
const GCS_BUCKET = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || "";

interface BackupStatus {
  lastBackup: string | null;
  lastLabel: string | null;
  filesUploaded: number;
  inProgress: boolean;
  error: string | null;
}

let backupStatus: BackupStatus = {
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

async function runBackup(): Promise<void> {
  if (!GCS_BUCKET) throw new Error("GOOGLE_CLOUD_STORAGE_BUCKET not set");
  backupStatus.inProgress = true;
  backupStatus.error = null;
  try {
    const token = await getAccessToken();
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const prefix = `backups/${ts}`;
    const manifest: string[] = [];

    manifest.push(...await uploadDirToGCS(WIKI_DIR, `${prefix}/wiki`, token));
    manifest.push(...await uploadDirToGCS(VAULT_DIR, `${prefix}/vault`, token));
    manifest.push(...await uploadDirToGCS(RAW_DIR, `${prefix}/raw`, token));

    // Upload config files
    for (const [name, path] of [[".wiki-config.json", CONFIG_FILE], [".wiki-queue.json", QUEUE_FILE]] as const) {
      try {
        const content = await readFile(path, "utf-8");
        await uploadToGCS(`${prefix}/${name}`, content, token);
        manifest.push(`${prefix}/${name}`);
      } catch {}
    }

    // Write manifest
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

const server = Bun.serve({
  port: 5000,
  async fetch(req) {
    const url = new URL(req.url);

    // Serve HTML — always fresh from disk
    if (url.pathname === "/") {
      const html = await readFile(join(import.meta.dir, "public", "index.html"), "utf-8");
      return new Response(html, { headers: { "content-type": "text/html", ...NO_CACHE } });
    }

    if (url.pathname === "/architecture") {
      const html = await readFile(join(import.meta.dir, "public", "architecture.html"), "utf-8");
      return new Response(html, { headers: { "content-type": "text/html", ...NO_CACHE } });
    }

    // Reload wiki data endpoint — callable from browser
    if (url.pathname === "/api/reload") {
      pages = await loadWiki();
      lastLoad = Date.now();
      return Response.json({ ok: true, pages: pages.size, reloaded: new Date().toISOString() }, { headers: NO_CACHE });
    }

    // Server status
    if (url.pathname === "/api/status") {
      return Response.json({
        ok: true,
        pages: pages.size,
        uptime: Math.floor(process.uptime()),
        lastLoad: new Date(lastLoad).toISOString(),
      }, { headers: NO_CACHE });
    }

    // Auto-reload wiki data periodically
    await reloadIfNeeded();

    if (url.pathname === "/api/graph") {
      return Response.json(buildGraphData(), { headers: NO_CACHE });
    }

    if (url.pathname === "/api/pages") {
      const list = [...pages.values()].map(({ slug, title, type, tags, vault }) => ({
        slug, title, type, tags, vault,
      }));
      return Response.json(list, { headers: NO_CACHE });
    }

    if (url.pathname.startsWith("/api/page/")) {
      const slug = url.pathname.replace("/api/page/", "");
      const page = pages.get(slug);
      if (!page) return Response.json({ error: "Not found" }, { status: 404 });
      return Response.json(page, { headers: NO_CACHE });
    }

    if (url.pathname === "/api/search") {
      const q = url.searchParams.get("q") || "";
      return Response.json(searchPages(q), { headers: NO_CACHE });
    }

    // ── Wiki management endpoint ──
    if (url.pathname === "/api/wiki/health") {
      const rawFiles = (await readdir(RAW_DIR)).filter(f => f.endsWith(".md")).sort();

      // Build set of ingested raw filenames by scanning src-* pages' sources fields
      const ingestedRaw = new Set<string>();
      const srcPages: { slug: string; title: string; rawFile: string }[] = [];
      for (const [slug, page] of pages) {
        if (!slug.startsWith("src-")) continue;
        for (const src of page.sources) {
          const rawName = src.replace(/^raw\//, "").replace(/^\[\[|\]\]$/g, "");
          ingestedRaw.add(rawName);
          srcPages.push({ slug, title: page.title, rawFile: rawName });
        }
      }

      const pendingRaw = rawFiles.filter(f => !ingestedRaw.has(f));
      const ingestedList = rawFiles.filter(f => ingestedRaw.has(f)).map(f => {
        const src = srcPages.find(s => s.rawFile === f);
        return { rawFile: f, wikiSlug: src?.slug || null, wikiTitle: src?.title || null };
      });

      // Broken wikilinks: links pointing to non-existent pages
      const slugSet = new Set(pages.keys());
      const brokenLinks: { from: string; to: string }[] = [];
      for (const [slug, page] of pages) {
        for (const link of page.links) {
          if (!slugSet.has(link)) {
            brokenLinks.push({ from: slug, to: link });
          }
        }
      }

      // Orphan pages: pages with no inbound links
      const inbound = new Set<string>();
      for (const [slug, page] of pages) {
        for (const link of page.links) {
          inbound.add(link);
        }
      }
      const orphans = [...pages.keys()].filter(s => !inbound.has(s));

      // Type counts
      const typeCounts: Record<string, number> = {};
      for (const page of pages.values()) {
        typeCounts[page.type] = (typeCounts[page.type] || 0) + 1;
      }

      const vaultCount = [...pages.values()].filter(p => p.vault).length;

      return Response.json({
        raw: {
          total: rawFiles.length,
          ingested: ingestedList,
          pending: pendingRaw,
        },
        wiki: {
          totalPages: pages.size,
          vaultCount,
          typeCounts,
          brokenLinks,
          orphans,
        },
      }, { headers: NO_CACHE });
    }

    // ── Config endpoint (auto-ingest toggle) ──
    if (url.pathname === "/api/config" && req.method === "GET") {
      try {
        const raw = await readFile(CONFIG_FILE, "utf-8");
        return Response.json(JSON.parse(raw), { headers: NO_CACHE });
      } catch {
        return Response.json({ autoIngest: false }, { headers: NO_CACHE });
      }
    }

    if (url.pathname === "/api/config" && req.method === "POST") {
      const body = await req.json() as Record<string, any>;
      let config: Record<string, any> = {};
      try { config = JSON.parse(await readFile(CONFIG_FILE, "utf-8")); } catch {}
      Object.assign(config, body);
      await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
      return Response.json({ ok: true, config }, { headers: NO_CACHE });
    }

    // ── Queue endpoint (ingest/fix requests) ──
    if (url.pathname === "/api/queue" && req.method === "GET") {
      try {
        const raw = await readFile(QUEUE_FILE, "utf-8");
        return Response.json(JSON.parse(raw), { headers: NO_CACHE });
      } catch {
        return Response.json([], { headers: NO_CACHE });
      }
    }

    if (url.pathname === "/api/queue" && req.method === "POST") {
      const item = await req.json() as { action: string; target?: string; timestamp?: string };
      item.timestamp = new Date().toISOString();
      let queue: any[] = [];
      try { queue = JSON.parse(await readFile(QUEUE_FILE, "utf-8")); } catch {}
      // Deduplicate: don't add if same action+target already queued
      const exists = queue.some(q => q.action === item.action && q.target === item.target);
      if (!exists) {
        queue.push(item);
        await writeFile(QUEUE_FILE, JSON.stringify(queue, null, 2), "utf-8");
      }
      return Response.json({ ok: true, queue }, { headers: NO_CACHE });
    }

    if (url.pathname === "/api/queue" && req.method === "DELETE") {
      await writeFile(QUEUE_FILE, "[]", "utf-8");
      return Response.json({ ok: true }, { headers: NO_CACHE });
    }

    // ── Raw source endpoints ──

    // List raw files
    if (url.pathname === "/api/raw" && req.method === "GET") {
      const files = await readdir(RAW_DIR);
      const mdFiles = files.filter(f => f.endsWith(".md")).sort();
      return Response.json(mdFiles, { headers: NO_CACHE });
    }

    // Save raw source (paste, upload, or URL fetch)
    if (url.pathname === "/api/raw" && req.method === "POST") {
      const contentType = req.headers.get("content-type") || "";

      // Handle multipart file upload
      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        if (!file) {
          return Response.json({ error: "No file provided" }, { status: 400 });
        }

        const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
        const content = await file.text();
        const dest = join(RAW_DIR, filename);
        await writeFile(dest, content, "utf-8");
        return Response.json({ ok: true, filename }, { headers: NO_CACHE });
      }

      // Handle JSON body (paste or URL)
      const body = await req.json() as { filename?: string; content?: string; url?: string };

      // URL fetch mode
      if (body.url) {
        try {
          const res = await fetch(body.url);
          if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
          const text = await res.text();
          const slug = (body.filename || body.url)
            .replace(/^https?:\/\//, "")
            .replace(/[^a-zA-Z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")
            .toLowerCase()
            .slice(0, 80);
          const filename = `${slug}.md`;
          await writeFile(join(RAW_DIR, filename), text, "utf-8");
          return Response.json({ ok: true, filename }, { headers: NO_CACHE });
        } catch (err: any) {
          return Response.json({ error: err.message }, { status: 400 });
        }
      }

      // Paste mode
      if (body.content && body.filename) {
        const filename = body.filename
          .replace(/[^a-zA-Z0-9._-]/g, "-")
          .toLowerCase()
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
        const safeName = filename.endsWith(".md") ? filename : `${filename}.md`;
        await writeFile(join(RAW_DIR, safeName), body.content, "utf-8");
        return Response.json({ ok: true, filename: safeName }, { headers: NO_CACHE });
      }

      return Response.json({ error: "Missing content or filename" }, { status: 400 });
    }

    // ── Chat endpoints ──
    if (url.pathname === "/api/chat/models") {
      let config: any = {};
      try { config = JSON.parse(await readFile(CONFIG_FILE, "utf-8")); } catch {}
      const models: { id: string; label: string }[] = [];
      if (MISTRAL_API_KEY) models.push({ id: "mistral", label: "Mistral" });
      if (ANTHROPIC_API_KEY) models.push({ id: "claude", label: "Claude" });
      if (GEMINI_API_KEY) models.push({ id: "gemini", label: "Gemini" });
      return Response.json({ models, default: config.chatModel || "mistral" }, { headers: NO_CACHE });
    }

    if (url.pathname === "/api/chat" && req.method === "POST") {
      try {
        const { message, model: reqModel } = await req.json() as { message: string; model?: string };
        if (!message?.trim()) {
          return Response.json({ error: "Message is required" }, { status: 400, headers: NO_CACHE });
        }
        let config: any = {};
        try { config = JSON.parse(await readFile(CONFIG_FILE, "utf-8")); } catch {}
        const model = reqModel || config.chatModel || "mistral";

        const keyMap: Record<string, string> = { mistral: MISTRAL_API_KEY, claude: ANTHROPIC_API_KEY, gemini: GEMINI_API_KEY };
        if (!keyMap[model]) {
          return Response.json({ error: `No API key configured for ${model}` }, { status: 400, headers: NO_CACHE });
        }

        await reloadIfNeeded();
        const { context, sources } = gatherChatContext(message);
        const userPrompt = context
          ? `Wiki context:\n\n${context}\n\n---\nQuestion: ${message}`
          : `No relevant wiki pages found for context.\n\nQuestion: ${message}`;

        const answer = await callLLM(model, WIKI_CHAT_SYSTEM_PROMPT, userPrompt);
        return Response.json({ answer, sources, model }, { headers: NO_CACHE });
      } catch (err: any) {
        console.error("Chat error:", err);
        return Response.json({ error: `Chat failed: ${err.message}` }, { status: 500, headers: NO_CACHE });
      }
    }

    // ── Backup endpoints ──
    if (url.pathname === "/api/backup/status") {
      return Response.json(backupStatus, { headers: NO_CACHE });
    }

    if (url.pathname === "/api/backup" && req.method === "POST") {
      if (backupStatus.inProgress) {
        return Response.json({ error: "Backup already in progress" }, { status: 409, headers: NO_CACHE });
      }
      runBackup().catch(err => {
        console.error("Backup error:", err);
        backupStatus.error = err.message;
        backupStatus.inProgress = false;
      });
      return Response.json({ ok: true, message: "Backup started" }, { headers: NO_CACHE });
    }

    // ── Vault move endpoint ──
    if (url.pathname === "/api/vault/move" && req.method === "POST") {
      const { slug } = await req.json() as { slug: string };
      const page = pages.get(slug);
      if (!page) return Response.json({ error: "Not found" }, { status: 404, headers: NO_CACHE });
      const srcDir = page.vault ? VAULT_DIR : WIKI_DIR;
      const dstDir = page.vault ? WIKI_DIR : VAULT_DIR;
      await rename(join(srcDir, `${slug}.md`), join(dstDir, `${slug}.md`));
      pages = await loadWiki();
      lastLoad = Date.now();
      return Response.json({ ok: true, vault: !page.vault }, { headers: NO_CACHE });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Wiki server running at http://localhost:${server.port}`);
