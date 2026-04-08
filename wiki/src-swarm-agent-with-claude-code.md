---
title: "Swarm Agent with Claude Code"
type: source
created: 2026-04-07
updated: 2026-04-07
sources:
  - "raw/swarm-agent-with-claude-code.md"
tags:
  - claude-code
  - ai-agents
  - parallel-execution
  - tmux
---

# Swarm Agent with Claude Code

A practical guide to running parallel [[AI Agents]] using [[Claude Code]]'s experimental agent teams feature. Multiple Claude instances work simultaneously on different parts of a task, coordinated by a lead agent from a single terminal.

## Setup and Configuration

Agent teams require [[Claude Code]] with authentication, tmux (or iTerm2 on macOS), and an experimental flag enabled in `settings.json`: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. This unlocks the `/team` command. The guide provides a full tmux configuration with mouse support, pane navigation keybindings, and a cheat sheet script.

## How Teams Work

A lead agent spawns teammates and coordinates tasks. Two display modes are available: **in-process** (all teammates in one terminal, switch with `Shift+Up/Down`) for quick tasks, and **split-pane** (each teammate in its own tmux pane) for real-time monitoring of complex work. Tasks can be self-claimed by teammates or explicitly assigned by the lead.

For risky changes, teammates can be required to submit plans for approval before modifying code. **Delegate mode** prevents the lead from writing code entirely, restricting it to coordination only — spawning, messaging, and task management.

## Best Practices

Each teammate needs clear goals, access to relevant files, and explicit success criteria. Work should be broken into **10-30 minute chunks** to reduce merge conflicts and keep progress visible. File conflicts are managed through automatic locking, explicit ownership assignment, and branch isolation.

## Key Use Cases

The pattern applies to parallel code review (frontend, backend, and tests simultaneously), debugging with competing hypotheses, feature development across independent components (UI, API, DB, docs), and research aggregation from different data sources. This represents a practical implementation of [[Tool Chains]] for software development, extending [[Claude Code]]'s single-agent capabilities into coordinated multi-agent workflows. See [[Anthropic]] for the broader Claude ecosystem.
