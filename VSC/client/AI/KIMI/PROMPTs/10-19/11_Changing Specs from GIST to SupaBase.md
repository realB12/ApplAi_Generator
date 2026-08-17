## Context
You are building the **ApplAi Resume Generator** — a single-page React application that helps users generate tailored CVs from a master CV stored as a GitHub Gist.

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

## What I need
1. In the current context files the so far not explicitely defined User Authentication/Login must NEW be against SupaBase User Acounts (the users have created by themselves).   

2. JSON upload, read and download is no longer against a GIST (OLD) but now (NEW) against a Users Supabase Bucket/Folder where the Bucket is named "Applai" and the folder in it is called "SuperCV". 

"SuperCV" is the folder into which the user will upload SuperCV Masterfiles files manually (outside) the App (Its only in a next stage, that the App provides functionality to upload such SuperCV.json files from within the application).

## Action 
Update all Context Files to reflect  

1. **Authentication** against Supabase Credentials (e.g. when my Supabase UserID is "realB12" and my Password is "!something-Kajal" then the Applai-Generator allows Login with "realB12" and my Password is "!something-Kajal" too resp. it allows such login because these credentials are valid SupaBase Credentials. 

2. Replace what ever functionality, errorhandling and configuration was mapped to a GIST (OLD) to new the SupaBase hosted "SuperCV" folder in the "Applai* Busket.

Provide only the updated Context Files with comments where they have been updated (what was taken out and what has been taken in instead). 

