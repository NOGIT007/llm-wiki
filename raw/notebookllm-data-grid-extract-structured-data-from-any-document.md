---
title: "NotebookLLM Data Grid: Extract Structured Data from Any Document"
description: "Turn invoices, contracts, and statements into clean spreadsheet-ready tables using NotebookLLM prompts."
date: "2026-04-02T10:24"
section: usecases
template: presentation
mood: auto
embed_url: /usecases/notebookllm-data-grid-extract-structured-data-from-any-document/notebookllm-data-grid-extract-structured-data-from-any-document-presentation.html
technology: "NotebookLM"
subject: "Quick Win"
author: kennet.dahl.kusk@visma.com
draft: true
image: "gs://et-cms-content-prod-etai-cm/images/usecases/notebookllm-data-grid-extract-structured-data-from-any-document-hero.png"
---
**Most people use NotebookLLM to ask questions. You should be using it to build structured data.**

The NotebookLLM Data Grid isn't a feature — it's a discipline. Define columns, rows, and edge cases with surgical precision, and unstructured prose surrenders to rigid Markdown tables.

## Invoices, contracts, and statements all share the same problem

Data doesn't live in tables. It's trapped in paragraphs, footnotes, and fine print. Invoices, bank statements, contracts — the information you need is buried in prose, and copy-pasting it manually is how errors happen.

The Data Grid pattern forces extraction into a format that Excel, Google Sheets, and databases can consume directly. You're not summarizing documents. You're evoking structure from them.

Three levels. Three outcomes.

- **Extraction:** One document → one row of data
- **Reconciliation:** Compare Source A against Source B
- **Probabilistic:** Assign confidence scores to uncertain matches

<img src="/api/content-image/usecases/notebookllm-data-grid-extract-structured-data-from-any-document-inline-1.png" alt="Data Grid pattern transforming unstructured documents into structured tables" style="max-width: 640px; width: 100%;" />

## The baseline prompt: turn PDFs into rows

The foundational skill. Upload your invoice documents and run this prompt exactly:

```
Review all uploaded invoice documents. Create a Data Grid containing:

Date (YYYY-MM-DD) | Invoice Number | Vendor Name | Total Amount (numeric) | Currency | Net Amount | Tax Amount | Line Item Count

If a value is missing, write "NULL". List every invoice individually.
```

The output lands as a Markdown table ready to paste into any spreadsheet:

| Date | Invoice Number | Vendor Name | Total Amount | Currency | Net Amount | Tax Amount | Line Items |
|---|---|---|---|---|---|---|---|
| 2024-03-01 | INV-0042 | Acme Corp | 1190.00 | USD | 1000.00 | 190.00 | 3 |
| 2024-03-04 | INV-0043 | NULL | 550.00 | EUR | 500.00 | 50.00 | 1 |

NULL handling is not optional. Specify it, or the model fills gaps with plausible-sounding hallucinations.

## Bank reconciliation: where the real complexity lives

Deposits rarely match invoices one-to-one. Customers pay in lump sums with cryptic descriptions — "ACH TFR SMITH LLC" is not the same string as "Smith Consulting Group", but it's the same entity. The model needs explicit rules to bridge that gap.

```
Act as a Financial Controller. Compare deposits in Bank Statement against Outstanding Invoices.

Create a Reconciliation Data Grid:
Bank Date | Bank Description | Deposit Amount | Matched Invoice #(s) | Counterparty Name | Match Type | Discrepancy Note

Matching Rules:
- Many-to-One: Single deposit = sum of multiple invoices
- One-to-Many: Multiple payments = installments on one invoice
- Name Matching: Cross-reference Bank Description against Customer/Supplier names
```

| Bank Date | Bank Description | Deposit Amount | Matched Invoice #(s) | Counterparty | Match Type | Discrepancy Note |
|---|---|---|---|---|---|---|
| 2024-03-05 | ACH TFR SMITH LLC | $1,500.00 | INV-0039, INV-0040 | Smith Consulting Group | Many-to-One | Name variant matched |
| 2024-03-07 | WIRE PMT ACME | $400.00 | INV-0042 | Acme Corp | One-to-Many | Partial installment |

The Discrepancy Note column does the work your auditor would otherwise do manually.

## Probabilistic classification: confidence scores for messy data

When data is ambiguous, don't ask for a definitive answer. Ask for a confidence score and force the model to flag its own uncertainty.

```
Analyze expenses in Bank Statement. Assign each to a GL Category.

Create a Data Grid with Confidence:
Transaction Description | Predicted GL Category | Confidence (0-100%) | Reasoning

Logic:
- 100%: Known vendors (Delta = Travel)
- 60-80%: Ambiguous (Amazon could be Office Supplies OR Equipment)
- <50%: Generic (Check #504)

Flag "REVIEW NEEDED" for Confidence < 70%.
```

| Transaction Description | Predicted GL Category | Confidence | Reasoning |
|---|---|---|---|
| DELTA AIRLINES 00423 | Travel | 100% | Known airline vendor |
| AMAZON MKTPL 9X3K | Office Supplies | 65% | REVIEW NEEDED — could be Equipment |
| CHECK #504 | Uncategorized | 40% | REVIEW NEEDED — no vendor signal |

This is cognitive offloading done right. You handle the flagged rows. The model handles everything else.

## Three exercises that test whether your prompt actually works

- **The Broken Invoice:** Upload a clean invoice plus one with a smudged total. Does the model hallucinate a number or return NULL? Refine with: *"If illegible, output UNCLEAR."*
- **The Combined Payment:** One bank deposit of $1,500, three $500 invoices from the same client. Test many-to-one matching against a real edge case.
- **The Policy Auditor:** Upload a travel policy (max $50 meals) plus a credit card statement. Add a TRUE/FALSE column for policy violations.

## The checklist before you run any Data Grid prompt

- Explicit columns defined
- Row definition clear ("one row per transaction")
- NULL handling specified
- Format constraints set (dates as YYYY-MM-DD, currencies as numeric)
- Edge cases named before the model encounters them

The Data Grid isn't about extraction. It's about control. Define the rules, and the chaos obeys.

**Start with one invoice, one prompt, one table — then scale to every document in your workflow.**