---
title: "Claude Code"
type: entity
created: 2026-04-07
updated: 2026-04-07
sources:
  - "[[src-claude-code-skills]]"
  - "[[src-master-claude-code-guide]]"
  - "[[src-swarm-agent-with-claude-code]]"
tags:
  - tool
  - cli
  - anthropic
  - agents
---

## Overview

Claude Code is [[Anthropic]]'s official CLI tool for [[Claude]], designed for software development workflows. It brings Claude into the terminal with deep codebase awareness and agentic capabilities.

## Key Features

- **Skills Framework** -- Reusable, composable prompt routines that Claude Code can invoke. Skills encapsulate domain knowledge and multi-step workflows into callable units.
- **CLAUDE.md Project Files** -- Per-repository instruction files that provide persistent project context, coding conventions, and constraints to every Claude Code session.
- **Agent Teams / Swarms** -- Orchestration of multiple Claude instances working in parallel on different subtasks, coordinated through a lead agent.
- **LSP Support** -- Language Server Protocol integration for code intelligence (go-to-definition, diagnostics, completions) grounded in the actual codebase.

## Relationship to Other Entities

Claude Code is the CLI counterpart to [[Claude Desktop]]. While Desktop targets general knowledge work, Code is purpose-built for developers -- reading files, running tests, making commits, and managing branches directly from the terminal.

## See Also

[[Claude]] | [[Claude Desktop]] | [[Anthropic]] | [[Prompt Engineering]]
