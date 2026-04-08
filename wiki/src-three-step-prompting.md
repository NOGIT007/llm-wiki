---
title: "Three-Step Prompting: From Generic to Expert-Level Outputs"
type: source
created: 2026-04-07
updated: 2026-04-07
sources:
  - "raw/challenge-3-steps-from-generic-to-expert-level-outputs.md"
tags:
  - prompt-engineering
  - riceco
  - expert-anchoring
  - methodology
---

## Key Thesis

Generic AI outputs result from generic prompts. The three-step prompting method -- Expert Anchor, Context Extraction, Prompt Synthesis -- transforms vague interactions into expert-level documents by combining authoritative knowledge with personal context through a structured framework.

## Important Claims

**Step 1: Expert Anchor.** AI naturally pulls from average internet content. Grounding it in high-quality expert sources (articles, transcripts, guides from recognized authorities) produces fundamentally better outputs. The user identifies domain experts, uploads substantial content, and instructs the AI to reference only the provided expert source -- no general knowledge.

**Step 2: Context Extraction.** Even expert-anchored prompts produce generic results without personal context. The method uses an AI-conducted interview: the model asks one question at a time about the user's role, audience, purpose, constraints, and success criteria. The output is a structured "Context File" capturing the user's specific situation.

**Step 3: Prompt Synthesis with RICECo.** The final step combines the expert guide and context file into a Master Execution Prompt using the **RICECo framework**: Role (world-class persona from expert knowledge), Instruction (step-by-step tasks), Context (personal/organizational details), Examples (2-3 golden examples of desired output), Constraints (must-haves and must-nots), Output (exact structure and format). The synthesized prompt is executed in a clean session, not the conversation that built it.

The method is designed as a practical challenge taking 2-3 hours, applicable to any document type -- reports, proposals, procedures.

## Key Entities

- Author: [[Morten Andre Nilsson]]
- Framework: RICECo (Role, Instruction, Context, Examples, Constraints, Output)
- Concepts: [[Prompt Engineering]], expert anchoring, context extraction

## Cross-References

Directly relevant to [[Prompt Engineering]] practices. The context persistence problem connects to [[src-claude-desktop-settings|Claude Desktop Settings]] (personalization layers) and [[src-notebooklm-with-antigravity|NotebookLM with AntiGravity]] (global rules). Quality grounding relates to [[Verification]] and [[Hallucinations]].
