# LLM Wiki

A personal knowledge base maintained by an LLM. The human curates sources, asks questions, and directs analysis. The LLM writes and maintains all wiki pages.

## Directory Structure

```
server.ts         # HTTP router — imports modules from src/
src/              # Server modules (types, vaults, search, chat, backup, frontmatter, filelock, paths)
public/
  index.html      # Slim HTML shell
  styles.css      # All CSS
  js/             # JS modules (state, vault, search, keyboard, sidebar, views, page, graph, chat, manage, status, modal)
  architecture.html
raw/              # Raw sources — immutable, never modify. Read only.
wiki/             # LLM-owned markdown pages. Create, update, delete freely.
wiki/index.md     # Content catalog — all pages listed with summaries
wiki/log.md       # Chronological activity log
vaults/           # Additional vaults — gitignored. Each vault has its own wiki/ and raw/.
```

## Page Format

Every wiki page uses YAML frontmatter:

```yaml
---
title: Page Title
type: source | entity | concept | analysis | comparison
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources:
  - "[[src-filename]]"
tags:
  - tag1
  - tag2
---
```

- Use Obsidian-style `[[wikilinks]]` for cross-references
- Filenames: kebab-case (e.g. `machine-learning.md`)
- Source summaries: `src-<slug>.md` (e.g. `src-attention-is-all-you-need.md`)
- Every page should link to related pages — no orphans

## Server & UI

- Setup: `bun install`
- Server: `bun run server.ts` (port 5000), control via `./wiki.sh start|stop|restart|status`
- UI: `http://localhost:5000` — Graph, Page, Chat, and Manage views
- Add Source: UI modal (paste, upload, URL) saves to `raw/` and auto-queues ingestion

### Chat

The Chat view queries the wiki via LLM. Model selection (Mistral default, Claude, Gemini) is in the chat input bar. Preference saved to `.wiki-config.json` as `chatModel`. Claude uses the `claude` CLI as a subprocess — no API key needed. Mistral and Gemini use API keys from `.env`.

### Vaults

Obsidian-style multi-vault support. The default vault is `wiki/` + `raw/`. Additional vaults live under `vaults/{name}/wiki/` + `vaults/{name}/raw/` (gitignored). Create vaults from Manage view or `POST /api/vaults`. Switch vaults via the header dropdown. All API endpoints accept `?vault=name` to scope to a specific vault.

### Backup

`POST /api/backup` uploads wiki/, vault/, raw/, and config files to GCS (`backups/{timestamp}/`). Bucket configured via `GOOGLE_CLOUD_STORAGE_BUCKET` env var. Requires `gcloud auth application-default login`. Trigger from Manage view.

### Queue & Config Files

- `.wiki-queue.json` — pending actions queued from the UI (ingest requests, fix-issues)
- `.wiki-config.json` — settings (e.g. `autoIngest: true`, `chatModel: "mistral"`)

**On conversation start**, check the queue:
1. Read `.wiki-queue.json` — if it has items, process them
2. Read `.wiki-config.json` — if `autoIngest` is true, ingest any pending raw files
3. After processing, clear the queue via `DELETE /api/queue`

## Workflows

### Ingest

Triggered when the user adds a source to `raw/` and asks to ingest it, or when queued via the UI.

1. Read the source from `raw/`
2. Discuss key takeaways with the user
3. Create a summary page in `wiki/` (type: source, named `src-<slug>.md`)
4. For each significant entity or concept in the source:
   - If a wiki page exists: update it with new information, add source to frontmatter
   - If no page exists: create one
5. Add `[[wikilinks]]` across all affected pages (bidirectional where relevant)
6. Update `wiki/index.md` — add new pages, update summaries if needed
7. Append an entry to `wiki/log.md`

### Query

Triggered when the user asks a question about the wiki's knowledge.

1. Read `wiki/index.md` to find relevant pages
2. Read those pages and synthesize an answer
3. Cite sources with `[[wikilinks]]`
4. If the answer is substantial (comparison, analysis, deep synthesis):
   - Offer to file it as a new wiki page (type: analysis or comparison)
   - If filed: update index and log

### Lint

Triggered when the user asks to health-check the wiki.

1. Scan all wiki pages for:
   - Contradictions between pages
   - Stale claims superseded by newer sources
   - Orphan pages (no inbound links)
   - Concepts mentioned but lacking their own page
   - Missing cross-references
   - Data gaps that could be filled
2. Report findings to the user
3. Fix what can be fixed automatically (missing links, orphans)
4. Suggest new sources or questions to investigate
5. Append a lint entry to `wiki/log.md`

## Testing

- API tests: `bun test server.test.ts`
- UI tests: `npx playwright test` (requires server running on port 5000)

## Cross-Referencing Rules

- When creating or updating a page, scan the existing index for related pages and add links
- When a new entity or concept appears in multiple sources, it deserves its own page
- Prefer specific links (`[[src-paper-name]]`) over vague ones
- Keep bidirectional links: if A links to B, B should link back to A where relevant

## Conventions

- Write in clear, concise prose. Prefer structured sections with headers.
- Use bullet points for lists of facts; use prose for synthesis and analysis.
- When new information contradicts existing content, note the contradiction explicitly — don't silently overwrite.
- Dates in log entries and frontmatter use ISO 8601 (YYYY-MM-DD).
- The index is organized by type: Sources, Entities, Concepts, Analyses.
- Index entries: `- [[Page Name]] — one-line summary`
