import { searchPages } from "./search";
import type { WikiPage } from "./types";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

// Claude chat uses the `claude` CLI subprocess (no API key needed)
export const CLAUDE_CLI_AVAILABLE = (() => {
  try { return Bun.spawnSync(["which", "claude"]).exitCode === 0; } catch { return false; }
})();

export const WIKI_CHAT_SYSTEM_PROMPT = `You are a helpful assistant for a personal knowledge base wiki. Answer questions based on the provided wiki context. Cite pages using [[wikilinks]] format. Be concise and accurate. If the context doesn't contain enough information, say so honestly.`;

export function gatherChatContext(query: string, pages: Map<string, WikiPage>): { context: string; sources: string[] } {
  const allResults = searchPages(query, pages);
  const seen = new Set(allResults.map(r => r.slug));
  const stopwords = new Set(["what","is","the","a","an","and","or","for","are","but","not","you","all","can","was","one","how","which","their","will","each","about","with","this","that","from","have","been","does","do","where","when","why","who"]);
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length >= 3 && !stopwords.has(w.replace(/[?.,!]/g, "")));
  for (const word of words) {
    for (const r of searchPages(word.replace(/[?.,!]/g, ""), pages)) {
      if (!seen.has(r.slug)) { seen.add(r.slug); allResults.push(r); }
    }
  }
  allResults.sort((a, b) => b.score - a.score);
  const results = allResults.slice(0, 5);
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
  const prompt = `${system}\n\n${user}`;
  const proc = Bun.spawn(["claude", "-p", prompt, "--output-format", "text"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const output = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    const errText = await new Response(proc.stderr).text();
    throw new Error(`Claude CLI error: ${errText || `exit code ${exitCode}`}`);
  }
  return output.trim();
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

export async function callLLM(model: string, system: string, user: string): Promise<string> {
  if (model === "claude") return callClaude(system, user);
  if (model === "gemini") return callGemini(system, user);
  return callMistral(system, user);
}

export function isModelAvailable(model: string): boolean {
  const map: Record<string, boolean> = {
    mistral: !!MISTRAL_API_KEY,
    claude: CLAUDE_CLI_AVAILABLE,
    gemini: !!GEMINI_API_KEY,
  };
  return !!map[model];
}

export function getAvailableModels(): { id: string; label: string }[] {
  const models: { id: string; label: string }[] = [];
  if (MISTRAL_API_KEY) models.push({ id: "mistral", label: "Mistral" });
  if (CLAUDE_CLI_AVAILABLE) models.push({ id: "claude", label: "Claude" });
  if (GEMINI_API_KEY) models.push({ id: "gemini", label: "Gemini" });
  return models;
}
