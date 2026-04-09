---
title: "Jagged Frontier"
type: concept
created: 2026-04-07
updated: 2026-04-07
sources:
  - "[[src-ai-capabilities-at-work]]"
  - "[[src-the-201-gap]]"
  - "[[src-how-ai-makes-mistakes]]"
tags:
  - capabilities
  - limitations
  - frontier
---

# Jagged Frontier

The AI capability boundary is not a smooth line — it is jagged. Models excel brilliantly at some tasks and fail unexpectedly at adjacent, seemingly similar ones. You cannot predict performance by category alone.

## The Evidence

Research from Harvard Business School (with BCG consultants) quantified the effect:

- **Inside the frontier** — On tasks where AI is strong, users with AI access showed ~40% quality improvement over a control group.
- **Outside the frontier** — On tasks just beyond the boundary, AI users performed 19 percentage points worse than those working without AI. The model's confident-but-wrong outputs actively misled users.

## Structural, Not Inherent

The critical insight: jaggedness is not a fixed property of the model. It is an artifact of [[Work Structure]]. A task that seems monolithic may contain sub-tasks on both sides of the frontier. Decompose it differently and the boundary shifts.

This means the meta-skill — knowing where the frontier falls for a specific task — matters more than raw model capability. That judgment is precisely what [[the-201-gap|The 201 Gap]] describes as missing from current AI training.

## Practical Implication

Never trust a model uniformly. Verify outputs at the task level, not the project level. What works flawlessly in paragraph three may hallucinate in paragraph four.

See also: [[Verification]], [[Work Structure]], [[The 201 Gap]].
