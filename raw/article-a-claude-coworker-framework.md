---
title: "A Claude CoWorker Framework"
description: "Move AI from read-only to read-write — a framework for using Claude as a capable coworker, not just an advisor"
date: "2026-03-11T14:08"
author: "Morten Andre Nilsson"
section: usecases
technology: "Claude Cowork"
subject: "Workflow"
slug: article-a-claude-coworker-framework
tags: []
draft: true
image: gs://et-cms-content-prod-etai-cm/images/learn/article-a-claude-coworker-framework-hero.jpg
---

Every AI implementation I've seen in the past year falls into the same trap. Companies deploy Claude or ChatGPT as glorified search engines, asking questions and copying answers into emails. They're using AI like a very expensive consultant when they could be using it like a very capable employee.

The difference comes down to moving AI from **read-only to read-write**. Instead of asking AI what it thinks, you let it act on what it knows.

## Most people are stuck at level one

Claude's Co-work feature represents a shift that most people haven't grasped yet. The traditional approach treats AI as an advisor: you feed it information, it gives you analysis, you manually implement the suggestions. This is Level 1 in what I call the DO-MAKE-KNOW framework -- AI as a task executor that follows specific instructions but requires you to handle all the actual work.

Level 1 isn't useless. When I first tested Co-work on a folder of messy expense receipts and contracts, watching Claude systematically rename each file based on its contents and sort them into subfolders was satisfying. But the real value emerged when I stopped treating it as a one-off task and started treating it as a repeatable process.

The constraint at Level 1 is that you're still the bottleneck for everything that happens next.

## Level two is where things get interesting

Level 2 -- MAKE -- means AI receives one input and produces finished work across multiple systems. Instead of organizing files and stopping, AI processes the files, extracts key information, updates your CRM, drafts follow-up emails, and logs everything in a project management system.

This is where most people get nervous, and rightfully so. You're giving AI write access to systems that matter. But the companies I've seen get real value from AI have made this jump. They've moved from asking AI "What should I do about this customer complaint?" to having AI read the complaint, check the customer's history, draft a response following company guidelines, and route it for approval.

The setup requires more thought than Level 1. You need clear system instructions, proper access controls, and ways to monitor what AI is actually doing. But the productivity gain is exponential, not incremental.

## Level three turns AI from tool to asset

The KNOW level is where AI develops memory and builds insights over time. Instead of starting fresh with each interaction, AI maintains a memory file that captures patterns, preferences, and lessons learned from previous work.

I started having Co-work maintain a simple memory.md file that tracks how different types of documents should be handled, which clients prefer what communication styles, and which processes work best for which situations. After a month, the quality of its work improved noticeably. After three months, it was catching nuances I hadn't explicitly programmed.

This isn't about AI becoming sentient -- it's about compound learning. Each interaction makes the next one more valuable. Most people reset this advantage every time they start a new chat session.

## Start with folder instructions, not grand visions

The practical path forward is simpler than most people make it. Download Claude's desktop app and find a folder that annoys you -- receipts, meeting notes, client files, whatever needs organizing. Write a clear instruction file that explains what AI should do with each type of document it finds.

Start with basic file organization but include a logging requirement. Have AI maintain a changelog of everything it does and a memory file of patterns it notices. This creates the foundation for moving to Level 2 and eventually Level 3.

The key insight is that **detailed instructions matter more than sophisticated prompts**. Don't ask AI to "help organize" your files. Tell it exactly how to rename them, where to put them, what to do if information is missing, and how to log its actions.

Most people will read this and keep using AI as a consultant. The ones who actually implement Co-work as a system -- with clear instructions, proper logging, and memory files -- will have a significant advantage over those who don't.