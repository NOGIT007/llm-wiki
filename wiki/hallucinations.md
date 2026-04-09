---
title: "Hallucinations"
type: concept
created: 2026-04-07
updated: 2026-04-07
sources:
  - "[[src-how-to-solve-hallucinations]]"
  - "[[src-6-ai-security-realities]]"
  - "[[src-how-ai-makes-mistakes]]"
tags:
  - reliability
  - failure-modes
  - verification
---

# Hallucinations

AI confabulation — when models generate plausible-sounding but fabricated outputs. Citations that don't exist, statistics that were never published, code that looks correct but fails silently.

## Not Bugs, Features

Hallucinations are not defects to be patched; they are predictable consequences of how language models work. Models generate the most probable next token, not the most truthful one. When confidence is high but grounding is absent, the model confabulates fluently.

## Mitigation Strategies

- **RAG (Retrieval-Augmented Generation)** — Ground the model in actual documents before generating. Reduces hallucination by constraining the answer space to retrieved evidence.
- **Chain of verification** — Ask the model to generate, then verify each claim step-by-step against sources.
- **Self-consistency checks** — Generate multiple responses and compare. Disagreements flag unreliable claims.
- **Multi-model verification** — Cross-check outputs across different models. If Claude and GPT disagree, investigate.
- **Match rigor to stakes** — A brainstorming session tolerates some fabrication. A legal brief does not. Calibrate verification effort to consequence of error.

## Key Insight

The question is never "does this model hallucinate?" — they all do. The question is "does our workflow catch hallucinations before they matter?" That makes this fundamentally a [[Verification]] problem.

See also: [[Verification]], [[AI Security]], [[NotebookLM]].
