import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import type { Subprocess } from "bun";

const BASE = "http://localhost:5000";

let serverProc: Subprocess;

beforeAll(async () => {
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env },
  });
  // Wait for server to be ready
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${BASE}/api/status`);
      if (res.ok) break;
    } catch {}
    await Bun.sleep(200);
  }
});

afterAll(() => {
  serverProc?.kill();
});

// ── Core API tests ──

describe("Core API", () => {
  test("GET /api/status returns ok", async () => {
    const res = await fetch(`${BASE}/api/status`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.pages).toBeGreaterThan(0);
  });

  test("GET / serves HTML", async () => {
    const res = await fetch(BASE);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
  });

  test("GET /api/pages returns page list", async () => {
    const res = await fetch(`${BASE}/api/pages`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    // Each page should have vault field
    for (const page of data.slice(0, 5)) {
      expect(page).toHaveProperty("slug");
      expect(page).toHaveProperty("title");
      expect(page).toHaveProperty("type");
      expect(page).toHaveProperty("vault");
      expect(typeof page.vault).toBe("boolean");
    }
  });

  test("GET /api/graph returns nodes and edges", async () => {
    const res = await fetch(`${BASE}/api/graph`);
    const data = await res.json();
    expect(data).toHaveProperty("nodes");
    expect(data).toHaveProperty("edges");
    expect(data.nodes.length).toBeGreaterThan(0);
    // Graph nodes should include vault field
    expect(data.nodes[0]).toHaveProperty("vault");
  });

  test("GET /api/search returns results", async () => {
    const res = await fetch(`${BASE}/api/search?q=claude`);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("vault");
  });

  test("GET /api/page/:slug returns page with vault field", async () => {
    const res = await fetch(`${BASE}/api/page/claude`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.slug).toBe("claude");
    expect(data).toHaveProperty("vault");
    expect(data.vault).toBe(false);
  });

  test("GET /api/page/:slug 404 for missing page", async () => {
    const res = await fetch(`${BASE}/api/page/nonexistent-page-xyz`);
    expect(res.status).toBe(404);
  });
});

// ── Config API tests ──

describe("Config API", () => {
  test("GET /api/config returns config", async () => {
    const res = await fetch(`${BASE}/api/config`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(typeof data).toBe("object");
  });

  test("POST /api/config updates config", async () => {
    const res = await fetch(`${BASE}/api/config`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chatModel: "mistral" }),
    });
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.config.chatModel).toBe("mistral");
  });
});

// ── Chat models endpoint ──

describe("Chat API", () => {
  test("GET /api/chat/models returns available models", async () => {
    const res = await fetch(`${BASE}/api/chat/models`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(data.models)).toBe(true);
    expect(data).toHaveProperty("default");
    // Each model has id and label
    for (const m of data.models) {
      expect(m).toHaveProperty("id");
      expect(m).toHaveProperty("label");
    }
  });

  test("POST /api/chat rejects empty message", async () => {
    const res = await fetch(`${BASE}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "" }),
    });
    expect(res.status).toBe(400);
  });

  test("POST /api/chat rejects unknown model", async () => {
    const res = await fetch(`${BASE}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "test", model: "gpt-99" }),
    });
    // Should fail with 500 (unknown model hits callLLM default which is mistral, or error)
    const data = await res.json();
    // If gpt-99 has no key it returns 400, otherwise 500
    expect([400, 500]).toContain(res.status);
  });
});

// ── Wiki health ──

describe("Wiki Health", () => {
  test("GET /api/wiki/health includes vaultCount", async () => {
    const res = await fetch(`${BASE}/api/wiki/health`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.wiki).toHaveProperty("vaultCount");
    expect(typeof data.wiki.vaultCount).toBe("number");
    expect(data.raw).toHaveProperty("total");
    expect(data.raw).toHaveProperty("pending");
  });
});

// ── Backup status ──

describe("Backup API", () => {
  test("GET /api/backup/status returns status", async () => {
    const res = await fetch(`${BASE}/api/backup/status`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty("lastBackup");
    expect(data).toHaveProperty("inProgress");
    expect(data.inProgress).toBe(false);
  });
});

// ── Vault move ──

describe("Vault API", () => {
  test("POST /api/vault/move 404 for nonexistent page", async () => {
    const res = await fetch(`${BASE}/api/vault/move`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug: "nonexistent-xyz" }),
    });
    expect(res.status).toBe(404);
  });
});

// ── Queue API ──

describe("Queue API", () => {
  test("GET /api/queue returns array", async () => {
    const res = await fetch(`${BASE}/api/queue`);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("POST then DELETE /api/queue works", async () => {
    await fetch(`${BASE}/api/queue`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "test-action", target: "test" }),
    });
    const before = await fetch(`${BASE}/api/queue`).then(r => r.json());
    expect(before.length).toBeGreaterThan(0);

    await fetch(`${BASE}/api/queue`, { method: "DELETE" });
    const after = await fetch(`${BASE}/api/queue`).then(r => r.json());
    expect(after.length).toBe(0);
  });
});
