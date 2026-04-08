---
title: "Claude Desktop has powerful settings that most people skip over"
description: "Learn how to configure Claude Desktop's personalization settings"
date: "2026-04-02T21:05"
section: usecases
template: presentation
mood: auto
embed_url: /usecases/claude-desktop-has-powerful-settings-that-most-people-skip-over/claude-desktop-has-powerful-settings-that-most-people-skip-over-presentation.html
technology: "Claude Chat"
subject: "Quick Win"
author: kennet.dahl.kusk@visma.com
draft: true
image: "gs://et-cms-content-prod-etai-cm/images/usecases/claude-desktop-has-powerful-settings-that-most-people-skip-over-hero.png"
---
## Why You Should Set Up Personalization in Claude Desktop

Most people open Claude and start typing. That works — but you are leaving a lot on the table. Claude Desktop has built-in settings that let you shape how it responds, what it knows about you, and how it handles files. Here is how to use them.

---

## The Default Experience Is Generic

When you first open Claude Desktop, it knows nothing about you. It does not know your role, your preferred tone, your tools, or your workflows. Every conversation starts from zero.

That means you end up repeating yourself: "Keep it concise." "I am not a developer." "Do not use bullet points for everything." Each time, you are spending effort training Claude on things it should already know.

Claude's personalization features solve this by giving you **three layers of persistent settings** that carry across every conversation. Once configured, Claude adapts to you automatically.

---

## Where to Find These Settings

Both settings live in the same place. Click your initials in the bottom-left corner of Claude Desktop, then select **Settings**. You will find two tabs that matter:

| Setting | Navigation Path | Scope | What It Controls |
| --- | --- | --- | --- |
| ⚙️ Profile Preferences | Initials → Settings → Profile | Global | Who you are, your role, tone rules, restrictions, and research style. Applies to every conversation. |
| 🤖 Cowork Instructions | Initials → Settings → Cowork \[Preview\] | All Cowork Sessions | File naming, folder structure, output formats, safety rules. Applies every time Claude accesses your file system. |
| 📂 Project Instructions | Projects → Select Project → Instructions | Per Project | Domain context, output specs, naming conventions, workflow rules. Persists across all conversations in that project. |

---

## 1. Profile Preferences — Tell Claude Who You Are

This is the most impactful setting and the one you should configure first. Profile Preferences are account-wide — they apply to every conversation you start. Without them, you end up repeating the same corrections over and over.

Go to **Initials → Settings → Profile** and paste something like this. You can copy the text below and adapt it to your own role and preferences:

- ⚙️ Profile Preferences

```
## Technical Context & User Profile
The user is a non-coder using the latest Mac OS. Tailor all technical explanations to be accessible for a non-coder.
When discussing programming, focus on: Python with UV, React, MCP, Claude Code, Claude Agent SDK, Claude Skills, HTML, Bun package, and DuckDB.
The user utilizes Claude Code in combination with Claude Desktop. Reference this preferred technology stack when relevant.

## Communication & Tone
- Professional, direct, and confident (without hedging, unless genuine uncertainty exists).
- Lead with the conclusion or answer first, then supporting detail (top-down structure).
- No filler openers (skip "Great question!", "Sure!", "Absolutely!", etc.) and no apologetic language or over-explanation.
- No sycophantic praise or encouragement mid-response.
- Keep responses concise. Avoid restating the question or summarizing what was just said.
- Spell out contractions involving pronouns ("I would" not "I'd", "we will" not "we'll"). Natural contractions like "wouldn't" or "doesn't" are fine.
- Preserve authentic voice when editing or polishing writing — minimal rewrites, no sanitizing.

## Critical Restrictions — Always Require Explicit Approval Before
- Deleting anything on Google Cloud Platform (GCP).
- Sending any emails.
- Deleting any files or folders on the Mac.
- Executing or sending any data from the Mac.
- Creating any Mac users.
- Creating a new GitHub repo (always make it private unless explicitly told otherwise).

> Note: Never suggest actions that would violate these restrictions without first asking for permission. Clearly mark restricted steps as requiring user approval.

## Problem Solving & Research
- If something is unclear or ambiguous, ask rather than assume or fabricate. A short clarifying question is always better than a confident wrong answer.
- Search online for any topic that is not obviously settled knowledge, especially fast-moving topics, recent events, product specifics, pricing, or versions.
- Prefer primary or high-quality sources (official docs, firm reports, original journalism) over aggregators.
- State findings directly — no meta-commentary about the search process.
- When multiple options exist, give a recommendation rather than listing everything neutrally.

## Formatting
- Match format to context: casual questions get prose, structured tasks get structure.
- Avoid excessive bold emphasis — use it sparingly, only for genuinely critical terms or headers.
- No excessive bullet fragmentation — use prose when a few sentences flow better than a list.
- No unsolicited suggestions to "let me know if you need anything else" or similar sign-offs.
```

This covers four key areas: your technical context (so Claude knows your skill level), communication rules (so it stops being generic), critical restrictions (so it asks before doing anything destructive), and research behavior (so it looks things up instead of guessing).

> Your preferences do not need to be perfect on day one. Start with the basics — your role, tone, and restrictions — then refine as you notice patterns. If you keep correcting Claude on the same thing, add it to your preferences.

---

## 2. Cowork Global Instructions — Your Power Setting

If you use Cowork mode (the desktop agent that can read and write files, run code, and interact with your computer), this is the second setting you need. Cowork Instructions apply to every Cowork session automatically — this is where you define how Claude handles files, projects, and multi-step workflows on your machine.

Go to **Initials → Settings → Cowork \[Preview\]** and paste something like this:

- 🤖 Cowork Global Instruction

```
Instructions here apply to all Cowork sessions. Use this for preferences, conventions, or context that Claude should always know.

- Default output formats: .docx for written deliverables, .pptx for presentations, .xlsx for structured data.
- Name all files using the format: YYYY.MM.DD_DescriptiveName (e.g. 2026.03.13_Q1SalesReport).
- Organize files by project: Project > Drafts / Finals / Research. Add subfolders as needed for further organization.
- Before executing any file operation that modifies or moves existing files, show a plan and wait for approval.
- Never delete files without explicit confirmation.
- When synthesizing research or producing summaries, lead with the key takeaway, not background context.
- For multi-step tasks, break work into phases and confirm completion of each phase before proceeding.
- Prefer these skills when relevant: company-investigation, doc-co authoring, specify-and-plan.
```

These instructions ensure that every time you start a new Cowork session, Claude already knows your file naming conventions, folder structure, and safety rules. You never have to explain them again.

> Cowork mode gives Claude real access to your machine — it can create, edit, and organize files. Without global instructions, you are relying on Claude to guess your preferences each time. With them, Claude operates like an assistant who already knows your system.

---

## 3. Project Instructions — The Third Layer

The first two settings are global — they apply everywhere. Project Instructions are the third layer, and they are scoped to a specific project. Every conversation you start inside that project automatically inherits its instructions.

This is where you put domain-specific rules that only matter for one type of work. Go to **Projects → Select a Project → Instructions** (the gear icon) to add them.

### When to Use Project Instructions

Use them when you have a recurring workflow with its own requirements. For example, a content creation project might specify: "Always output HTML using this design palette and these naming conventions." A research project might say: "Focus on European markets, always cite sources, output as markdown." A development project might include: "Use Python with UV, follow this folder structure, run tests before committing."

The key difference from Profile Preferences: project rules only apply inside that project. Your global preferences still apply on top — project instructions add specificity, they do not replace your baseline.

---

## How All Three Layers Work Together

**Profile Preferences** shape every conversation — web, mobile, and desktop. They define who you are and how Claude communicates. **Cowork Instructions** kick in when Claude has access to your file system in Cowork mode. **Project Instructions** add domain-specific rules for individual projects. Together, these three layers cover the thinking, the doing, and the context.

Set them up once, and Claude stops being a generic chatbot. It becomes an assistant that already knows your role, your tone, your tools, your file structure, and the specifics of whatever you are working on.

---

## Start Here: The 10-Minute Setup

1. **Open Settings → Profile.** Copy the preferences template above and adapt it — change the role, tools, and restrictions to match your own workflow.
2. **Open Settings → Cowork.** Copy the Cowork template and adjust the file naming conventions and folder structure to match how you organize your work.
3. **Create a Project.** Pick one recurring workflow and add project-specific instructions — output format, domain rules, or naming conventions.
4. **Start using Claude.** When you notice yourself correcting the same thing twice, add it to your preferences.

> Every rule you add saves you a correction in every future conversation. Over time, the gap between a default Claude experience and a personalized one gets massive. Spend 5 minutes now, save hours over the next month.