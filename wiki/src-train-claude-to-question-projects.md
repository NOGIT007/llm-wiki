---
title: "Train Claude to Question Your Projects"
type: source
created: 2026-04-07
updated: 2026-04-07
sources:
  - "raw/train-claude-to-question-your-projects.md"
tags:
  - claude
  - custom-skills
  - prompt-engineering
  - content-creation
---

# Train Claude to Question Your Projects

A technique by [[Morten Andre Nilsson]] for configuring [[Claude]] to interrogate requirements before creating content. Instead of immediately drafting emails, documents, or slides, Claude conducts a structured interview that surfaces constraints, audience needs, and objectives — preventing the revision cycles that unclear requirements generate.

## The Custom Skill Approach

Using [[Claude Desktop]]'s Skills feature, you create an "Interrogate First" skill with instructions that redirect Claude's default behavior. The skill tells Claude to interview thoroughly about audience, purpose, constraints, success criteria, and context before producing any output. This transforms creation requests into comprehensive planning conversations.

## The Process

1. **Create the skill** — A single instruction block in Claude Desktop's Skills settings
2. **Launch with a brief request** — Keep the opening deliberately short ("I need an email updating our team about the project delay") so Claude questions rather than drafts
3. **Answer thoroughly** — Expect 6-10 initial questions covering audience, outcomes, constraints, and tone
4. **Complete the investigation** — Complex projects generate 15-30 questions across multiple exchanges, revealing gaps you had not considered
5. **Request content** — After full questioning, the output incorporates all uncovered requirements
6. **Save the pattern** — Preserve Claude's questions as a reusable framework for future projects

## When to Use It

This method works best for high-stakes communications, complex documents, important presentations, and critical meeting preparation. It is inefficient for routine tasks with obvious requirements. The technique requires authority to make content decisions — if you cannot answer questions about audience or constraints, the questioning reveals knowledge gaps but cannot fill them.

The core insight connects to [[Prompt Engineering]] and the [[4D Framework]]'s "Describe" dimension: investing time in shared understanding before creation dramatically reduces total effort. The approach exemplifies how [[AI Agents]] become more effective when humans provide structured context upfront.
