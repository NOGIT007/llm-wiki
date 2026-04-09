# LLM Wiki

A personal knowledge base maintained by an LLM. The human curates sources, asks questions, and directs analysis. The LLM writes and maintains all wiki pages.

## Quick Start

```bash
# Install dependencies
bun install

# Start the server
./wiki.sh start

# Open in browser
open http://localhost:5000
```

## How It Works

1. **Add sources** to `raw/` (markdown, PDF, pasted text) via the UI or file system
2. **Claude ingests** them — creating summary pages, entity pages, and concept pages in `wiki/`
3. **Browse** the knowledge graph, search pages, ask questions via chat, and manage wiki health

## Features

| Feature | Description |
|---------|-------------|
| **Graph** | Interactive knowledge graph — nodes are pages, edges are wikilinks |
| **Page** | Read wiki pages with rendered markdown and backlinks |
| **Chat** | Ask questions about your wiki — powered by Mistral, Claude, or Gemini |
| **Manage** | Source ingestion, wiki health, vault management, GCP backup |
| **Multi-vault** | Obsidian-style vaults — create and switch between independent knowledge bases |
| **Backup** | One-click backup to Google Cloud Storage |

## Adding Sources

Three ways via the **+ Add Source** button:

- **Paste** — paste markdown/text directly with a filename
- **Upload** — drag & drop `.md`, `.txt`, or `.pdf` files
- **URL** — fetch content from a URL

Sources land in `raw/` and are automatically queued for ingestion.

## LLM Chat

The Chat view queries your wiki using an LLM. Select your model (Mistral, Claude, or Gemini) from the dropdown. Configure API keys in `.env`:

```
MISTRAL_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
GEMINI_API_KEY=your-key
```

## Multi-Vault

Each vault is a self-contained knowledge base. The default vault uses `wiki/` + `raw/`. Create additional vaults from the Manage view — they live under `vaults/{name}/`.

## Server Control

```bash
./wiki.sh start     # Start server on port 5000
./wiki.sh stop      # Stop server
./wiki.sh restart   # Restart server
./wiki.sh status    # Check if running
```

## Directory Structure

```
wiki/             # Default vault pages (gitignored — local only)
raw/              # Default vault sources (gitignored — local only)
vaults/           # Additional vaults (gitignored)
public/           # Web UI
server.ts         # Bun HTTP server
wiki.sh           # Server control script
.env              # API keys (gitignored)
```

## Development

Requires [Bun](https://bun.sh/) runtime.

```bash
bun run server.ts                  # Run server directly
bun test server.test.ts            # API tests
npx playwright test                # UI tests (server must be running)
```

## Version

See [CHANGELOG.md](CHANGELOG.md) for release history.
