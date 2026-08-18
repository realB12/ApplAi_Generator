# AI Change Implementation Rules

## 1. Protocol Overview
This document governs how AI assistants implement change requests in this repository.  
**Canonical location of this file**: `VSC/client/AI/KIMI/CONFIG/CHANGE_RULES.md`  
**Applies to**: All code modifications triggered by change requests stored the *CHANGES/REQUESTS/CR000*-folder

This standarized CHANAGE_RULES.md file is one of the AI Context files living in the *VSC/client/AI/KIMI/CONFIG folder*-folder, which together specify WHAT the AI is going to build and HOW it is going to build it in terms of tools, processings and underlying architecture and platform and what NOT to build and NOT to do. 

So whenever herein defined rules are applied, they have to do it in the context of the other files and without contradiction to them, unless such contradictions are specified as part of the change to be implemented.

Whereas especially VISION.md, SPEC.md and TECH.md document the status quo about what has finally been built, this CHANGE_RULES.md defines, how ChangeRequests from the [ChangeList](../../../../../CHANGES/_ChangeList.md) shall be safely implemented without putting whatever we already have at risk. 

---

## 2. Pre-Implementation
1. **Read First**: Ingest the specific `CR-nnn-*.md` (Change Request file) and any AI context files in the VSC\client\AI\KIMI\CONFIG it references *before* proposing code.

2. **Confirm Scope**: State the CR ID, title, and the minimal set of files you expect to touch. Flag ambiguities and pause for clarification if acceptance criteria are contradictory or incomplete.
3. **Analyze Impact**: Identify dependencies, but do not broaden the scope beyond the CR.

---

## 3. Core Implementation Rules

### 3.1 Minimal Invasion
- Modify **only** the code necessary to fulfill the request.
- Preserve existing file names, folder structures, export patterns, naming conventions, indentation style, and architectural boundaries.
- Do **not** run global linters/reformatters on untouched files.

### 3.2 Request Scope Enforcement
- **Implement ONLY what is requested** in the current CR.
- If you detect bugs, security issues, performance bottlenecks, or improvement opportunities **outside** the scope:
  - Do **NOT** fix or implement them.
  - Document them in the **Further Improvements** section of your change report.
  - If critical, flag it with ⚠️ and explain the risk, but still refrain from implementing.

### 3.3 Preserve Functionality
- The app must remain **compilable and testable**.
- The local browser launch from VS Code must continue to work without new runtime errors.
- Do not break existing routes, API contracts, component APIs, or UI flows.

### 3.4 Idiomatic Consistency
- Match the existing codebase patterns (state management, error handling, async patterns, CSS methodology).
- When a new reusable pattern (hook, utility, component type) is introduced, update the relevant AI context file under `VSC/client/AI/KIMI/CONFIG/` so future sessions inherit the knowledge.

---

## 4. AI Context Maintenance
- **Add**: If the CR introduces new reusable components, utilities, hooks, types, or build steps, append them to the appropriate context file in `VSC/client/AI/KIMI/CONFIG/`.
- **Update**: If the change renames, deprecates, or alters an existing pattern documented in the AI context, update that context file immediately.
- **Accuracy**: Context files are first-class deliverables; their correctness is as important as code correctness.

---

## 5. Change Report Format
At the end of **every** implementation, provide a report with these exact sections:

### 5.1 Summary
- One paragraph: what was done and why.

### 5.2 Files Modified
| File | Rationale |
|------|-----------|
| `src/...` | Brief reason for the change |

### 5.3 Files Considered but NOT Modified
- List files analyzed but left untouched to prove minimal invasion.

### 5.4 AI Context Files Updated
- List any additions or modifications in `VSC/client/AI/KIMI/CONFIG/`.

### 5.5 Further Improvements (Non-Implemented)
- Bulleted list of observations, refactors, or enhancements detected but explicitly excluded per Rule 3.2.

### 5.6 Verification Steps
- Exact steps to confirm the change works (e.g., *"Run `npm run dev`, navigate to `/settings`, click the new toggle, expect the theme to switch."*).

---

## 6. Boundaries & Prohibitions
- **No secrets**: Never hardcode API keys, passwords, or tokens.
- **No surprise dependencies**: Do not add new npm/packages or CDN imports unless the CR explicitly permits it. If unavoidable, list the dependency in your report and pause for human confirmation.
- **No silent deletions**: Do not delete files without confirming they are unused. Prefer deprecation comments over deletion if uncertain.

---

## 7. Prompt Interaction
When a user points you to a change request, your first response must confirm:
1. The **CR ID and title** you are processing.
2. The **primary files** you expect to touch.
3. Any **ambiguities** that need clarification before you begin coding.