---
title: "How and When AI makes mistakes"
description: "How and When AI makes mistakes"
date: "2026-02-17T11:10"
author: "Morten Andre Nilsson"
section: explore
slug: article-how-and-when-ai-makes-mistakes
tags: []
draft: true
image: gs://et-cms-content-prod-etai-cm/images/explore/article-how-and-when-ai-makes-mistakes-hero.jpg
---

### How AI Systems Fail—and Why It Matters for Your Work

Most people assume that AI either works correctly or fails in predictable ways. For example, if an AI system makes a mistake, you might expect it to keep making the same mistake in similar situations. This would let you catch and fix the problem. But recent research from Anthropic suggests that as AI tackles harder tasks, its failures become less predictable—and harder to manage.

This isn’t just a technical detail. The way an AI fails affects how you can use it safely. Below, we’ll explain the two types of failures, why they happen, and what they mean for your work.

---

### Two Types of AI Failures

AI systems can fail in two broad ways:

1. **Systematic failures**: The AI consistently does the wrong thing. For example, a chatbot might always misinterpret a specific type of customer question, no matter how many times it’s asked. These errors are predictable and can often be fixed with adjustments to the system.

2. **Inconsistent failures**: The AI behaves unpredictably. It might give different answers to the same question or follow steps in a task without completing them. These errors don’t follow a pattern, which makes them harder to detect or correct.

The Anthropic research shows that as AI systems handle more complex tasks, inconsistent failures become more common. This is important because it changes how you should think about using AI in your work.

---

### Simple Tasks: When AI Fails Predictably

For straightforward tasks—like summarising a document or answering a direct question—modern AI systems (such as Claude or GPT-4) usually perform well. When they do make mistakes, those mistakes tend to be systematic. For example, an AI might consistently misread dates in a specific format or struggle with a particular type of math problem.

But even with simple tasks, problems can arise if the AI has to repeat them. The Anthropic researchers found that when AI systems perform the same simple task multiple times, they start making random errors. These aren’t mistakes caused by a clear flaw in the system. Instead, the AI’s responses vary without any obvious reason.

For example, if you ask a customer service bot the same question three times in a row, it might give three different answers. This isn’t because the AI is trying to achieve the wrong goal—it’s not trying to achieve any goal at all. It’s just producing inconsistent outputs.

This isn’t a bug that can be fixed with better instructions (what developers call "prompts"). It’s a deeper issue: the AI’s responses vary even when given the same input. This makes it difficult to rely on the system for tasks where consistency matters.

---

### Complex Tasks: When AI Loses the Thread

The real challenge appears when AI systems tackle tasks that require multiple steps or extended reasoning. For example:
- Analysing a complex financial portfolio.
- Debugging a piece of software with multiple interacting parts.
- Answering a question that requires combining information from several sources.

In these cases, the Anthropic research found that AI failures become more chaotic. The longer the reasoning chain, the more likely the AI is to produce random or illogical outputs. It’s not that the AI is following flawed logic—it’s that its responses don’t follow any logic at all.

For example, an AI trained to analyse financial data might work well with simple portfolios. But when given a complex set of derivatives, it might start making recommendations that don’t make sense or contradict each other. These aren’t errors you can trace back to a specific flaw in the system. They’re just random.

The researchers tested this by training AI systems to act as "optimisers"—systems designed to improve toward a specific goal over time. Even in this controlled setting, larger AI models learned what the correct goal was faster than they learned to pursue it consistently. In other words, they knew what they were supposed to do but couldn’t always do it reliably.

---

### Bigger Models Don’t Always Mean More Reliable AI

Many people assume that making AI models larger and more capable will make them more reliable. The Anthropic research challenges this idea. While larger models do make fewer total errors, the errors they do make are often more random and less predictable.

This suggests that intelligence and consistency don’t always go hand in hand. A more capable AI might perform better on average, but it could also produce completely nonsensical outputs without warning. This is a problem because it makes it harder to trust the system in high-stakes situations.

For example, an AI that works well 99% of the time might still fail in unpredictable ways when handling a critical task. This doesn’t mean larger models are worse—just that they don’t solve the problem of inconsistent failures.

---

### What This Means for Your AI Strategy

The research highlights a key vulnerability: AI systems are most likely to become inconsistent when you need them most—on complex, high-stakes tasks that require sustained reasoning. This changes how you should think about AI risk.

Instead of worrying only about AI pursuing the wrong goals (e.g., an AI deciding to prioritise something harmful), you should also consider the risk of AI losing track of what it’s doing entirely. For example, in a safety-critical system like a nuclear power plant, the bigger risk isn’t that the AI will decide to ignore reactor temperatures—it’s that the AI might forget to monitor them at all.

Here’s how you can apply this insight to your work:

1. **Use AI for tasks where random errors are manageable**. For example, AI can help draft emails or generate ideas, where a mistake isn’t critical. But for tasks that require consistency—like processing legal documents or financial transactions—human oversight is still necessary.

2. **Avoid relying on AI for long, multi-step tasks without checks**. If an AI needs to follow a complex process (e.g., diagnosing a medical condition or designing a building), break the task into smaller steps and verify each one. This reduces the chance of the AI losing track.

3. **Combine AI with human judgment**. For high-stakes decisions, use AI as a tool to assist humans, not replace them. For example, an AI might analyse data and suggest options, but a human should make the final call.

4. **Monitor AI outputs for inconsistency**. If an AI system starts giving wildly different answers to the same question or producing illogical results, it’s a sign that it’s struggling with the task. Don’t assume that more data or a larger model will fix the problem—sometimes, the task is just too complex for the AI to handle reliably.

---

### The Path Forward

This research doesn’t mean you should avoid using AI. It means you should use it where its limitations are less likely to cause problems. For now, the safest approach is to deploy AI in areas where:
- The tasks are simple and repetitive.
- The consequences of random errors are low.
- Human oversight is available to catch mistakes.

Meanwhile, researchers are working on ways to make AI systems more consistent. But until those solutions are available, the best strategy is to use AI where its strengths outweigh its risks—and to stay aware of its limitations.

