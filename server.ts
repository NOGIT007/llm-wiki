import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { CONFIG_FILE, QUEUE_FILE, PUBLIC_DIR, NO_CACHE } from "./src/paths";
import { resolveVault, sanitizeVaultName, loadVault, vaultPages, hiddenVaults, saveHiddenVaults, getPages, reloadAllVaults, reloadIfNeeded, listVaults } from "./src/vaults";
import { buildGraphData, searchPages } from "./src/search";
import { gatherChatContext, callLLM, isModelAvailable, getAvailableModels, WIKI_CHAT_SYSTEM_PROMPT } from "./src/chat";
import { backupStatus, runBackup, GCS_BUCKET } from "./src/backup";
import { withFileLock } from "./src/filelock";

// Initial load
await reloadAllVaults();

// MIME types for static file serving
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const server = Bun.serve({
  port: 5000,
  async fetch(req) {
    const url = new URL(req.url);
    const vaultParam = url.searchParams.get("vault");
    const vault = resolveVault(vaultParam);

    // ── Static file serving ──
    if (url.pathname === "/") {
      const html = await readFile(join(PUBLIC_DIR, "index.html"), "utf-8");
      return new Response(html, { headers: { "content-type": "text/html", ...NO_CACHE } });
    }

    if (url.pathname === "/architecture") {
      const html = await readFile(join(PUBLIC_DIR, "architecture.html"), "utf-8");
      return new Response(html, { headers: { "content-type": "text/html", ...NO_CACHE } });
    }

    // Serve static assets (CSS, JS, images)
    if (url.pathname.startsWith("/js/") || url.pathname.endsWith(".css") || url.pathname.endsWith(".svg")) {
      const filePath = join(PUBLIC_DIR, url.pathname);
      if (existsSync(filePath)) {
        const ext = url.pathname.substring(url.pathname.lastIndexOf("."));
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        const content = await readFile(filePath, "utf-8");
        return new Response(content, { headers: { "content-type": contentType, ...NO_CACHE } });
      }
    }

    // ── Vault management ──
    if (url.pathname === "/api/vaults" && req.method === "GET") {
      return Response.json(await listVaults(), { headers: NO_CACHE });
    }

    if (url.pathname === "/api/vaults" && req.method === "POST") {
      const { name } = await req.json() as { name: string };
      if (!name?.trim()) return Response.json({ error: "Name is required" }, { status: 400, headers: NO_CACHE });
      const safeName = sanitizeVaultName(name);
      if (!safeName || safeName === "default") return Response.json({ error: "Cannot create vault named 'default'" }, { status: 400, headers: NO_CACHE });
      const v = resolveVault(safeName);
      if (hiddenVaults.has(safeName) && existsSync(v.wikiDir)) {
        hiddenVaults.delete(safeName);
        await saveHiddenVaults();
        vaultPages.set(safeName, await loadVault(v));
        return Response.json({ ok: true, name: safeName }, { headers: NO_CACHE });
      }
      if (existsSync(v.wikiDir)) return Response.json({ error: "Vault already exists" }, { status: 409, headers: NO_CACHE });
      await mkdir(v.wikiDir, { recursive: true });
      await mkdir(v.rawDir, { recursive: true });
      const today = new Date().toISOString().slice(0, 10);
      await writeFile(join(v.wikiDir, "index.md"), `---\ntitle: Index\ntype: index\ncreated: ${today}\nupdated: ${today}\ntags: []\nsources: []\n---\n\n# ${safeName}\n\nWiki index for the ${safeName} vault.\n`);
      await writeFile(join(v.wikiDir, "log.md"), `---\ntitle: Log\ntype: log\ncreated: ${today}\nupdated: ${today}\ntags: []\nsources: []\n---\n\n# Activity Log\n`);
      vaultPages.set(safeName, await loadVault(v));
      return Response.json({ ok: true, name: safeName }, { headers: NO_CACHE });
    }

    if (url.pathname.startsWith("/api/vaults/") && req.method === "DELETE") {
      const rawName = url.pathname.replace("/api/vaults/", "");
      const name = sanitizeVaultName(rawName);
      if (!name || name === "default") return Response.json({ error: "Cannot delete default vault" }, { status: 400, headers: NO_CACHE });
      const v = resolveVault(name);
      if (!existsSync(v.wikiDir)) return Response.json({ error: "Vault not found" }, { status: 404, headers: NO_CACHE });
      vaultPages.delete(name);
      hiddenVaults.add(name);
      await saveHiddenVaults();
      return Response.json({ ok: true, name }, { headers: NO_CACHE });
    }

    // ── Reload & Status ──
    if (url.pathname === "/api/reload") {
      await reloadAllVaults();
      return Response.json({ ok: true, pages: getPages(vaultParam).size, reloaded: new Date().toISOString() }, { headers: NO_CACHE });
    }

    if (url.pathname === "/api/status") {
      const totalPages = [...vaultPages.values()].reduce((sum, m) => sum + m.size, 0);
      const perVault: Record<string, number> = {};
      for (const [name, pages] of vaultPages) {
        if (!hiddenVaults.has(name)) perVault[name] = pages.size;
      }
      return Response.json({
        ok: true, pages: totalPages, perVault,
        vaults: vaultPages.size,
        uptime: Math.floor(process.uptime()),
        lastLoad: new Date().toISOString(),
      }, { headers: NO_CACHE });
    }

    // Auto-reload periodically
    await reloadIfNeeded();
    const pages = getPages(vaultParam);

    // ── Data endpoints ──
    if (url.pathname === "/api/graph") {
      return Response.json(buildGraphData(pages), { headers: NO_CACHE });
    }

    if (url.pathname === "/api/pages") {
      const list = [...pages.values()].map(({ slug, title, type, tags }) => ({ slug, title, type, tags }));
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
      return Response.json(searchPages(q, pages), { headers: NO_CACHE });
    }

    // ── Wiki health ──
    if (url.pathname === "/api/wiki/health") {
      const rawDir = vault.rawDir;
      const rawFiles = (await readdir(rawDir).catch(() => [] as string[])).filter(f => f.endsWith(".md")).sort();

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

      const slugSet = new Set(pages.keys());
      const brokenLinks: { from: string; to: string }[] = [];
      for (const [slug, page] of pages) {
        for (const link of page.links) {
          if (!slugSet.has(link)) brokenLinks.push({ from: slug, to: link });
        }
      }

      const inbound = new Set<string>();
      for (const [, page] of pages) { for (const link of page.links) inbound.add(link); }
      const orphans = [...pages.keys()].filter(s => !inbound.has(s));

      const typeCounts: Record<string, number> = {};
      for (const page of pages.values()) { typeCounts[page.type] = (typeCounts[page.type] || 0) + 1; }

      return Response.json({
        raw: { total: rawFiles.length, ingested: ingestedList, pending: pendingRaw },
        wiki: { totalPages: pages.size, typeCounts, brokenLinks, orphans },
      }, { headers: NO_CACHE });
    }

    // ── Config ──
    if (url.pathname === "/api/config" && req.method === "GET") {
      try {
        return Response.json(JSON.parse(await readFile(CONFIG_FILE, "utf-8")), { headers: NO_CACHE });
      } catch {
        return Response.json({ autoIngest: false }, { headers: NO_CACHE });
      }
    }

    if (url.pathname === "/api/config" && req.method === "POST") {
      const body = await req.json() as Record<string, any>;
      return withFileLock(async () => {
        let config: Record<string, any> = {};
        try { config = JSON.parse(await readFile(CONFIG_FILE, "utf-8")); } catch {}
        Object.assign(config, body);
        await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
        return Response.json({ ok: true, config }, { headers: NO_CACHE });
      });
    }

    // ── Queue ──
    if (url.pathname === "/api/queue" && req.method === "GET") {
      try {
        return Response.json(JSON.parse(await readFile(QUEUE_FILE, "utf-8")), { headers: NO_CACHE });
      } catch {
        return Response.json([], { headers: NO_CACHE });
      }
    }

    if (url.pathname === "/api/queue" && req.method === "POST") {
      const item = await req.json() as { action: string; target?: string; vault?: string; timestamp?: string };
      item.timestamp = new Date().toISOString();
      if (!item.vault) item.vault = vaultParam || undefined;
      return withFileLock(async () => {
        let queue: any[] = [];
        try { queue = JSON.parse(await readFile(QUEUE_FILE, "utf-8")); } catch {}
        const exists = queue.some(q => q.action === item.action && q.target === item.target && (q.vault || "default") === (item.vault || "default"));
        if (!exists) {
          queue.push(item);
          await writeFile(QUEUE_FILE, JSON.stringify(queue, null, 2), "utf-8");
        }
        return Response.json({ ok: true, queue }, { headers: NO_CACHE });
      });
    }

    if (url.pathname === "/api/queue" && req.method === "DELETE") {
      await writeFile(QUEUE_FILE, "[]", "utf-8");
      return Response.json({ ok: true }, { headers: NO_CACHE });
    }

    // ── Raw sources ──
    if (url.pathname === "/api/raw" && req.method === "GET") {
      const rawDir = vault.rawDir;
      const files = await readdir(rawDir).catch(() => [] as string[]);
      return Response.json(files.filter(f => f.endsWith(".md")).sort(), { headers: NO_CACHE });
    }

    if (url.pathname === "/api/raw" && req.method === "POST") {
      const rawDir = vault.rawDir;
      if (!existsSync(rawDir)) await mkdir(rawDir, { recursive: true });
      const contentType = req.headers.get("content-type") || "";

      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        if (!file) return Response.json({ error: "No file provided" }, { status: 400 });
        const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
        await writeFile(join(rawDir, filename), await file.text(), "utf-8");
        return Response.json({ ok: true, filename }, { headers: NO_CACHE });
      }

      const body = await req.json() as { filename?: string; content?: string; url?: string };

      if (body.url) {
        try {
          const parsed = new URL(body.url);
          if (!["http:", "https:"].includes(parsed.protocol)) {
            return Response.json({ error: "Only http and https URLs are allowed" }, { status: 400 });
          }
          const host = parsed.hostname.toLowerCase();
          if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1"
            || host.startsWith("10.") || host.startsWith("192.168.")
            || /^172\.(1[6-9]|2\d|3[01])\./.test(host) || host.endsWith(".local")
            || host === "169.254.169.254" || host.startsWith("169.254.")) {
            return Response.json({ error: "URLs pointing to private/internal addresses are not allowed" }, { status: 400 });
          }
          const res = await fetch(body.url);
          if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
          const text = await res.text();
          const slug = (body.filename || body.url)
            .replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9-]/g, "-")
            .replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase().slice(0, 80);
          await writeFile(join(rawDir, `${slug}.md`), text, "utf-8");
          return Response.json({ ok: true, filename: `${slug}.md` }, { headers: NO_CACHE });
        } catch (err: any) {
          return Response.json({ error: err.message }, { status: 400 });
        }
      }

      if (body.content && body.filename) {
        const filename = body.filename
          .replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase()
          .replace(/-+/g, "-").replace(/^-|-$/g, "");
        const safeName = filename.endsWith(".md") ? filename : `${filename}.md`;
        await writeFile(join(rawDir, safeName), body.content, "utf-8");
        return Response.json({ ok: true, filename: safeName }, { headers: NO_CACHE });
      }

      return Response.json({ error: "Missing content or filename" }, { status: 400 });
    }

    // ── Chat ──
    if (url.pathname === "/api/chat/models") {
      let config: any = {};
      try { config = JSON.parse(await readFile(CONFIG_FILE, "utf-8")); } catch {}
      return Response.json({ models: getAvailableModels(), default: config.chatModel || "mistral" }, { headers: NO_CACHE });
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

        if (!isModelAvailable(model)) {
          return Response.json({ error: `No API key configured for ${model}` }, { status: 400, headers: NO_CACHE });
        }

        const { context, sources } = gatherChatContext(message, getPages(vaultParam));
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

    // ── Backup ──
    if (url.pathname === "/api/backup/status") {
      return Response.json({ ...backupStatus, bucket: GCS_BUCKET || null }, { headers: NO_CACHE });
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

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Wiki server running at http://localhost:${server.port}`);
