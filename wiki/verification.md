---
title: "Verification"
type: concept
created: 2026-04-07
updated: 2026-04-07
sources:
  - "[[src-how-ai-makes-mistakes]]"
  - "[[src-ai-agent-misalignment-management]]"
  - "[[src-workspace-studio-use-cases]]"
  - "[[src-ai-capabilities-at-work]]"
tags:
  - verification
  - quality
  - reliability
---

# Verification

Checking AI outputs for correctness — the single most recurring theme across the entire corpus. If generation is becoming free, verification is becoming the bottleneck.

## Approaches

- **Self-checking** — The model reviews its own output against criteria. Cheap but limited; models have blind spots about their own errors.
- **Multi-model verification** — Route the same question through multiple models and compare. Disagreements surface weak spots.
- **Staged deployment** — Start with low-stakes, human-reviewed tasks. Expand autonomy only as error rates prove acceptable.
- **Behavioral monitoring** — Track agent actions over time. Drift in patterns (more API calls, different file access) signals misalignment before failures become visible.

## Verification Tiers

Not all outputs are equally checkable:

- **Machine-checkable** — Code that compiles, tests that pass, math that resolves. Easiest to verify; best candidates for full automation.
- **Expert-checkable** — Legal analysis, medical reasoning, architectural decisions. Requires domain knowledge to assess.
- **Taste-dependent** — Creative writing, design, strategy. Verification is subjective and slow.

## Key Insight

The value of AI scales with the verifiability of its output. Tasks where correctness is cheap to confirm benefit enormously from AI. Tasks where verification costs as much as creation gain little.

See also: [[Hallucinations]], [[Jagged Frontier]], [[Work Structure]].
