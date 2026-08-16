# Making sure, the generated code compiles, debugs and can be tested with VS Code

> I want to make sure, that when I download the Project from my Github Repo and I open it with Visual Studio Code at the local /VSC folder (which is https://github.com/realB12/ApplAi_Generator/tree/main/VSC remote), that I can compile, debug and test the app immediately. 
Will the such generated code be reade for this? When not - what needs to be added? 

---


# Scaffolding a vibecoded Web Application Project

## Intro
No, **VibeCode alone will - normally - neither compile nor can it be tested when it is just downloaded to VS Code** for example. 

The AI generates components, hooks, and logic, but **it does not generate the project scaffolding**: package.json, vite.config.ts, tsconfig.json, Tailwind setup, shadcn/ui init, test configs, VS Code debug settings, etc.

**Without these, cloning the repo and running npm install && npm run dev will fail immediately.**

Here is the complete scaffolding you need to add to your repo before vibecoding starts. These files live at VSC/client/ level (the frontend root), while the AI-generated code goes into VSC/client/SRC/.

The good news: **Your AI can generate most probably whatever you need to do so!**

## So what is scaffolding at all? 

**In a nutshell:** 
> **the VibeCode is the growing HOUSE whereas the Scaffolding is the FOUNDATOIN on which the House is built.** 



## Scaffolding VibeCode for Visual Studio Code

1. **Ask your AI to generate all these scaffolding files as a downloadable ZIP**. 

2. **Extract this to VSC/client/** (it creates the folder structure automatically):

3. After Extracting execute the following BASH-Command: 

    ```bash
    cd VSC/client
    npm install
    npm run typecheck   # Should pass (0 errors)
    npm run dev         # Opens http://localhost:3000
    # F5 in VS Code → launches Chrome debugger
```

The app will show a blank page until the AI vibecodes the actual components, but the build pipeline, TypeScript checking, and test runner are all ready.

The such provided ZIP contains the following files: 
| Scaffolding File       | Depends on SPEC.md?    | Changes When?                                | Stability         |
| ---------------------- | ---------------------- | -------------------------------------------- | ----------------- |
| `package.json`         | ✅ Tech stack (§1)      | New dependency added (e.g. chart lib for v2) | **Semi-stable**   |
| `vite.config.ts`       | ❌ No                   | Rarely — only if build behavior changes      | **Stable**        |
| `tsconfig.json`        | ❌ No                   | Rarely — only if module system changes       | **Stable**        |
| `tailwind.config.js`   | ✅ Design tokens (§2.2) | New colors/spacing in SPEC                   | **Semi-stable**   |
| `postcss.config.js`    | ❌ No                   | Never                                        | **Stable**        |
| `components.json`      | ❌ No                   | Never (shadcn/ui config)                     | **Stable**        |
| `index.html`           | ❌ No                   | Only if app title changes                    | **Stable**        |
| `playwright.config.ts` | ❌ No                   | Only if E2E setup changes                    | **Stable**        |
| `.vscode/*`            | ❌ No                   | Never                                        | **Stable**        |
| `src/main.tsx`         | ⚠️ Providers           | New context provider (e.g. i18n for v2)      | **Mostly stable** |
| `src/app/router.tsx`   | ✅ Routes (§4)          | New screen/route added                       | **Dynamic**       |
| `src/app/store.ts`     | ✅ Zustand slices (§8)  | New store slice added                        | **Dynamic**       |
| `src/types/index.ts`   | ✅ Data models (§5)     | New entity/interface added                   | **Dynamic**       |
| `src/styles/index.css` | ✅ Design system        | New CSS variables                            | **Semi-stable**   |
| `src/lib/utils.ts`     | ❌ No                   | Never                                        | **Stable**        |
| `src/tests/setup.ts`   | ❌ No                   | New global mock needed                       | **Mostly stable** |

These files are documented in the following Chapter


### Scaffolding Files Required for VSC/client/



In the VSC/client/ folder you have to generat the following Configuration Files for 
1. **package.json**: for required library code (React, UI, etc. components) 

#### package.json
```json
{
  "name": "applai-resume-generator",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@radix-ui/react-checkbox": "^1.1.1",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@tanstack/react-query": "^5.51.0",
    "@tanstack/react-virtual": "^3.8.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.400.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.52.0",
    "react-router-dom": "^7.0.0",
    "tailwind-merge": "^2.4.0",
    "zod": "^3.23.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^7.15.0",
    "@typescript-eslint/parser": "^7.15.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@vitest/ui": "^2.0.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.7",
    "jsdom": "^24.1.0",
    "msw": "^2.3.0",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.6",
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "vitest": "^2.0.0"
  }
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    css: true,
  },
});
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### tsconfig.node.json
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',
        accent: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#6366F1',
        surface: '#FFFFFF',
        bg: '#F8FAFC',
        'text-primary': '#1E293B',
        'text-secondary': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['monospace'],
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '4px',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
```

### postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### components.json (shadcn/ui)
JSON
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/styles/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
8. VSC/client/index.html
HTML
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Applai Resume Generator" />
    <title>Applai Resume Generator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### src/main.tsx (Entry Point)
TypeScript
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
```

### src/styles/index.css
css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

### src/lib/utils.ts

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### src/app/router.tsx (Skeleton)
```typescript
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { WelcomeScreen } from '@/features/auth/components/WelcomeScreen';
import { MainScreen } from '@/features/resume/components/MainScreen';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <WelcomeScreen />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <MainScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
```

### src/app/store.ts (Zustand skeleton)
TypeScript
```typescript
import { create } from 'zustand';
import { User, UserSettings } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true, isLoading: false }),
  clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));

interface UIState {
  theme: 'light' | 'dark';
  settings: UserSettings | null;
  isExportOpen: boolean;
  isImportOpen: boolean;
  isSettingsOpen: boolean;
  setSettings: (settings: UserSettings) => void;
  setExportOpen: (open: boolean) => void;
  setImportOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  settings: null,
  isExportOpen: false,
  isImportOpen: false,
  isSettingsOpen: false,
  setSettings: (settings) => set({ settings }),
  setExportOpen: (isExportOpen) => set({ isExportOpen }),
  setImportOpen: (isImportOpen) => set({ isImportOpen }),
  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
}));
```

### src/types/index.ts
TypeScript
```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  gistUrl?: string;
  masterResumeFile?: string;
  preferredCvName?: string;
}

export interface MasterCVNode {
  id: string;
  label: string;
  selected: boolean;
  expanded: boolean;
  info?: string;
  children?: MasterCVNode[];
}

export interface GistFile {
  filename: string;
  raw_url?: string;
}
```

### src/tests/setup.ts
TypeScript
```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

### .env.example
```bash
# Required
VITE_API_URL=https://api.example.com/v1
VITE_HCAPTCHA_SITEKEY=10000000-ffff-ffff-ffff-000000000001

# Optional
VITE_APP_NAME=Applai Resume Generator
VITE_DEFAULT_GIST_URL=
VITE_SENTRY_DSN=
17. VSC/client/.vscode/settings.json
JSON
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

### .vscode/launch.json
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Vite Dev Server",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Chrome Debug",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    }
  ]
}
```

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### .gitignore
```plaintext
# Dependencies
node_modules
.pnp
.pnp.js

# Build
dist
dist-ssr
*.local

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/*
!.vscode/settings.json
!.vscode/launch.json
!.vscode/extensions.json
.idea

# Testing
coverage
e2e/test-results
e2e/playwright-report

# Misc
*.log
.DS_Store

```

## What the AI Still Needs to Generate
After you place the scaffolding above in your repo, the AI vibecodes these remaining files into VSC/client/src/:

| File                                               | Status                               |
| -------------------------------------------------- | ------------------------------------ |
| `src/features/auth/components/WelcomeScreen.tsx`   | AI generates                         |
| `src/features/auth/components/LoginPopup.tsx`      | AI generates                         |
| `src/features/auth/components/MessagePopup.tsx`    | AI generates                         |
| `src/features/auth/components/ProtectedRoute.tsx`  | AI generates                         |
| `src/features/auth/stores/authStore.ts`            | AI generates (or use skeleton above) |
| `src/features/auth/api/authApi.ts`                 | AI generates                         |
| `src/features/auth/hooks/useAuth.ts`               | AI generates                         |
| `src/features/resume/components/MainScreen.tsx`    | AI generates                         |
| `src/features/resume/components/TreeView.tsx`      | AI generates                         |
| `src/features/resume/components/ExportDialog.tsx`  | AI generates                         |
| `src/features/resume/components/ImportDialog.tsx`  | AI generates                         |
| `src/features/resume/components/SettingsPanel.tsx` | AI generates                         |
| `src/features/resume/stores/resumeStore.ts`        | AI generates                         |
| `src/features/resume/api/gistApi.ts`               | AI generates                         |
| `src/lib/api.ts`                                   | AI generates (with AbortController)  |

## Immediate Test After Scaffolding

```bash
cd VSC/client
npm install
npm run typecheck   # Should pass (empty project, no errors)
npm run dev         # Should open browser at localhost:3000
npm run test        # Should run Vitest (0 tests, 0 failures)
```
