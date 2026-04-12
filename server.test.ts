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
  for (let i = 0; i < 30; i++) {
    if (serverProc.exitCode !== null) throw new Error("Server process exited during startup");
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
    for (const page of data.slice(0, 3)) {
      expect(page).toHaveProperty("slug");
      expect(page).toHaveProperty("title");
      expect(page).toHaveProperty("type");
    }
  });

  test("GET /api/graph returns nodes and edges", async () => {
    const res = await fetch(`${BASE}/api/graph`);
    const data = await res.json();
    expect(data).toHaveProperty("nodes");
    expect(data).toHaveProperty("edges");
    expect(data.nodes.length).toBeGreaterThan(0);
  });

  test("GET /api/search returns results", async () => {
    const res = await fetch(`${BASE}/api/search?q=claude`);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test("GET /api/page/:slug returns page", async () => {
    const res = await fetch(`${BASE}/api/page/claude`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.slug).toBe("claude");
  });

  test("GET /api/page/:slug 404 for missing page", async () => {
    const res = await fetch(`${BASE}/api/page/nonexistent-page-xyz`);
    expect(res.status).toBe(404);
  });
});

// ── Vaults API ──

describe("Vaults API", () => {
  test("GET /api/vaults returns array with default", async () => {
    const res = await fetch(`${BASE}/api/vaults`);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toContain("default");
  });

  test("POST /api/vaults creates new vault", async () => {
    const res = await fetch(`${BASE}/api/vaults`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "test-vault" }),
    });
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.name).toBe("test-vault");
    // Verify it appears in list
    const list = await fetch(`${BASE}/api/vaults`).then(r => r.json());
    expect(list).toContain("test-vault");
  });

  test("POST /api/vaults rejects 'default' name", async () => {
    const res = await fetch(`${BASE}/api/vaults`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "default" }),
    });
    expect(res.status).toBe(400);
  });

  test("GET /api/pages?vault=default returns pages", async () => {
    const res = await fetch(`${BASE}/api/pages?vault=default`);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test("GET /api/pages?vault=test-vault returns empty for new vault", async () => {
    const res = await fetch(`${BASE}/api/pages?vault=test-vault`);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

  test("GET /api/graph?vault=test-vault returns empty graph", async () => {
    const res = await fetch(`${BASE}/api/graph?vault=test-vault`);
    const data = await res.json();
    expect(data.nodes.length).toBe(0);
    expect(data.edges.length).toBe(0);
  });

  test("DELETE /api/vaults/default is rejected", async () => {
    const res = await fetch(`${BASE}/api/vaults/default`, { method: "DELETE" });
    expect(res.status).toBe(400);
  });

  test("DELETE /api/vaults/test-vault removes from memory", async () => {
    const res = await fetch(`${BASE}/api/vaults/test-vault`, { method: "DELETE" });
    const data = await res.json();
    expect(data.ok).toBe(true);
  });
});

// ── Config API ──

describe("Config API", () => {
  test("GET /api/config returns config", async () => {
    const res = await fetch(`${BASE}/api/config`);
    expect(res.status).toBe(200);
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

// ── Chat API ──

describe("Chat API", () => {
  test("GET /api/chat/models returns available models", async () => {
    const res = await fetch(`${BASE}/api/chat/models`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(data.models)).toBe(true);
    expect(data).toHaveProperty("default");
  });

  test("POST /api/chat rejects empty message", async () => {
    const res = await fetch(`${BASE}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "" }),
    });
    expect(res.status).toBe(400);
  });
});

// ── Wiki health ──

describe("Wiki Health", () => {
  test("GET /api/wiki/health returns stats", async () => {
    const res = await fetch(`${BASE}/api/wiki/health`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.raw).toHaveProperty("total");
    expect(data.wiki).toHaveProperty("totalPages");
    expect(data.wiki).toHaveProperty("typeCounts");
  });
});

// ── Backup API ──

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
