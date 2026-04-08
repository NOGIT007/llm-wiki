---
title: "How to solve Hallucinations"
description: "Practical systems for managing AI hallucinations — match your verification approach to the stakes of the decision"
date: "2026-03-11T14:11"
author: "Morten Andre Nilsson"
section: usecases
technology: "Gemini"
subject: "Quick Win"
slug: article-how-to-solve-hallucinations
tags: []
draft: true
image: gs://et-cms-content-prod-etai-cm/images/learn/article-how-to-solve-hallucinations-hero.jpg
---

AI hallucinations aren't actually the biggest problem. The biggest problem is that most people treat them like a software bug instead of what they really are: a predictable feature of how these systems work.

**Every AI output carries uncertainty risk, and you need a system to manage it.** The companies getting reliable results from AI aren't the ones with perfect prompts — they're the ones who match their verification approach to the stakes of the decision.

## Give the AI something real to work from

The fastest way to reduce hallucinations is Retrieval-Augmented Generation (RAG). Think of it as giving the AI a cheat sheet before it answers.

Instead of asking ChatGPT/Gemini/Claude  "What were Q3 sales for our enterprise clients?", you upload the actual sales report and ask the same question. The AI works from your data, not from whatever patterns it learned during training. NotebookLM does this by default — you upload documents, and it only answers based on what you've given it.

This isn't foolproof. The AI can still misinterpret your sources. But it eliminates the category of errors where the system confidently invents facts that sound plausible but are completely wrong.

## Make the AI check its own work

Chain of verification forces the AI to audit itself. The process is straightforward: generate an initial response, extract any factual claims as questions, fact-check those claims in a new conversation with search enabled, then regenerate the answer using only verified facts.

I tested this with a simple question about emoji availability across platforms. The initial response was confident but wrong. The verification step caught three factual errors that would have made it into a client presentation. The final answer was shorter, more cautious, and actually correct.

The key is treating verification as a separate step with fresh context. When you ask the AI to check its work in the same conversation, you get chain-of-thought reasoning from a wrong premise — which makes errors more convincing, not less.

## Run important queries through multiple models

LLM Council means running the same prompt through ChatGPT, Claude, and Gemini, then comparing results. When all four models agree, you have higher confidence. When they diverge, you know to dig deeper.

This works because different models have different training data, architectures, and failure modes. Claude might catch something GPT-4 misses. Gemini might have more recent information on a specific topic.

For routine tasks, this is overkill. For decisions with real stakes — strategic analysis, compliance questions, technical specifications — the extra ten minutes of cross-checking can prevent expensive mistakes.

## Match your rigor to the stakes

Simple question about public information? Just search or ask the AI directly.

Research that will inform decisions? Use NotebookLM with your own sources and add verification prompts.

Complex reasoning that affects strategy? Add self-consistency checks — run the same prompt three times and see if you get similar answers.

Mission-critical output? Full stack: RAG + reasoning + verification + LLM Council.

Most people either treat every AI interaction like it's life-or-death or assume every output is basically correct. Both approaches waste time. A customer service response needs different verification than a legal brief.

## Your hallucination checklist

Tell the AI to work only from provided information and not to fill in gaps. Give it explicit permission to say "I don't know." Ask narrower, more specific questions instead of broad requests.

Ask for confidence levels: "Rate your confidence in each claim from 1-10." Anything below 8 needs verification.

When using RAG, check your source quality first. The AI will confidently work from bad inputs just as easily as good ones.

Start with one verification method and add layers based on what you learn. Most hallucinations follow patterns — once you spot yours, you can design around them.