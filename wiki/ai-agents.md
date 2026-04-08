---
title: "AI Agents"
type: concept
created: 2026-04-07
updated: 2026-04-07
sources:
  - "[[src-ai-agents-the-next-os]]"
  - "[[src-training-ai-agents]]"
  - "[[src-swarm-agent]]"
  - "[[src-beyond-the-hype-ai-agent-misalignment]]"
tags:
  - agents
  - autonomy
  - orchestration
---

# AI Agents

Autonomous AI systems that perceive, decide, and act — going beyond single-turn chat into persistent, goal-directed workflows.

## Four Components

1. **Model** (brain) — The LLM that reasons and generates.
2. **Prompt** (driver) — Instructions that shape behavior and goals.
3. **Context** (memory) — Persistent state: conversation history, documents, retrieved facts.
4. **Tools** (hands) — APIs, file systems, browsers, code execution — anything the agent can act on.

The **harness** is the environment that connects these four, managing the loop of observe-think-act.

## Training and Skill Transfer

Agents can be trained through `.skill.md` files — structured documents that encode procedures, constraints, and examples. This makes agent behavior reproducible and auditable, unlike opaque fine-tuning.

## Swarm and Parallel Execution

Multiple agents can operate in parallel on decomposed subtasks, coordinated by an orchestrator. Swarm patterns reduce latency and allow specialization (one agent researches, another writes, a third reviews).

## Misalignment as Management Problem

Agent misalignment is not an exotic AI-safety issue — it mirrors everyday management failures. Unclear goals, missing feedback loops, and poor monitoring cause agents to drift just like unsupervised employees. The fix is the same: clear objectives, staged autonomy, and [[Verification]].

See also: [[Claude Code]], [[Work Structure]], [[ai-security]].
