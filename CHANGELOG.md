# Changelog

All notable changes to this project will be documented in this file.

---

## [0.10] — 2026-04-08

![v0.10](changelogs/v0.10-the-initial-commit-paradox.svg)

### The Initial Commit Paradox

The one where the wiki bootstraps itself from nothing into a fully functional knowledge graph.

### Added
- Wiki server (`server.ts`) with Bun runtime on port 5000
- Web UI with Graph, Page, and Manage views
- Knowledge graph visualization with physics simulation
- Command palette search (`/` or `Cmd+K`)
- Add Source modal (paste, upload, URL)
- Wiki Manager dashboard with health metrics
- Source ingestion status tracking (pending/done)
- Broken wikilink and orphan page detection
- Auto-ingest toggle and action queue system
- Queue/config API endpoints (`.wiki-queue.json`, `.wiki-config.json`)
- Server control script (`wiki.sh`)
- 32 raw sources ingested into 54 wiki pages
- Full cross-referencing with bidirectional wikilinks
