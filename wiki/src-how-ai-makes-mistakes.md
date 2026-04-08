---
title: "How and When AI Makes Mistakes"
type: source
created: 2026-04-07
updated: 2026-04-07
sources:
  - "raw/article-how-and-when-ai-makes-mistakes.md"
tags:
  - hallucinations
  - reliability
  - ai-risk
  - verification
---

## Summary

Based on [[Anthropic]] research, this article distinguishes between two fundamentally different types of AI failure and argues that as AI tackles harder tasks, failures become less predictable and harder to manage. This has direct implications for where and how organizations can safely deploy AI.

## Two Types of Failures

1. **Systematic failures** -- The AI consistently does the wrong thing (e.g., always misinterpreting a specific question format). These are predictable and fixable with adjustments.

2. **Inconsistent failures** -- The AI behaves unpredictably, giving different answers to the same question without any pattern. These are harder to detect or correct and become more common as task complexity increases.

## Key Findings

- **Simple tasks degrade with repetition** -- Even on straightforward tasks, AI systems start making random errors when repeating the same task multiple times. This is not a prompting problem; responses vary even with identical input.

- **Complex tasks produce chaotic failures** -- The longer the reasoning chain, the more likely the AI produces random or illogical outputs. The failures do not follow flawed logic -- they follow no logic at all.

- **Bigger models are not necessarily more reliable** -- Larger models make fewer total errors but their remaining errors are more random and less predictable. Intelligence and consistency do not always go hand in hand. This defines the [[Jagged Frontier]] of AI capability.

## Strategic Implications

- Use AI where random errors are manageable, not where consistency is critical
- Break complex tasks into smaller steps with [[Verification]] at each stage
- Combine AI with human judgment for high-stakes decisions
- Monitor outputs for inconsistency as a signal the task exceeds AI reliability

## Cross-References

The inconsistent failure mode is precisely what [[Hallucinations]] management systems in [[src-how-to-solve-hallucinations]] are designed to catch. The recommendation to decompose complex tasks aligns with the constraint cascade technique in [[src-5-claude-techniques]] and the broader [[Work Structure]] principle. The finding that larger models have less predictable errors complicates the [[Intelligence Commoditization]] narrative.
