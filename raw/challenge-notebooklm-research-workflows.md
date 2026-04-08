---
title: "NotebookLM Research Workflows"
description: "Turn academic papers and articles into structured insights, audio summaries, and visual outputs with NotebookLM"
date: "2026-02-26T14:08"
author: "Morten Andre Nilsson"
section: usecases
technology: "NotebookLM"
subject: "Workflow"
slug: challenge-notebooklm-research-workflows
tags: []
draft: true
image: gs://et-cms-content-prod-etai-cm/images/learn/challenge-notebooklm-research-workflows-hero.jpg
---

# Creating a Research Workflow with NotebookLM: A Practical Guide

This guide explains how to use NotebookLM to turn academic papers or articles into structured insights, audio summaries, and visual outputs. The goal is to help you organize research efficiently—whether for a literature review, policy analysis, or competitive research—without needing technical expertise.

NotebookLM is a tool that analyzes documents you upload and generates responses based on their content. It can summarize findings, compare sources, and create outputs like tables or infographics. This guide focuses on a workflow that:
1. **Reduces manual effort** by automating summaries and comparisons.
2. **Improves clarity** by presenting information in multiple formats (text, audio, visuals).
3. **Ensures accuracy** by grounding responses in your source material.

You’ll need:
- A Google account with access to NotebookLM ([notebook.google.com](https://notebook.google.com)).
- 2–3 research papers or articles on a topic of your choice (PDFs or web links).
- **Time**: 90–120 minutes. The steps build on each other, so it’s best to complete them in order.

---

## Step 1: Set Up Your Research Notebook
**What this does**: Creates a workspace where NotebookLM can analyze your documents.
**Why it matters**: Uploading sources lets the tool reference them directly in responses, ensuring accuracy.

1. Go to [notebook.google.com](https://notebook.google.com) and sign in.
2. Click **"New notebook"** (top-left corner) and name it something specific, like *"Research: [Your Topic] – [Date]"*. Example: *"Research: Renewable Energy Storage – June 2024"*.
3. Upload your documents:
   - Click the **"+"** button in the left panel.
   - Select **"Upload"** for PDFs or **"Website"** for online articles.
   - Wait for the files to process (this may take a minute). A green checkmark will appear next to each source when it’s ready.

**What to expect**:
- Your sources will appear in the left panel under "Sources."
- If a document fails to upload, try converting it to a PDF or checking for formatting issues (e.g., scanned images may not work well).

---

## Step 2: Configure How NotebookLM Responds to You
**What this does**: Sets rules for how the tool analyzes and presents information.
**Why it matters**: Without guidance, NotebookLM’s responses can be generic. Custom instructions ensure consistency and depth.

1. Click the **gear icon (⚙️)** in the top-right corner to open Settings.
2. In the **"Custom Instructions"** field, paste the following prompt. This tells NotebookLM to:
   - Start with a concise summary.
   - Include citations so you can verify claims.
   - Highlight disagreements between sources.
   - End with questions to guide further research.

   ```
   You are an expert research analyst. When responding to queries:
   1. Start with a 2-sentence executive summary.
   2. Provide detailed analysis with specific citations [Source X, Page Y].
   3. Identify conflicting viewpoints between sources when they exist.
   4. End with 2 open questions for further exploration.
   5. Label source types (academic paper, news article, etc.).
   6. Never speculate beyond what the sources contain.
   ```

3. Click **"Save"**.

**What to expect**:
- The instructions will appear in the Settings panel. You can edit them later if needed.
- These rules apply to all responses in this notebook unless you change them.

**Troubleshooting**:
- If responses ignore your instructions, check for typos or rephrase them more explicitly (e.g., "Always include citations like [Source 1, Page 5]").
- NotebookLM may occasionally deviate from instructions if a question is too vague. Be specific in your queries (e.g., "Compare the methodologies in Source 1 and Source 2").

---

## Step 3: Test Your Research Assistant
**What this does**: Checks if your custom instructions are working.
**Why it matters**: A quick test helps you adjust the instructions before diving deeper.

In the chat interface, ask:
> *"What are the 3 most important findings across all my sources, and where do they conflict?"*

**What a good response looks like**:
- A short summary at the top (e.g., "This research highlights three key trends: X, Y, and Z. Sources 1 and 2 agree on X but disagree on Y’s implications.").
- Citations like *[Source 1, Page 3]* or *[Source 2, Section 4.2]*.
- Labels for each source (e.g., "Source 1: Academic paper (2023)").
- Open questions at the end (e.g., "How might future studies address the gap in data on Y?").

**If the response is unclear**:
- Rephrase your question (e.g., "Summarize the top 3 findings, then list any disagreements between sources").
- Edit your custom instructions to be more specific (e.g., "Always list disagreements in bullet points").

---

## Step 4: Create a Comparison Table
**What this does**: Organizes key findings from your sources into a structured format.
**Why it matters**: Tables make it easier to spot patterns, contradictions, or gaps in the research.

1. Click **"Studio"** in the top toolbar (next to "Chat").
2. Select **"Data Table"**.
3. In the prompt box, paste this request. It asks for a table with columns that compare:
   - The finding itself.
   - Which source it comes from.
   - The methodology used.
   - Limitations or criticisms.
   - Suggestions for future research.

   ```
   Create a comparison table with these columns:
   - Key Finding
   - Source (with citation)
   - Methodology Used
   - Limitations/Criticisms
   - Future Research Directions
   Include one row for each major finding from my sources.
   ```

4. Click **"Generate"**.

**What to expect**:
- A table with rows for each finding. NotebookLM may group similar findings or split complex ones into multiple rows.
- If the table is too long, ask for a condensed version (e.g., "Show only the 5 most significant findings").

**Exporting the table**:
- Click the **"Export"** button (top-right of the table) and select **"Google Sheets"**. This lets you edit or share the table later.

**Troubleshooting**:
- If the table is messy, try simplifying the prompt (e.g., "Create a table comparing the main findings and methodologies").
- For large documents, NotebookLM might miss details. You can ask follow-up questions like, "Did Source 1 mention any limitations not included in the table?"

---

## Step 5: Generate an Audio Summary
**What this does**: Converts your research into a spoken overview.
**Why it matters**: Audio summaries are useful for reviewing research while commuting or multitasking. They can also highlight nuances that are easy to miss in text.

1. In the Studio panel, click **"Audio Overview"**.
2. Select the **"Critique"** format. This focuses on evaluating the research rather than just summarizing it.
3. Customize the audio:
   - **Language**: Choose your preferred language.
   - **Length**: Select **"Default"** (usually 3–5 minutes).
   - **Custom focus**: Paste this to guide the discussion:
     > *"Focus on methodological strengths and weaknesses, and identify gaps in the current research."*
4. Click **"Generate"** and wait 2–3 minutes.

**What to expect**:
- A podcast-style discussion that:
  - Explains key findings.
  - Critiques the methods used in your sources (e.g., sample size, bias, data quality).
  - Points out unanswered questions or areas needing more research.
- The tone is professional but conversational, like a colleague explaining the research to you.

**Downloading the audio**:
- Click the **download icon (↓)** to save the file as an MP3.

**Troubleshooting**:
- If the audio is too long, select **"Brief"** format (1–2 minutes) instead.
- If it lacks depth, edit the custom focus to be more specific (e.g., "Compare the methodologies in Source 1 and Source 2, then discuss their limitations").

---

## Step 6: Create a Visual Research Summary
**What this does**: Turns your research into an infographic.
**Why it matters**: Visuals help communicate complex ideas quickly, especially in presentations or reports.

1. In the Studio panel, select **"Infographic"**.
2. Choose:
   - **Orientation**: **"Portrait"** (better for slides or reports).
   - **Detail level**: **"Detailed"** (includes more information).
3. In the custom prompt box, paste this request. It specifies the style and content:

   ```
   Create a clean, academic-style infographic showing the research landscape on my topic.
   Use a professional blue and white color scheme with clean typography.
   Include:
   - Key findings (bullet points or short phrases).
   - Methodological approaches (e.g., surveys, experiments, case studies).
   - Research gaps (unanswered questions or limitations).
   ```

4. Click **"Generate"**.

**What to expect**:
- An infographic with:
  - A title (e.g., "Research Landscape: [Your Topic]").
  - Sections for findings, methods, and gaps.
  - Icons or simple graphics to illustrate points.
- The design is minimal and professional, suitable for reports or presentations.

**Downloading the infographic**:
- Click the **download icon (↓)** and select **"PNG"**.

**Troubleshooting**:
- If the infographic is cluttered, ask for a simpler version (e.g., "Show only the 3 most important findings").
- If the colors or layout don’t fit your needs, specify changes in the prompt (e.g., "Use a green and gray color scheme").

---

## Step 7: Connect to Gemini for Extended Analysis
**What this does**: Links NotebookLM to Gemini, another AI tool, to expand on your research.
**Why it matters**: Gemini can help synthesize insights, draft new content, or explore questions beyond your original sources—while still grounding responses in your research.

1. Open a new tab and go to [gemini.google.com](https://gemini.google.com).
2. Click **"Gems"** in the left sidebar, then **"Create a gem"**.
3. Name it something clear, like *"Research Synthesizer"*.
4. Paste this instruction. It tells Gemini to:
   - Use your NotebookLM research as a foundation.
   - Cite sources when answering questions.
   - Note when it’s making inferences (not just repeating the sources).

   ```
   You are a research synthesis expert. Use NotebookLM to access grounded research data, then help users create new content based on verified sources. Always:
   - Cite your sources (e.g., [Source 1, Page 5]).
   - Note when you're making inferences beyond the source material.
   ```

5. Connect your NotebookLM notebook:
   - Click **"Add tools"** (under the instructions).
   - Select your notebook from the list (e.g., *"Research: Renewable Energy Storage"*).

**What to expect**:
- Gemini can now reference your NotebookLM sources when answering questions.
- Responses will include citations and distinguish between facts (from your sources) and inferences (Gemini’s analysis).

**Troubleshooting**:
- If Gemini doesn’t cite sources, remind it in your question (e.g., "Based on my NotebookLM research, summarize the findings and cite specific sources").
- If the connection fails, check that your notebook is shared with the same Google account.

---

## Step 8: Test the Integrated Workflow
**What this does**: Uses Gemini to build on your NotebookLM research.
**Why it matters**: This step shows how the two tools can work together to create new outputs (e.g., summaries for non-experts).

In your Research Synthesizer Gem, ask:
> *"Based on my NotebookLM research, write a 200-word executive summary for a non-academic audience. Then suggest 3 practical applications of these findings."*

**What a good response looks like**:
- A summary that avoids jargon and explains key points in simple terms (e.g., "This research shows that X is effective, but Y remains a challenge").
- Citations like *[Source 1, Page 3]* to show where the information comes from.
- Practical applications that are realistic and specific (e.g., "Policy recommendation: Governments could use these findings to design incentives for Z").

**If the response is off-track**:
- Rephrase the question to be more specific (e.g., "Write a summary for policymakers, focusing on actionable insights").
- Ask Gemini to revise its response (e.g., "Rewrite the summary to be shorter and more direct").

---

## Step 9: Create a Follow-Up Audio on Research Gaps
**What this does**: Generates a short audio summary of unanswered questions in your research.
**Why it matters**: Highlighting gaps helps prioritize next steps for your work or future research.

1. Return to NotebookLM Studio.
2. Click **"Audio Overview"**.
3. Select the **"Brief"** format (1–2 minutes).
4. In the custom focus field, paste:
   > *"What questions does this research leave unanswered, and what should researchers investigate next?"*
5. Click **"Generate"**.

**What to expect**:
- A concise audio (1–2 minutes) that:
  - Lists the biggest unanswered questions.
  - Suggests directions for future research (e.g., "More studies are needed on X, particularly in Y context").
- This is useful for planning your own follow-up work or identifying opportunities for collaboration.

**Downloading the audio**:
- Click the **download icon (↓)** to save the MP3.

---

## Step 10: Export and Organize Your Research Package
**What this does**: Saves all your outputs in one place for easy reference.
**Why it matters**: Organizing your work ensures you can revisit or share it later without redoing steps.

1. Create a folder on your computer or Google Drive named *"Research: [Your Topic] – [Date]"*.
2. Save the following files:
   - **Comparison table**: Export from Google Sheets as a PDF or Excel file.
   - **Infographic**: Download as a PNG.
   - **Audio overviews**: Save as MP3 files (label them, e.g., *"Critique_Audio.mp3"* and *"Gaps_Audio.mp3"*).
   - **Chat responses**: Take screenshots of the most useful responses (e.g., the test in Step 3 or the Gemini summary in Step 8). Save them as PNGs or PDFs.
3. (Optional) Add a text file with notes, such as:
   - Key takeaways from your research.
   - Questions you still have.
   - Ideas for next steps.

**What to expect**:
- A complete package with all your outputs in one place.
- Files are labeled clearly so you can find them later.

---

## Success Criteria
Your workflow is working well if:
✅ **Custom instructions are followed**: Responses include executive summaries, citations, and open questions. If they don’t, revisit Step 2 to refine your instructions.
✅ **Multiple output formats exist**: You’ve created at least one data table, audio overview, and infographic from the same sources. If any format is missing, repeat the relevant step.
✅ **Gemini integrates with NotebookLM**: Gemini can reference your sources and cite them correctly. If it doesn’t, check the connection in Step 7.

---

## Next Steps
### Adapting the Workflow for Other Projects
This process isn’t just for academic research. You can use it for:
- **Competitive analysis**: Upload reports or articles about competitors, then compare their strategies, strengths, and weaknesses.
- **Policy research**: Analyze government documents or think tank reports to identify trends, gaps, or conflicting recommendations.
- **Literature reviews**: Summarize and compare findings from multiple papers to identify consensus or debates in a field.

**Example adjustments**:
- For competitive analysis, replace the comparison table columns with: *"Company"*, *"Strategy"*, *"Strengths"*, *"Weaknesses"*, *"Market Position"*.
- For policy research, focus the audio summary on: *"Key policy recommendations and their evidence base"*.

### Troubleshooting Common Issues
| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| NotebookLM ignores custom instructions | Instructions are too vague or conflicting | Simplify the prompt (e.g., "Always start with a 2-sentence summary"). |
| Audio overview is too long | "Default" length is selected | Choose "Brief" format (1–2 minutes). |
| Infographic is cluttered | Too many details included | Ask for a simpler version (e.g., "Show only the top 3 findings"). |
| Gemini doesn’t cite sources | Connection to NotebookLM isn’t working | Reconnect the notebook in Step 7. |
| Sources aren’t processing | File format issues (e.g., scanned PDFs) | Convert files to text-based PDFs or use web links. |

### Reflecting on the Process
Consider these questions to improve your workflow:
1. **Which output format was most useful?**
   - Did the table help you compare sources more easily than reading the papers?
   - Did the audio summary reveal insights you missed in the text?
   - Did the infographic simplify complex ideas for presentations?

2. **What worked well in your custom instructions?**
   - Did the requirement for citations make responses more reliable?
   - Did the open questions at the end help you think of next steps?
   - Did the executive summary save you time?

3. **How could you refine the process for future projects?**
   - Would you spend more time on certain steps (e.g., crafting better prompts)?
   - Could you automate parts of the workflow (e.g., using templates for tables)?
   - What other tools or formats would be helpful (e.g., slide decks, interactive charts)?

---

## Final Notes
- **NotebookLM’s limitations**: It works best with clear, well-structured sources. If your documents are poorly formatted (e.g., scanned images), the tool may miss details.
- **Human review is essential**: Always cross-check outputs with your sources. NotebookLM can make mistakes, especially with complex or ambiguous information.
- **Iterate**: This workflow is a starting point. Adjust prompts, formats, or steps based on what works for your specific project.