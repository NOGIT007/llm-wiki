---
title: "A Claude Coworker Framework"
type: source
created: 2026-04-07
updated: 2026-04-07
sources:
  - "raw/article-a-claude-coworker-framework.md"
tags:
  - claude
  - workflow
  - ai-agents
  - productivity
---

## Summary

This article introduces the DO-MAKE-KNOW framework for moving [[Claude]] from a read-only advisor to a read-write coworker. The central argument: most companies deploy AI as a glorified search engine when they could be using it as a capable employee. The difference is moving from asking AI what it thinks to letting it act on what it knows.

## The Three Levels

### Level 1: DO
AI as a task executor following specific instructions. Example: Claude's Co-work feature systematically renaming and sorting files based on content. Useful but limited -- you remain the bottleneck for everything that happens next.

### Level 2: MAKE
AI receives one input and produces finished work across multiple systems. Instead of just organizing files, AI processes them, extracts information, updates the CRM, drafts follow-ups, and logs everything. This requires clear system instructions, proper access controls, and monitoring. The productivity gain is exponential, not incremental.

### Level 3: KNOW
AI develops memory and builds insights over time. By maintaining a memory file that tracks patterns, preferences, and lessons learned, AI quality improves noticeably over months. Each interaction makes the next one more valuable -- compound learning. Most people reset this advantage every time they start a new chat session.

## Practical Implementation

Start with a folder that annoys you. Write clear instruction files explaining exactly what AI should do with each document type. Include logging requirements and a memory file for patterns. Detailed instructions matter more than sophisticated prompts.

## Cross-References

The DO-MAKE-KNOW levels build on the [[AI Agents]] architecture described in [[src-ai-agents-the-next-os]], particularly the tools component. The memory injection concept from [[src-5-claude-techniques]] maps to the KNOW level. Level 2's write-access to systems introduces the agent-as-insider risks discussed in [[src-6-ai-security-realities]]. The [[Verification]] challenge grows as AI moves from read-only to read-write.
