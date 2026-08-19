# TestMode Concept

-> implemented through [CR002-Adding a TestMode Core Principle](../../CHANGES/REQUESTS/CR000/CR002-Adding%20a%20TestMode%20Core%20Principle.md)

## The Need
For efficiently live end-user testing and maintaining I should be able to switch the WebApp into some kind of TestMode, where then certain functionality will run differently than when in Production Mode. This includes for example:

* Prefilling input-data with static values (for instance for the Authentication Screen).

* Display additional information (such as more detailed error-messages, internal messaging, debug infos, etc. )

* Generating more verbous logs

It would be nice when TestMode could be switched on/off with an URL parameter to avoid a specific TestToggling-button in the Code/screens.

### Security 
From a security point of view **TestMode must never reach prodcution** and must only be executed when run from the local BS Code powered development workplace.

Further all TestMode related logic must be centrally managed and therefore must be bundled in a single location and must not be spread all over the code. 

## The Concept

### 1. Layered Flag Resolution: 
From an abstract perspective TestMode is based on the following layered flag resolution: 

* **Layer 0** (**hard gate**):   Build mode ensures that **TestMode is IMPOSSIBLE in production builds**

* **Layer 1** (**default**): **.env.local** sets the default values for local development

* **Layer 2** (**override**): URL param must be "?test=1" for that TestMode values in .env.local are considered. 

#### Layer 0: The Production Safety Gate (non-negotiable)
TestMode must be structurally impossible in production, not just "switched off":

```typescript
// src/config/testmode.js
const IS_DEV_BUILD = import.meta.env?.DEV ?? process.env.NODE_ENV !== 'production';

export function isTestMode() {
  if (!IS_DEV_BUILD) return false;          // hard gate — prod can never enter test mode
  // ... runtime resolution below
}
```

#### Layer 1: .env.local as Default
TestMode specific on/off-switch and TestModeConfiguration-values are added to the local .env.local file (mind that it might contain already other configuration values too, which you must NOT touch!) 

```plaintext
TESTMODE=yes
TEST_LOG_LEVEL=debug
TEST_AUTH_PREFILL=yes
TEST_DEBUG_PANEL=yes
```

Note the prefix depends on your tooling: VITE_TESTMODE (Vite), REACT_APP_... (CRA), NEXT_PUBLIC_... (Next.js), plain names for Node backends.

Even if someone ships a .env with TESTMODE=yes to production, the gate kills it. Bonus: bundlers can tree-shake dead code, so test fixtures never even land in the prod bundle.

#### Layer 2: Runtime Override
For live end-user testing you want to toggle without restarting from a single function that reads the TestMode Switch from URL and .env.local file. 

```typescript
function resolveTestMode() {
  if (!IS_DEV_BUILD) return false;
  const url = new URLSearchParams(location.search);
  if (url.has('test')) return url.get('test') === '1';     // ?test=1
  const stored = localStorage.getItem('testmode');          // persists across reloads
  if (stored !== null) return stored === '1';
  return import.meta.env.VITE_TESTMODE === 'yes';           // .env fallback
}
```

## Design Rules
### 1. One central module — single source of truth.

Never scatter if (import.meta.env.VITE_TESTMODE) across the codebase. Everyone imports from config/testmode.js. This lets you change the resolution logic once.

### 2. Prefer granular sub-flags over one big switch.
TESTMODE=yes + TEST_AUTH_PREFILL=no is more useful than an all-or-nothing mode:

export const test = {
  enabled: resolveTestMode(),
  authPrefill: flag('TEST_AUTH_PREFILL', true),
  debugPanel:  flag('TEST_DEBUG_PANEL', true),
  logLevel:    import.meta.env.VITE_TEST_LOG_LEVEL ?? 'info',
};

### 3. Keep fixtures in a dedicated file, imported only in test mode:
Have all your default values in a single src/config/testFixtures.js as follows. 

**src/config/testFixtures.js**  — never import statically from prod paths
```typescript
export const authPrefill = { username: 'tester@example.com', password: 'Test1234!' };
```
These values can then be used as follows (here for example for the LoginScreen) : 

**LoginForm.js**: 
```typescript
if (test.enabled && test.authPrefill) {
  const { authPrefill } = await import('./config/testFixtures.js'); // dynamic = tree-shakable
  form.fill(authPrefill);
}
```

### 4. Verbose logging via a leveled logger, not console.log sprinkled around**

```typescript
// src/utils/logger.js
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const current = LEVELS[test.enabled ? test.logLevel : 'warn'];
export const log = {
  debug: (...a) => current <= 0 && console.debug('[DBG]', ...a),
  info:  (...a) => current <= 1 && console.info('[INF]', ...a),
  // ...
};
```

### 5. Debug info in ONE Debug Panel 
Provide a single conditional "Debug Panel" component (error details, internal state, message bus events) rather than ad-hoc markup everywhere.

## Security Checklist

✅ .env.local in .gitignore (it contains test credentials)

⚠️ Frontend env vars are public — they get bundled into the shipped JS. Test credentials are fine (they only work against your dev/test backend), but real secrets never belong there.

✅ If you have a backend: it must independently reject test-mode shortcuts (e.g., magic login tokens) in production. Never trust the client's flag.

✅ Prefer dedicated test accounts on a test backend over prefilled credentials pointing at real systems.