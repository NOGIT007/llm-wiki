import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const WIKI_DIR = join(import.meta.dir, "wiki");
const RAW_DIR = join(import.meta.dir, "raw");
const CONFIG_FILE = join(import.meta.dir, ".wiki-config.json");
const QUEUE_FILE = join(import.meta.dir, ".wiki-queue.json");
const NO_CACHE = {
  "cache-control": "no-store, no-cache, must-revalidate",
  "pragma": "no-cache",
};

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

async function loadWiki(): Promise<Map<string, WikiPage>> {
  const pages = new Map<string, WikiPage>();
  const files = await readdir(WIKI_DIR);

  for (const file of files) {
    if (!file.endsWith(".md") || file === "index.md" || file === "log.md")
      continue;

    const raw = await readFile(join(WIKI_DIR, file), "utf-8");
    const slug = file.replace(/\.md$/, "");
    const { meta, content } = parseFrontmatter(raw);
    const links = extractWikilinks(content);

    if (Array.isArray(meta.sources)) {
      for (const s of meta.sources) {
        const srcLinks = extractWikilinks(s);
        links.push(...srcLinks);
      }
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

  return pages;
}

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
    if (score > 0) results.push({ slug, title: page.title, type: page.type, score });
  }

  return results.sort((a, b) => b.score - a.score);
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
      const list = [...pages.values()].map(({ slug, title, type, tags }) => ({
        slug, title, type, tags,
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

      return Response.json({
        raw: {
          total: rawFiles.length,
          ingested: ingestedList,
          pending: pendingRaw,
        },
        wiki: {
          totalPages: pages.size,
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

    // ── Chat endpoint (uses Claude CLI) ──
    if (url.pathname === "/api/chat" && req.method === "POST") {
      const body = await req.json() as { message: string };
      if (!body.message) {
        return Response.json({ error: "No message provided" }, { status: 400 });
      }

      // Search wiki for relevant context
      const results = searchPages(body.message);
      const topSlugs = results.slice(0, 8).map(r => r.slug);

      const words = body.message.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      for (const word of words) {
        for (const r of searchPages(word)) {
          if (!topSlugs.includes(r.slug) && topSlugs.length < 12) {
            topSlugs.push(r.slug);
          }
        }
      }

      let context = "";
      for (const slug of topSlugs) {
        const page = pages.get(slug);
        if (!page) continue;
        context += `\n---\n## [[${page.title}]] (${page.type})\n${page.content.slice(0, 1500)}\n`;
      }

      const prompt = `You are a wiki assistant. Answer using ONLY the wiki context below. Use [[Page Title]] wikilinks when citing pages. Be concise. If the answer isn't in the wiki, say so.

## Wiki Context (${topSlugs.length} pages)
${context}

## Question
${body.message}`;

      try {
        const proc = Bun.spawn(["claude", "-p", prompt], {
          cwd: import.meta.dir,
          stdout: "pipe",
          stderr: "pipe",
        });

        const output = await new Response(proc.stdout).text();
        const exitCode = await proc.exited;

        if (exitCode !== 0) {
          const errOut = await new Response(proc.stderr).text();
          return Response.json({ error: errOut || "Claude CLI failed" }, { status: 500 });
        }

        return Response.json({ answer: output.trim(), sources: topSlugs }, { headers: NO_CACHE });
      } catch (err: any) {
        return Response.json({ error: `Claude CLI not found or failed: ${err.message}` }, { status: 500 });
      }
    }

    // ── Backup (git push via PR) ──
    if (url.pathname === "/api/backup" && req.method === "POST") {
      const body = (await req.json().catch(() => ({}))) as { message?: string };
      const msg = body.message || "Wiki backup";
      const branch = `backup/${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36)}`;
      const cwd = import.meta.dir;

      const run = async (cmd: string[]) => {
        const p = Bun.spawn(cmd, { cwd, stdout: "pipe", stderr: "pipe" });
        const out = await new Response(p.stdout).text();
        const err = await new Response(p.stderr).text();
        const code = await p.exited;
        if (code !== 0) throw new Error(err || out || `Exit code ${code}`);
        return out.trim();
      };

      try {
        // Check if there are changes
        const status = await run(["git", "status", "--porcelain"]);
        if (!status) {
          return Response.json({ ok: true, message: "Nothing to backup — no changes" }, { headers: NO_CACHE });
        }

        // Create branch, commit, push, PR
        await run(["git", "checkout", "-b", branch]);
        await run(["git", "add", "-A"]);
        await run(["git", "commit", "-m", msg]);
        await run(["git", "push", "-u", "origin", branch]);

        let prUrl = "";
        try {
          prUrl = await run(["gh", "pr", "create", "--title", msg, "--body", `Automated wiki backup\n\n${status}`, "--base", "main"]);
        } catch (e: any) {
          // PR creation failed but push succeeded
          prUrl = e.message;
        }

        // Return to main
        await run(["git", "checkout", "main"]);

        return Response.json({ ok: true, branch, prUrl, changes: status.split("\n").length }, { headers: NO_CACHE });
      } catch (err: any) {
        // Try to get back to main on error
        try { await run(["git", "checkout", "main"]); } catch {}
        return Response.json({ error: err.message }, { status: 500 });
      }
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

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Wiki server running at http://localhost:${server.port}`);
