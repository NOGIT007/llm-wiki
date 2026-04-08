---
title: "AI Security"
type: concept
created: 2026-04-07
updated: 2026-04-07
sources:
  - "[[src-6-ai-security-realities]]"
  - "[[src-ai-literacy-program]]"
tags:
  - security
  - risk
  - compliance
---

# AI Security

Security risks introduced by deploying AI systems in organizations. These are not theoretical — they are active, exploitable, and largely under-addressed.

## Six Realities

1. **Risk classification** — Not all AI use cases carry the same risk. A chatbot summarizing public docs differs fundamentally from an agent with database access. Classification must precede deployment.
2. **Shadow AI** — Employees using unsanctioned AI tools, feeding proprietary data into public models without oversight. The AI equivalent of shadow IT, but faster-moving.
3. **Prompt injections** — Adversarial inputs that hijack model behavior. Indirect injection (hidden instructions in retrieved documents) is especially dangerous for agent workflows.
4. **Agents as digital insiders** — An [[AI Agents|AI agent]] with tool access has the same threat profile as an employee: it can exfiltrate data, modify systems, and make unauthorized decisions.
5. **AI-driven fraud** — Deepfakes, synthetic identities, and AI-generated phishing at scale. The cost of producing convincing fraud drops toward zero.
6. **Hallucination liability** — When AI generates false information that gets acted on, who is legally responsible? [[Hallucinations]] become a legal and financial risk, not just a quality issue.

## Compliance Landscape

The EU AI Act establishes risk tiers and mandatory requirements. OWASP publishes AI-specific threat models. Organizations need both technical controls and governance frameworks.

See also: [[Hallucinations]], [[AI Agents]], [[Verification]].
