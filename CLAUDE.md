# LLM Wiki

A personal knowledge base maintained by an LLM. The human curates sources, asks questions, and directs analysis. The LLM writes and maintains all wiki pages.

## Directory Structure

```
raw/            # Raw sources — immutable, never modify. Read only.
raw/assets/     # Images and attachments referenced by sources
wiki/           # LLM-owned markdown pages. Create, update, delete freely.
wiki/index.md   # Content catalog — all pages listed with summaries
wiki/log.md     # Chronological activity log
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

## Workflows

### Ingest

Triggered when the user adds a source to `raw/` and asks to ingest it.

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
