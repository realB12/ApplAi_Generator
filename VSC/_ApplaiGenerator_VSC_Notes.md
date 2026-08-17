# How the Visual Studio Code (VSC) IDE is used and structured for vibecoding

> **Local FolderPath**: C:\me\REPO\PRJ\ApplAI\40 DEV\S02_GENERATOR\VSC

> **RepoPath**: https://github.com/realB12/ApplAi_Generator/tree/main/VSC

The VSC folder contains everything that is related and relevant to the final source code.

## Applai_Generator Project Structure
```plaintext
https://github.com/realB12/ApplAi_Generator/tree/main
├─ DEV_GUIDES
├─ DEV_LOGs
├─ VSC                                 # whatever is visible within the VSC project
|   ├─ client                          # for the Applai_Generator's Client/FrontEnd
|   |   ├─ AI/KIMI/                    # Whatever was needed to vibecode with KIMI.com
|   |   │   ├─ CONFIG/                 # VISION, SPEC, TECH, PATTERNS, DECISIONS, SESSION, 
|   |   |   ├─ PROMPTs/                # Prompt history/archive
|   |   |   └─ _Kimi.com.md/           # Notes how Komi.com was used along the process
|   |   ├─ DOCS/                       # Developer Manuals, Dev-Specs, Configuration hints 
|   |   ├─ PRODUCT/                    # contains the compiled binaries for deployment
|   |   ├─ SCRIPTs/                    # all Scripts for build, debug and deploy
|   |   ├─ src/                        # The sourcecode that finally makes the product
|   |   |   ├─ app/                    # App-level setup
|   |   |   |   ├── providers.tsx      # Context providers composition
|   |   |   |   ├── router.tsx         # Route definitions
|   |   |   |   └── store.ts           # Zustand store configuration
|   |   |   ├─ components/
|   |   |   |   ├── ui/                # shadcn/ui components (auto-generated)
|   |   |   |   └── common/            # Shared components (Button, Modal, etc.)
|   |   |   ├── features/              # Feature-based modules
|   |   |   |   ├── auth/              # AUTH Feature (1)
|   |   |   |   |   ├── api/           # API calls
|   |   |   |   |   ├── components/    # Feature-specific components
|   |   |   |   |   ├── hooks/         # Feature-specific hooks
|   |   |   |   |   ├── stores/        # Feature-specific state
|   |   |   |   |   ├── types/         # Feature-specific types
|   |   |   |   |   └── utils/         # Feature-specific utilities
|   |   |   |   └── [feature2]/        # FEATURE (2)
|   |   |   ├── hooks/                 # Global shared hooks
|   |   |   ├── lib/                   # Utilities, helpers
|   |   |   │   ├── api.ts             # API client setup
|   |   |   │   ├── utils.ts           # General utilities (cn, etc.)
|   |   |   │   └── constants.ts       # App constants
|   |   |   ├── types/                 # Global TypeScript types
|   |   |   ├── routes/                # Route components (pages)
|   |   |   └── styles/                # Global styles, Tailwind imports
|   |   ├─ TESTS/                      # Testing stuff - not part of the product
|   |   └─ xCODE/                      # Folder/File documentation
|   └─ server                          # for the Applai_Generator's Backend/Server
├─ .gitignore                          # exclude /PRODUCT
├─ LICENCE
└─ README.md
```

## Root Level
Under the root level the overall projects is split into its core components - the "Client" called FrontEnd and the "Server" called Backend: 

* [**/client**]: the source-code for the front-end client app

* **/server**: the source-code for the backend server app

Both provide the same directory structure 

## Core Component Level
Client- and Server-code in their */client* resp. */server*-subfolder will BOTH have the following MANDATORY code structure. Note here that the MANDATORY folders are written in CAPITAL Letters, whereas specific folders will in small-only-letters (with one deliberate exception: **/src** is kept lowercase to match the standard convention used by Vite and the rest of the JS/TS tooling ecosystem, and to avoid case-sensitivity bugs between Windows and Linux/CI).

* **/AI/KIMI**: contains whatever an AI vibecoding session needs to be initially launched (MVP-Session) and then subsequently add additional features or fix/change/improve/diversify/secure the current code (be reminded that we will most probably always start with a new session because the built in AI-memory mechanisms have a dentency to accumulate irrelevant bloat that makes next iterations fuzzy, slow and expensive).  

* **/src**: manually created and/or vibecoded source-code that finally will be compiled into the final product. 







* **/PROMPTS**: the prompts used when vibcoding the product and/or evaluating or improving certain aspects of the architectur, maintenance, versioning, code etc. 

* **/DOCS**: product related documentation such as specifications (but no project data such as logs, WBS, progress reports or meeting minutes). 
