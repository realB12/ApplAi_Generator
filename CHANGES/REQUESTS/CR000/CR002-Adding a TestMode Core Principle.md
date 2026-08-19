# CR002: Adding Test-Mode functionality

* The **[CRnnn-German Case Title TEMPLATE file](CR-nnn-YYMMDD-German%20Case%20Title.md)**

* The **[ChangeList](../../_ChangeList.md)**

* [Change Handling **Guidelines**](../../../DEV_GUIDEs/ChangeHandling/_ApplAI_Change%20Handling.md)

* The GENERIC [CHANGE RULES](../../../VSC/client/AI/KIMI/CONFIG/CHANGE_RULES.md) Contex Files with the Rules how all kind or Change Requests shall be handled by the AI. 

<span style="color:red; font-weight:bold">Attention</span>: **Delete this "Intro Section"** in the final AI Prompt! It is just a reminder for documentation purpose but might confuse the AI!

<- inspired by DEVLOGS [Change 260818](../../../DEV_LOGs/2608/Change_260818.md) file

* [TestMode Concept](../../../DEV_GUIDEs/Architecture/TestMode-Concept.md) this CR is meant to implement


---

## 1. Context & Goal
For efficiently live end-user testing and maintaining I should be able to switch the App into some kind of TestMode, where then certain functionality will be different from Production Mode. This includes: 

1. Prefilling input-data with static values (for instance for the Authentication Screen). 

2. Display additional information (such as more detailed error-messages, internal messaging, debug infos, etc. ) 

## 2. Current State
Currently the app does not understand TestMode and does not provide any TestFeatures. 

I have draftet a TestMode-Implementation concept you must get from my GitHub Repo on https://github.com/realB12/ApplAi_Generator/blob/main/DEV_GUIDES/Architecture/TestMode-Concept.md and read it as a specification for implmenting this change.

## 3. Desired State
Have the [TestMode Concept](https://github.com/realB12/ApplAi_Generator/blob/main/DEV_GUIDES/Architecture/TestMode-Concept.md) fully implemented. 

## Final Prompt
-> Find the final Prompt in the PROMPTS Folder ->  [16_CR002_TestMode Implementation](../../../VSC/client/AI/KIMI/PROMPTs/10-19/16_CR002_TestMode%20Implementation.md)

This prompt was executed August 19th, 2026. 

----



# Implementation RESULTS & IMPACT
The follwing Files/Folders are relevant to TestMode implementation:  

## Change Summary
Added a central **config/testmode.ts module** implementing the three-layer TestMode gate (production hard-gate → .env.local default → ?test=1/localStorage override) with granular sub-flags. 

Wired auth-prefill into LoginPopup.tsx (dynamic-imported placeholder fixture) and verbose debug logging into apiErrorHandler.ts via a new leveled logger.ts. tsc --noEmit, eslint, and npm run build all pass cleanly.

## Verification Steps
1. Copy the additional TestMode setting from the VibAugmented *.env.example* to your untouched *.env.local* and populate UserMail and PW with Authentication values you have setup in teh Supabase.
2. Before testing, run run *npm run dev*, 
3. Open http://localhost:3000/?test=1 — the login form should prefill automatically. 
4. Without ?test=1 (or VITE_TESTMODE=yes), fields stay empty. 

Remember: In a production build, TestMode can't be enabled even with the URL param. This was built on purpose.

## NEW Files added to the structure

* src/features/auth/components/**LoginPopup.tsx**: Prefill form via reset() when TestMode + authPrefill are on

* src/lib/**apiErrorHandler.ts**: Adds log.debug in TestMode; existing show() behavior unchanged

* src/**.env.example**: documents the 4 new optional TestMode vars

* AI/KIMI/CONFIG/**PATTERNS.md**	New P18 — TestMode Pattern
* AI/KIMI/CONFIG/**SESSION.md**	Session log entry

And the TECH doc's **project structure diagram** is changed as follows:

```plaintext
src/                       # The sourcecode that finally makes the product
  ├─ config/               # App-wide config, incl. TestMode  
  |   ├── testmode.ts      # TestMode single source of truth (Layer 0/1/2 resolution)
  |   └── testFixtures.ts  # Dynamic-imported-only TestMode fixtures (never static prod import)
  └─ utils/                # Global standalone utilities  
      └── logger.ts        # Leveled logger gated by config/testmode.ts's logLevel
```

## NEW TestMode Paramter ADDED in .env.local
The following, TestMode specific **global environment variables** were added to the .gitignored .env.local file with a note that all four are structurally inert outside dev builds: 

* VITE_TESTMODE=yes ,
* VITE_TEST_LOG_LEVEL=debug,
* VITE_TEST_AUTH_PREFILL=yes,
* VITE_TEST_DEBUG_PANEL=yes

```plaintext
# TestMode (dev-only; structurally disabled in production builds regardless
# of these values — see DEV_GUIDES/Architecture/TestMode-Concept.md and
# src/config/testmode.ts). Put real values in your own .env.local, never here.
VITE_TESTMODE=yes                        # general on/off switch for TestMode
VITE_TEST_LOG_LEVEL=debug                # depth of logged issues
VITE_TEST_AUTH_PREFILL=yes               # wether the LoginScreen is prefilled with the TestUser Credentials from above
VITE_TEST_DEBUG_PANEL=yes                # whether a debug panel is displayed or not
VITE_TEST-USER-MAIL=test@failmail.ch     # The Testuser's Login eMail Address
VITE_TEST-USER-PW=flaminoflamino         # The Testuser's Login LoginPassword
```


## The following Context Files were modified
### [TECH](../../../VSC/client/AI/KIMI/CONFIG/TECH.md)
* **§2**: Documents config/testmode.ts, config/testFixtures.ts, and the new top-level utils/logger.ts in the project structure diagram

* **§12**: Added VITE_TESTMODE, VITE_TEST_LOG_LEVEL, VITE_TEST_AUTH_PREFILL, VITE_TEST_DEBUG_PANEL to the environment variable table, with a note that all four are structurally inert outside dev builds                                                            |
* **§14**: New Decision Log row for the centralized TestMode module choice 

### [DECISIONS.md](../../../VSC/client/AI/KIMI/CONFIG/DECISIONS.md)
* New ADR-019 — Centralized TestMode Module with a Hard Production Gate, covering context, decision, consequences (including the known ~0.14 kB unused testFixtures build chunk and the placeholder auth-prefill credentials), and alternatives considered |

### [PATTERNS.md](../../../VSC/client/AI/KIMI/CONFIG/PATTERNS.md)
* new P18

### [SESSION.md](../../../VSC/client/AI/KIMI/CONFIG/SESSION.md)
new session entry