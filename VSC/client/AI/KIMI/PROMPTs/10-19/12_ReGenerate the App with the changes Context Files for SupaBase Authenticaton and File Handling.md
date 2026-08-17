# ReGenerate the App with the changed Context Files for SupaBase Authenticaton and File Handling

# 1. Checking for Consistency

```plaintext
## Context
In the below mentioned Context Files Authentication and all reading and writing JSON-files has switched to SupaBase Authentication and Baskets (see Details in Vision.md, Tech.md and Spec.md

## Action
1. Read VISION.md, SPEC.md, TECH.md, BOUNDARIES.md, PATTERNS.md, DECISIONS.md and SESSION.md from https://github.com/realB12/ApplAi_Generator/tree/main/VSC/client/AI/KIMI/CONFIG.
2. Check their quality and make sure they are consistent, do not have gaps and are not contradicting one another.
3. Tell me what needs to be fixed and improved in these files so that upgrading the app upon these changed context files goes smoot.

Do not commmit the changes yet.
```


# 2. Implement the Change

```plaintext
## Context
You are UPDATING the **ApplAi Resume Generator** — a single-page React application that helps users generate tailored CVs from a master CV stored as a GitHub Gist.

## Repository to be used
My Project Repository is on a public Github with URL = https://github.com/realB12/ApplAi_Generator/tree/main

## Mandatory Context Files
The AI Context/Configuration Files for VibeCoding are found in https://github.com/realB12/ApplAi_Generator/tree/main/VSC/client/AI/KIMI/CONFIG: 

Before writing ANY code, read these files in this order
1. VISION.md — Product vision and acceptance criteria
2. SPEC.md — Functional specification (screens, components, state, API)
3. TECH.md — Technical stack and architecture
4. BOUNDARIES.md — Scope constraints (IN/OUT)
5. DECISIONS.md — Architecture decisions and rationale
6. PATTERNS.md — Reusable code patterns (MUST follow exactly)
7. SESSION.md — Session workflow and phase rules

## Action
From the above mentioned Context Files identify the changes required for Switching 
1. from former Authenticattion to Supabase Authenticatino
2. from GISTs to handling all JSON read and write activites with Supabase   
3. Adjust the Settings Panel for setting the name of the Supabase's default Basket (currently "Applai" and SuperCV.json-file. 

## What needs to be taken care
1. Only change what really is required fore changing the authenticaton and json-file handling. Do not change the user interactin, navigation, design, functionality etc. when not really  required. Do not change scaffolding stuff so that the application after the change compiles and runs in the VS Code setup as before. 

2. Do not assume and hallucinate. When in doubt stop execution and ask for clarification. Do not do additional stuff that is not explicitely mentiond in the context files.
```


