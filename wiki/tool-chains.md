---
title: "Tool Chains"
type: concept
created: 2026-04-07
updated: 2026-04-07
sources:
  - "[[src-notebooklm-with-antigravity]]"
  - "[[src-notebooklm-research-workflows]]"
tags:
  - workflows
  - tools
  - integration
---

# Tool Chains

Combining complementary AI tools into end-to-end workflows where each tool handles what it does best. The shift from "which single tool is best?" to "how do I wire tools together?"

## Example: NotebookLM + AntiGravity

[[NotebookLM]] excels at source-grounded synthesis — it reads your documents and answers questions with citations. AntiGravity excels at structured output and transformation. Chained together: NotebookLM extracts and synthesizes, then AntiGravity reformats for the target audience. Neither tool alone covers the full workflow.

## Why Chains Beat Single Tools

- **Specialization** — Each tool operates in its strength zone, avoiding the [[Jagged Frontier]] problem.
- **Verifiability** — Intermediate outputs between tools create natural checkpoints. You can inspect the handoff.
- **Scalability** — A well-defined chain can be templated, automated, and handed to less experienced users.

## The Setup Cost Trade-off

Tool chains require more upfront design: defining inputs/outputs at each stage, handling format mismatches, managing context across tools. But this cost is paid once and amortized across every run.

## Global Rules as Glue

The context problem — each tool starts with a blank slate — is addressed by global rules and persistent configuration files. These ensure consistent behavior, tone, and constraints across the chain.

See also: [[NotebookLM]], [[Intelligence Commoditization]], [[work-structure]].
