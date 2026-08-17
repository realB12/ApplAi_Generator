# Creating ASP.NET Core 9 backend
Now implement the ASP.NET Core 9 backend to hold the GitHub PAT and hash passwords server-side.

## Context
You are building the **ApplAi Resume Generator** — a single-page React application that helps users generate tailored CVs from a master CV stored as a GitHub Gist.

## Project stauts
The client front-end in the VSC/client folder is already done and runs in the local VS Code setup.   

What is missing is the implementation of the ASP.NET Core 9 backend sourcecode into the VSC/server folder with whatever scaffolding is required to run the Backend (server) together with the frontend (client) from the VS Code Run and Debug Menu. 

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

## ACTIONS
1. Do NOT vibecode yet  

2. Check all the context files first for overall consistency concerning the Backend and report issues.   

3. Make 100% sure, that from the spec.md and tech.md, patterns.md and boundaries.md the client and the server are working together most stable and efficently. When necessary refine the architecture, rules etc. 
 
4. When all issues are clear generate a short description what the Backend is going to do with the architecture it is built and the protocols it is using. 

5. Do the same with all the Authentication process. Explain Authentication to an IT Engineer what EXACTLY is going on here in terms of caching, tokens, securty, where the data is stored and how access rights can be handled and revoked (manually) etc. 

## Critical Rules
- **NEVER** deviate from PATTERNS.md without updating the file first.
- **NEVER** write code that contradicts DECISIONS.md.
- **ALWAYS** use the file naming convention from PATTERNS.md P12.
- **ALWAYS** use TypeScript strict mode.
- **ALWAYS** use Tailwind CSS utility classes (no custom CSS files).
- **ALWAYS** use shadcn/ui components where available.
- **ALWAYS** follow the Zustand + TanStack Query state management approach from TECH.md.
- **ALWAYS** use React Hook Form + Zod for forms (P03).
- **ALWAYS** use the API client pattern from P02 (with 401 refresh logic).
- **ALWAYS** use the Error Handling pattern from P08 (via useMessage hook).
- **ALWAYS** include ScreenBadge on every screen (P01).
- **ALWAYS** use the TreeView component pattern (P05) for the CV hierarchy.
- **ALWAYS** use the Export Flow pattern (P07) for Gist export.
- **ALWAYS** validate all user input with Zod schemas.
- **ALWAYS** handle loading states with Spinner (P10).
- **ALWAYS** handle errors via MessagePopup (SMSG) pattern (P04).