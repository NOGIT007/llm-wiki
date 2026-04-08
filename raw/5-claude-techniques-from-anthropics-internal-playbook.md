---
title: "5 Claude Techniques From Anthropic's Internal Playbook"
description: "5 prompting strategies used internally at Anthropic"
date: "2026-02-09T22:32"
section: usecases
technology: "Claude Chat"
subject: "Workflow"
tags: []
author: kennet.dahl.kusk@visma.com
draft: true
image: "gs://et-cms-content-prod-etai-cm/images/learning/5-claude-techniques-from-anthropics-internal-playbook-hero.png"
---

Five specific prompting techniques separate power users from everyone else. These are not generic tips. They are structured workflows that produce dramatically better output from the same model you already have access to.

## Overview

| # | Technique | What It Does |
|---|-----------|-------------|
| 1 | Memory Injection | Pre-loads your preferences so Claude knows how you work |
| 2 | Reverse Prompting | Makes Claude ask you questions before it starts |
| 3 | Constraint Cascade | Layers instructions one step at a time |
| 4 | Role Stacking | Assigns multiple expert personas for built-in debate |
| 5 | Verification Loop | Forces Claude to critique its own output |

## Memory Injection

Most people start every conversation from zero. They retype preferences, re-explain coding style, re-describe their project. This produces inconsistent results.

Memory injection front-loads context that persists throughout the conversation. You give Claude a working memory of who you are, what you care about, and how you like things done.

**Example prompt:**

```
You are my coding assistant. Remember these preferences:
I use Python 3.11, prefer type hints, favor functional programming,
and always include error handling. Acknowledge these preferences
and use them in all future responses.
```

**Why it works:** LLMs perform significantly better with persistent context about your workflow, style, and constraints. You are giving the model a mental model of you.

**Tips:**

- Go beyond coding preferences. Inject your communication style, audience, industry jargon, and quality bar
- Update your memory injection as your project evolves. Week one context may be outdated by week four
- Stack multiple preference categories: testing philosophy, documentation standards, naming conventions, preferred libraries

<img src="/api/content-image/learning/5-claude-techniques-from-anthropics-internal-playbook-inline-1.png" alt="Memory injection — loading context into a brain" style="max-width: 640px; width: 100%;" />

## Reverse Prompting

Instead of telling Claude what to do, you make Claude tell you what it needs to know before it starts.

You do not always know what you do not know. You miss edge cases. You forget to specify things that seem obvious. Reverse prompting forces the model to think critically about requirements before it produces any output.

**Example prompt:**

```
I need to analyze customer churn data. Before you help,
ask me 5 clarifying questions about my dataset, business context,
and desired outcomes. Do not start until you have all the information.
```

**Why it works:** Claude surfaces assumptions you did not realize you were making. It catches gaps in your brief that would have led to rework.

**Tips:**

- Specify the number of questions. Five for most tasks, ten for complex projects, three for simple ones
- Tell Claude which dimensions to ask about: dataset, business context, success metrics, technical constraints
- After Claude asks and you answer, tell it to summarize its understanding before proceeding. This creates a checkpoint that catches misalignment early

## Constraint Cascade

Giving Claude all your instructions at once produces worse results than layering them progressively. A massive prompt with every requirement overwhelms the model. Important details get lost. Edge cases get deprioritized.

The Constraint Cascade works like progressive training. Start simple, verify understanding, then add complexity.

**Example sequence:**

1. "Summarize this article in 3 sentences." *Wait for response.*
2. "Identify the 3 weakest arguments." *Wait for response.*
3. "Write a counter-argument to each weakness."

**Why it works:** Each step confirms Claude understood correctly before you build on that understanding. Errors do not compound through the chain.

<img src="/api/content-image/learning/5-claude-techniques-from-anthropics-internal-playbook-inline-2.png" alt="Constraint cascade — stacking rules layer by layer" style="max-width: 640px; width: 100%;" />

**Tips:**

- Use each response as a quality gate. If step one is off, correct it before moving to step two
- The cascade works for any complex task: code (signature, then logic, then edge cases, then tests), writing (outline, then arguments, then prose, then editing)
- Number your steps explicitly and reference previous steps to help Claude maintain coherence

## Role Stacking

Single-role prompting is common but limited. When you tell Claude to be a marketing expert, you get a marketing answer with blind spots.

Role stacking assigns multiple expert perspectives simultaneously. These perspectives create natural tension and debate. The output is more nuanced, more thorough, and more resilient to blind spots.

**Example prompt:**

```
Analyze this marketing strategy from three perspectives simultaneously:
a growth hacker focused on virality,
a data analyst focused on metrics,
and a behavioral psychologist focused on user motivation.
Show all three viewpoints.
```

**Why it works:** Complex problems have multiple dimensions. A single expert perspective optimizes for one dimension at the expense of others. Role stacking creates built-in checks and balances.

**Tips:**

- Choose roles that create productive tension, not agreement. A CFO and a Head of Product will see the same proposal very differently
- Specify what each role should focus on. "A CFO focused on unit economics and cash flow runway" is better than just "a CFO"
- After getting multiple perspectives, add: "Synthesize these viewpoints into a single recommendation, noting where they agree and where the tradeoffs are"

## Verification Loop

After Claude generates output, you tell it to critique that output. Then you tell it to fix the problems it found. Simple, but transformative.

Most people take first output at face value. The Verification Loop builds self-correction into the generation process itself.

**Example prompt:**

```
Write a Python function to process user payments.
After writing it, identify 3 potential bugs or edge cases in your code.
Then rewrite the function to fix those issues.
```

**Why it works:** LLMs are often better at evaluating output than generating it perfectly on the first attempt. Separating generation from evaluation catches things that were missed during creation.

<img src="/api/content-image/learning/5-claude-techniques-from-anthropics-internal-playbook-inline-3.png" alt="Verification loop — write, critique, correct" style="max-width: 640px; width: 100%;" />

**Tips:**

- Be specific about what kind of critique you want: security vulnerabilities, edge cases that cause silent failures, concurrent access issues
- Chain multiple verification passes. Two passes catch significantly more issues than one
- Combine with Role Stacking for maximum impact: write code, then critique from a security engineer's perspective, then from a readability perspective, then fix everything

## Putting It All Together

These techniques compound when combined. Here is a real workflow for architecting a new microservice:

1. **Memory Injection** — Set up your tech stack, coding standards, and architectural principles
2. **Reverse Prompting** — Describe the service, then ask Claude to ask 5 clarifying questions about requirements, scale, and integration points
3. **Constraint Cascade** — Start with the API contract, then data model, then business logic, then error handling
4. **Role Stacking** — Review from a distributed systems engineer, a security engineer, and a platform engineer
5. **Verification Loop** — Identify the three biggest risks and propose mitigations

The output from this workflow is categorically different from a single prompt.

## Key Takeaways

- **Memory Injection** eliminates repeated context and produces consistent results across conversations
- **Reverse Prompting** catches gaps in your brief before they lead to rework
- **Constraint Cascade** prevents detail overload by building complexity incrementally
- **Role Stacking** creates built-in debate that catches blind spots
- **Verification Loop** leverages the fact that LLMs evaluate better than they generate
- The real power is in combining all five as a structured workflow