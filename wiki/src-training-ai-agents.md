---
title: "Training AI Agents with the .skill.md Framework"
type: source
created: 2026-04-07
updated: 2026-04-07
sources:
  - "raw/article-training-ai-agents.md"
tags:
  - ai-agents
  - skill-framework
  - training
  - automation
---

## Key Thesis

AI agent projects fail not because of technology limitations but because teams treat agents like traditional software instead of training them like skills. The solution is the `.skill.md` framework, which makes agent training systematic, testable, and version-controlled.

## Important Claims

Most agent failures follow a pattern: impressive demos that break when scaled to different users, times, or conditions. The root cause is relying on prompts (which are conversations) rather than explicit instruction sets that guide agents through each step.

The `.skill.md` format defines each agent capability as a discrete, testable skill. The article uses a concrete example from skillsmd.store: an agent that creates promotional videos using the Remotion framework. Instead of a vague "make videos" prompt, the skill file specifies every step -- navigate to tools, extract product info, generate React video components, compile output. Each step is explicit, testable, and repeatable.

The framework enables a tight **iteration loop**: define the skill, test in realistic conditions, analyze failures, refine instructions. [[AI Agents]] can attempt tasks dozens of times per hour, enabling rapid feedback -- but only with systematic capture of lessons. Most teams abandon agents after the first imperfect attempt rather than iterating.

The recommended approach: start with one well-defined repeatable task, map every human step including implicit decisions, test against realistic scenarios (not happy paths), refine based on observed failures, then design for reusability so other team members can plug the skill into their own agents.

## Key Entities

- Author: [[Morten Andre Nilsson]]
- Framework: .skill.md, skillsmd.store, Remotion
- Concepts: [[AI Agents]], [[Prompt Engineering]], skill-based training

## Cross-References

Connects directly to [[src-claude-code-skills|Claude Code Skills]] (Anthropic's internal skill framework). The iterative refinement philosophy aligns with [[src-ai-capabilities-at-work|Work Structure and AI Capabilities]] on structuring work for AI delegation.
