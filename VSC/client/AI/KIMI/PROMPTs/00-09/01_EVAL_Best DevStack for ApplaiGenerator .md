What is the best development stack for vibecoding a single page web-app (SPA) that 

1. reads a structured JSON file with resumee data (skills, experiences) from a private GIST
2. displays the JSON-file's elements in a collapsable tree-view where the user can select/deselect nodes 
4. Edit the text of noded
5. move nodes to a different position
6. exports the such selected noded to an *.md file by preserving the tree-structure to the same GIST. 



Such generated application 

1. Generated code must be executed in debug-mode on a cheap/free and automatically setup remote and local server 

2. must be testable with a common test-framework you can choose. 



Boundaries
* Follows Microsoft's best practice
* Free/OpenSource libraries and tools only
* Code is mandatory edited in Visual Studio Code
* Code must be generated into a private GitHub Repo
* Front-End Code prefereable = HTML, CSS and TypeScript
* Other Code prefereably C#


Evaluation Criteria
* Code should compile in seconds to have fast interaction cycles

---

## Architecture 

### Architecture Overview
```plaintext
┌─────────────────┐      HTTP/REST      ┌──────────────────┐
│   Vite + TS     │ ◄─────────────────► │ ASP.NET Core 9   │
│   (SPA)         │                     │ Minimal API      │
│                 │                     │                  │
│ • Tree View     │                     │ • Gist Reader    │
│ • Node Edit/DnD │                     │ • Markdown Export│
│ • Selection     │                     │ • GitHub PAT     │
└─────────────────┘                     └──────────────────┘
```

### Architecture Outline
Considering the Apllai-Specs, **The optimal stack is a Vite-powered TypeScript SPA frontend paired with an ASP.NET Core 9 Minimal API backend**. 

This gives you sub-second compile times, full Microsoft alignment, and seamless GitHub Codespaces integration for zero-config remote debugging.

* **Frontend**: Vite + TypeScript + Vanilla HTML/CSS 

* **Tree UI**: Custom recursive renderer + SortableJS

* **Backend**: ASP.NET Core 9 Minimal API

* **GitHub API**: Octokit.net

* **Frontend Testing**: Vitest

* **Backend Testing**: xUnit + FluentAssertions

* **E2E Testing**: Playwright
|
* **Remote Dev**: GitHub Codespaces + Dev Containers

* **Local Dev**: VS Code + Dev Containers

* **Repo**: Private GitHub Repo


## Architectural Components
In the following we are describing the apps components in more detail and are giving your the arguments for choosing them: 

### Frontend: Vite + TypeScript + Vanilla HTML/CSS 
This provides instant HMR (<100ms), zero framework overhead, pure TS as requested)

### Tree UI: Custom recursive renderer + SortableJS 
This avoids jQuery/React bloat; native DOM performance; MIT license

### Backend: ASP.NET Core 9 Minimal API
because it represents C#, Microsoft best practice, compiles in ~1-2s with `dotnet watch`

### GitHub API: Octokit.net   (because it is an Official .NET GitHub SDK, that handles Gist auth cleanly

### Frontend Testing: Vitest 
Vite-native runs in milliseconds) 

### Backend Testing
xUnit + FluentAssertions (Microsoft standard, excellent DX)

### E2E Testing
Playwright  (Microsoft-owned, tests the full stack)                              |
### Remote Dev
GitHub Codespaces + Dev Containers (Free tier, auto-setup, debug ports forwarded automatically)

### Local Dev
VS Code + Dev Containers (Identical environment to remote)

### Repo
Private GitHub Repo  (Native integration with Codespaces and Gist)


## Appendix

### Why Not Blazor?
The Vite+TS approach keeps compile times faster than Blazor WASM AOT while giving you full control over the DOM tree.

