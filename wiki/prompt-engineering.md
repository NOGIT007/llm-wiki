---
title: "Prompt Engineering"
type: concept
created: 2026-04-07
updated: 2026-04-07
sources:
  - "[[src-5-claude-techniques]]"
  - "[[src-3-steps-generic-to-expert]]"
  - "[[src-claude-desktop-settings]]"
tags:
  - prompting
  - techniques
  - ai-interaction
---

# Prompt Engineering

Techniques for structuring inputs to AI models to produce higher-quality, more reliable outputs. Not about "magic words" but about reducing ambiguity and giving the model the right context to reason well.

## Core Techniques

- **Memory injection** — Providing persistent context (via system prompts or project files) so the model retains key facts across conversations.
- **Reverse prompting** — Asking the model to generate its own questions before answering, surfacing hidden assumptions.
- **Constraint cascade** — Layering restrictions progressively (format, tone, scope) to narrow output space without over-constraining.
- **Role stacking** — Assigning multiple expert personas to activate different reasoning modes in a single prompt.
- **Verification loops** — Building self-checking steps directly into the prompt so the model audits its own output.
- **RICECo framework** — Role, Instructions, Context, Examples, Constraints — a structured template for consistent prompt construction.
- **Expert anchoring** — Opening with domain-specific framing so the model calibrates its register and depth.
- **Context extraction** — Techniques for pulling implicit knowledge out of documents before asking follow-up questions.

## Key Insight

The gap between generic and expert-level outputs is rarely the model — it is the prompt. Three deliberate steps (define role, supply context, add constraints) reliably close that gap.

See also: [[Claude]], [[Verification]], [[the-201-gap]].
