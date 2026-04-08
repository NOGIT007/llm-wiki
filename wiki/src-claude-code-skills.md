---
title: "Claude Code Skills Framework from Anthropic"
type: source
created: 2026-04-07
updated: 2026-04-07
sources:
  - "raw/claude-code-skills-from-anthropic-claude-code-team.md"
tags:
  - claude-code
  - skills
  - anthropic
  - framework
---

## Key Thesis

Skills in [[Claude Code]] are not just markdown files -- they are folders containing scripts, templates, gotchas, data, and references that [[Claude]] can discover and use at runtime. [[Anthropic]] runs hundreds of skills internally, organized into nine types across a three-level system designed to keep context lean.

## Important Claims

The source reveals [[Anthropic]]'s internal framework for building and organizing [[Claude Code]] skills. The key architectural insight is that a skill is a **folder**, not a file. This folder can contain executable scripts, template files, known-issue documentation, reference data, and instructional markdown -- all discoverable by Claude at runtime.

Anthropic uses **nine skill types** internally (the specific types are detailed in the accompanying presentation). These are organized in a **three-level system** that manages context size -- a critical design constraint since loading too much skill context degrades performance.

The design principles that separate effective skills from ineffective ones focus on the difference between "a skill that works" and "one that transforms a workflow." The source includes interactive quizzes and a hands-on checklist for building custom skills.

This framework represents the official, internal approach used by the Claude Code team at [[Anthropic]], making it the authoritative reference for skill development. Skills are described as "one of the most used extension points in Claude Code."

## Key Entities

- Organization: [[Anthropic]]
- Product: [[Claude Code]], [[Claude]]
- Concepts: skills framework, nine skill types, three-level system, context management

## Cross-References

Directly related to [[src-training-ai-agents|Training AI Agents]] (the .skill.md framework for agent training). Skills and plugins are discussed in [[src-beginners-guide-claude-desktop|Beginner's Guide to Claude Desktop]]. The context-lean design principle connects to [[Prompt Engineering]] and the context problem in [[src-notebooklm-with-antigravity|NotebookLM with AntiGravity]].
