---
title: "Claude Desktop"
type: entity
created: 2026-04-07
updated: 2026-04-07
sources:
  - "[[src-beginners-guide-claude-desktop]]"
  - "[[src-claude-desktop-settings]]"
  - "[[src-train-claude-to-question-projects]]"
tags:
  - tool
  - desktop-app
  - anthropic
---

## Overview

Claude Desktop is the desktop application for [[Claude]], built by [[Anthropic]]. It provides a rich GUI for interacting with Claude outside the browser, with deeper system integration and persistent configuration.

## Key Features

- **Three-Layer Context** -- Profile instructions (global), Cowork instructions (session-level), and Project instructions (scoped to a workspace). These layers stack to give Claude progressively more specific guidance.
- **Artifacts** -- Inline rendering of code, documents, and visual outputs directly in the conversation.
- **Projects** -- Dedicated workspaces with bundled files, instructions, and conversation history.
- **Cowork Mode** -- Collaborative workflow where Claude questions assumptions and iterates with the user before producing final output.
- **Skills** -- Reusable prompt routines that Claude can invoke on demand.
- **Add-ins** -- Integration with Microsoft Office tools (Excel, PowerPoint) for document generation and data manipulation.

## Relationship to Other Entities

Claude Desktop is the GUI counterpart to [[Claude Code]] (the CLI tool). Both consume the same underlying [[Claude]] model but target different workflows -- Desktop for general knowledge work, Code for software development.

## See Also

[[Claude]] | [[Claude Code]] | [[Anthropic]]
