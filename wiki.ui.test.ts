import { test, expect } from "@playwright/test";

test.describe("Wiki UI", () => {
  test("loads homepage with header buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#app")).toBeVisible();
    await expect(page.locator("#btn-graph")).toBeVisible();
    await expect(page.locator("#btn-chat")).toBeVisible();
    await expect(page.locator("#btn-manage")).toBeVisible();
    await expect(page.locator("#status-dot")).toBeVisible();
  });

  test("sidebar loads pages from API", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".sidebar-item", { timeout: 10000 });
    const count = await page.locator(".sidebar-item").count();
    expect(count).toBeGreaterThan(0);
    await expect(page.locator(".sidebar-filter-btn").first()).toBeVisible();
  });

  test("clicking a sidebar item opens page view", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".sidebar-item", { timeout: 10000 });
    await page.locator(".sidebar-item").first().click();
    await expect(page.locator("#page-view")).toHaveClass(/active/);
    await expect(page.locator("#page-title")).not.toBeEmpty();
  });

  test("page view shows vault move button", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".sidebar-item", { timeout: 10000 });
    await page.locator(".sidebar-item").first().click();
    await expect(page.locator(".vault-move-btn")).toBeVisible();
    await expect(page.locator(".vault-move-btn")).toHaveText("Move to Vault");
  });

  test("sidebar search filters pages", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".sidebar-item", { timeout: 10000 });
    const countBefore = await page.locator(".sidebar-item").count();
    await page.locator("#sidebar-search").fill("claude");
    await page.waitForTimeout(300);
    const countAfter = await page.locator(".sidebar-item").count();
    expect(countAfter).toBeGreaterThan(0);
    expect(countAfter).toBeLessThanOrEqual(countBefore);
  });
});

test.describe("Chat UI", () => {
  test("chat view has model selector and input", async ({ page }) => {
    const modelsPromise = page.waitForResponse("**/api/chat/models");
    await page.goto("/");
    await page.locator("#btn-chat").click();
    await expect(page.locator("#chat-view")).toHaveClass(/active/);
    await modelsPromise;
    // Small delay for DOM update
    await page.waitForTimeout(200);
    await expect(page.locator("#chat-model-select")).toBeVisible();
    const options = page.locator("#chat-model-select option");
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
    await expect(page.locator("#chat-input")).toBeVisible();
    await expect(page.locator("#chat-ask-btn")).toBeVisible();
  });

  test("chat landing shows suggestion chips", async ({ page }) => {
    await page.goto("/");
    await page.locator("#btn-chat").click();
    await expect(page.locator("#chat-view")).toHaveClass(/active/);
    await expect(page.locator(".chat-chip").first()).toBeVisible();
  });

  test("model selector has known providers", async ({ page }) => {
    const modelsPromise = page.waitForResponse("**/api/chat/models");
    await page.goto("/");
    await page.locator("#btn-chat").click();
    await modelsPromise;
    await page.waitForTimeout(200);
    const options = await page.locator("#chat-model-select option").allTextContents();
    expect(options.length).toBeGreaterThan(0);
    const known = ["Mistral", "Claude", "Gemini"];
    expect(options.some(o => known.includes(o))).toBe(true);
  });
});

test.describe("Manage UI", () => {
  test("loads health cards including backup", async ({ page }) => {
    await page.goto("/");
    await page.locator("#btn-manage").click();
    await page.waitForSelector(".health-card", { timeout: 10000 });
    const count = await page.locator(".health-card").count();
    expect(count).toBeGreaterThanOrEqual(5);
    const text = await page.locator("#health-grid").innerText();
    expect(text.toLowerCase()).toContain("cloud backup");
  });

  test("has backup section with button", async ({ page }) => {
    await page.goto("/");
    await page.locator("#btn-manage").click();
    await page.waitForSelector(".health-card", { timeout: 10000 });
    await expect(page.locator("#section-backup")).toBeVisible();
    await expect(page.locator("#section-backup").getByText("Backup to GCS")).toBeVisible();
  });

  test("shows wiki pages card", async ({ page }) => {
    await page.goto("/");
    await page.locator("#btn-manage").click();
    await page.waitForSelector(".health-card", { timeout: 10000 });
    const text = await page.locator("#health-grid").innerText();
    expect(text.toLowerCase()).toContain("wiki pages");
  });
});

test.describe("Graph UI", () => {
  test("graph canvas is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#graph-canvas")).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("tab switching works", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#graph-view")).toHaveClass(/active/);

    await page.locator("#btn-chat").click();
    await expect(page.locator("#chat-view")).toHaveClass(/active/);

    await page.locator("#btn-manage").click();
    await expect(page.locator("#manage-view")).toHaveClass(/active/);

    await page.locator("#btn-graph").click();
    await expect(page.locator("#graph-view")).toHaveClass(/active/);
  });

  test("sidebar click opens page view", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".sidebar-item", { timeout: 10000 });
    await page.locator(".sidebar-item").first().click();
    await expect(page.locator("#page-view")).toHaveClass(/active/);
  });
});
