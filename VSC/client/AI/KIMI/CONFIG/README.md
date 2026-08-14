# docs/

This folder contains the **AI Context Layer** — the structured documentation that eliminates guesswork and minimizes reprompting when using AI-assisted development (vibecoding).

## Files Overview

| File | Purpose | When to Update |
|------|---------|--------------|
| `VISION.md` | The "Why" — product vision, target audience, success criteria | Rarely — only when product direction changes |
| `SPEC.md` | The "What" — features, user stories, acceptance criteria, edge cases | Every new feature or spec change |
| `TECH.md` | The "How" — stack, architecture, data model, API contracts, decisions | When tech changes or new patterns emerge |
| `BOUNDARIES.md` | The "Don't" — constraints, forbidden patterns, scope limits | When constraints change |
| `PATTERNS.md` | The "Template" — reusable code patterns, conventions | When new patterns crystallize |
| `DECISIONS.md` | The "Why (architectural)" — ADRs explaining key choices | Per significant architectural decision |
| `SESSION.md` | The "Now" — current work, blockers, next steps | **After every coding session** |

## Quick Start for AI Sessions

When starting a new AI-assisted coding session, provide these files in this order:

```
1. VISION.md     (always)
2. TECH.md       (always)
3. BOUNDARIES.md (always)
4. SPEC.md       (relevant sections only)
5. PATTERNS.md   (when implementing a known pattern)
6. SESSION.md    (always — for continuity)
```

## Golden Rules

1. **Never let the AI update TECH.md or BOUNDARIES.md without explicit approval.**
2. **Always update SESSION.md before ending a session.** This is your memory across days.
3. **Commit these docs with your code.** They live in the repo, not on your local machine.
4. **Be specific in SPEC.md.** Vague specs = reprompting. Exact acceptance criteria = one-shot implementation.
5. **When the AI suggests something not in PATTERNS.md**, add it to PATTERNS.md after validation.

## Example Session Prompt

```
We are working on [Project Name]. Here is the current context:

[VISION.md content]
[TECH.md content]
[BOUNDARIES.md content]
[SESSION.md content]

Today's goal: Implement [Feature ID] from SPEC.md.

Before writing code:
1. Review the existing codebase structure
2. Check PATTERNS.md for relevant templates
3. Follow all rules in BOUNDARIES.md
4. Update SESSION.md when done
```
