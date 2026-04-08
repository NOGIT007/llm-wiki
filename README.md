# LLM Wiki

A personal knowledge base maintained by an LLM. The human curates sources, asks questions, and directs analysis. The LLM writes and maintains all wiki pages.

## Quick Start

```bash
# Start the server
./wiki.sh start

# Open in browser
open http://localhost:5000
```

## How It Works

1. **Add sources** to `raw/` (markdown, PDF, pasted text) via the UI or file system
2. **Claude ingests** them — creating summary pages, entity pages, and concept pages in `wiki/`
3. **Browse** the knowledge graph, search pages, and track wiki health in the Manage view

## UI Views

| View | What it does |
|------|-------------|
| **Graph** | Interactive knowledge graph — nodes are pages, edges are wikilinks |
| **Page** | Read wiki pages with rendered markdown and backlinks |
| **Manage** | Source ingestion status, wiki health, action queue, auto-ingest toggle |

## Adding Sources

Three ways via the **+ Add Source** button:

- **Paste** — paste markdown/text directly with a filename
- **Upload** — drag & drop `.md`, `.txt`, or `.pdf` files
- **URL** — fetch content from a URL

Sources land in `raw/` and are automatically queued for ingestion.

## Server Control

```bash
./wiki.sh start     # Start server on port 5000
./wiki.sh stop      # Stop server
./wiki.sh restart   # Restart server
./wiki.sh status    # Check if running
```

## Directory Structure

```
raw/            # Raw sources (immutable, human-curated)
wiki/           # LLM-maintained markdown pages
wiki/index.md   # Content catalog
wiki/log.md     # Activity log
public/         # Web UI (single HTML file)
server.ts       # Bun HTTP server
wiki.sh         # Server control script
```

## Development

Requires [Bun](https://bun.sh/) runtime.

```bash
bun run server.ts   # Run server directly
```

## Version

See [CHANGELOG.md](CHANGELOG.md) for release history.
