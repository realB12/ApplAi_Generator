# Change Request Template
---

> FileName: **[CRnnn-German Case Title](CRnnn-German%20Case%20Title.md)**

---

## Intro Section to be deleted in the final Prompt


### Purpose of this CR file
This Change Request is the Basis for the Change-Prompt (located in the [_AI Prompts](../../../VSC/client/AI/KIMI/PROMPTs/_AI%20Prompts.md)) that finally implements the here-in requested change, followed by updating the context-files, this CR-file and eventually logfiles such as the CR Status in the [ChangeList](../../_ChangeList.md). 

### Naming Conventions
The filename follows the convention [CR-nnn-YYMMDD-German Case Title] where 
* **nnn** is a sequence number starting with 001, followed by 002, ...
* **German Case Title** means that all nouns start with a Capital letters and all other word with lowercase. 

### Links
* The **[CRnnn-German Case Title](CRnnn-German%20Case%20Title.md)**
* The **[ChangeList](../../_ChangeList.md)**
* [Change Handling **Guidelines**](../../../DEV_GUIDEs/ChangeHandling/_ApplAI_Change%20Handling.md)
* The GENERIC [CHANGE RULES](../../../VSC/client/AI/KIMI/CONFIG/CHANGE_RULES.md) Contex Files with the Rules how all kind or Change Requests shall be handled by the AI. 

<span style="color:red; font-weight:bold">Attention</span>: **Delete this "Intro Section"** in the final AI Prompt! It is just a reminder for documentation purpose but might confuse the AI!

---

# [Short, imperative title: e.g., "Add CSV export button to results table"]

## 1. Context & Goal
<!-- Why is this change needed? Link to issues, discussions, or user feedback. -->
- **Problem / Opportunity**: ...
- **Goal**: One-sentence outcome.

## 2. Current State
<!-- How does it work now? Include file paths or code snippets if helpful. -->
- ...

## 3. Desired State
<!-- What should the outcome look like? Be specific and visual where possible. -->
- ...

## 4. Acceptance Criteria
<!-- Concrete, testable checklist. The AI must verify these before finishing. -->
- [ ] Criterion 1: ...
- [ ] Criterion 2: ...
- [ ] The WebApp compiles without errors from VS Code.
- [ ] The local browser launch works and shows the expected change.
- [ ] No existing unrelated functionality is broken.

## 5. Boundaries & Constraints
<!-- Hard limits to prevent over-engineering. -->
- **Do NOT change**: ...
- **Preserve**: existing styles, API contracts, state management patterns.
- **Tech limits**: No new npm packages unless explicitly approved here.

## 6. Affected Scope (Optional)
<!-- If known, list likely files. If unknown, leave for AI analysis. -->
- Suspected files: `src/components/...`, `src/utils/...`
- AI Context files to review: `VSC/client/AI/KIMI/CONFIG/...`

## 7. References
<!-- Links to docs, similar implementations, design files, or related PRs. -->
- ...

## 8. Notes / Open Questions
<!-- Anything else. The AI should flag these if they block implementation. -->
- ...


---

# Filled in Examples
Check the following real-life Change-Requests as examples: 


