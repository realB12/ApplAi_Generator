# `spec.md` — Applai Resume Generator

**Version:** 1.0.1  
**Date:** 2026-08-14  
**Status:** Ready for VibeCoding  
**Scope:** Authentication Flow (S000 → S001 → S002) + Global Messaging (SMSG)

---

## 1. Architecture & Security Baseline

| Layer | Requirement |
|-------|-------------|
| **Transport** | HTTPS/TLS 1.3 mandatory. HSTS header with `max-age=31536000; includeSubDomains; preload`. |
| **Session** | Stateless JWT access token (15 min TTL) + httpOnly, Secure, SameSite=Strict refresh token cookie (7 days). |
| **Passwords** | Argon2id hashing on server. Client-side: min 12 chars, 1 upper, 1 lower, 1 digit, 1 special. |
| **Rate Limiting** | 5 attempts / 15 min / IP per endpoint. After 3 failures: CAPTCHA (hCaptcha v2 invisible) required. After 5 failures: 15-min lockout. |
| **CSRF** | Double-submit cookie pattern for non-GET requests. |
| **CSP** | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' /api;` |
| **Headers** | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` |
| **Input Sanitization** | DOMPurify on all user inputs before DOM insertion. Regex whitelist validation on all fields. |
| **Auto-Redirect** | If valid refresh token exists and `/api/auth/validate` returns 200, skip S000/S001 and route directly to S002. |

---

## 2. Global Design System

### 2.1 Screen Number Badge
- **Position:** Fixed, top-left corner, `z-index: 9999`.
- **Style:** 8px × 8px rounded pill, `background: rgba(0,0,0,0.6)`, `color: #fff`, `font: 10px monospace`, `padding: 2px 6px`.
- **Content:** Exact screen number (e.g., `S000`, `S001`, `S002`, `SMSG`, `S002D1`).
- **Behavior:** Non-interactive, does not block clicks, always visible.

### 2.2 Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#0F172A` | Headings, primary buttons |
| `--accent` | `#3B82F6` | Links, focus rings, active states |
| `--success` | `#10B981` | Valid input borders, success messages |
| `--warning` | `#F59E0B` | Warning messages |
| `--error` | `#EF4444` | Error states, error messages |
| `--info` | `#6366F1` | Info messages |
| `--surface` | `#FFFFFF` | Card backgrounds |
| `--bg` | `#F8FAFC` | Page backgrounds |
| `--text-primary` | `#1E293B` | Body text |
| `--text-secondary` | `#64748B` | Labels, placeholders |

### 2.3 Typography
- **Font Family:** `Inter, system-ui, -apple-system, sans-serif`
- **Headings:** 600 weight
- **Body:** 400 weight, 16px base
- **Labels:** 500 weight, 14px, `--text-secondary`

### 2.4 Spacing & Layout
- **Max Content Width:** 480px for auth screens, 1200px for S002.
- **Padding Scale:** 4px, 8px, 16px, 24px, 32px, 48px.
- **Border Radius:** 8px (inputs), 12px (cards), 24px (buttons).
- **Shadows:** `0 1px 3px rgba(0,0,0,0.1)` (cards), `0 4px 6px rgba(0,0,0,0.1)` (modals).

---

## 3. Screen Specifications

---

### 3.1 S000 — Welcome Screen / Landing Page

**Purpose:** First point of contact. Displays branding, checks auth service health, and conditionally renders the login popup.

#### 3.1.1 Layout
```
┌─────────────────────────────────────────┐
│ [S000]                                  │
│                                         │
│         ┌─────────────────────┐         │
│         │   [App Logo]        │         │
│         │   Applai Resume     │         │
│         │   Generator         │         │
│         │                     │         │
│         │   Welcome message   │         │
│         │   ───────────────── │         │
│         │   [S001 Login Popup │         │
│         │    OR spinner]      │         │
│         └─────────────────────┘         │
│                                         │
│         [Footer links]                  │
└─────────────────────────────────────────┘
```

#### 3.1.2 Elements

| Element | ID | Type | Description |
|---------|-----|------|-------------|
| App Logo | `s000-logo` | SVG | 64×64px, primary color, `aria-label="Applai Resume Generator Logo"` |
| App Name | `s000-title` | H1 | Text: **"Applai Resume Generator"** |
| Welcome Message | `s000-welcome` | P | Text: *"Create professional resumes powered by AI."* |
| Health Status Spinner | `s000-spinner` | Div | Centered, 32px CSS spinner, `aria-live="polite"`, visible only during `/api/health` call |
| Login Container | `s000-login-container` | Div | Mount point for S001. Hidden until health check passes. |
| Footer | `s000-footer` | Footer | Links: Privacy Policy, Terms of Service, Contact Support |

#### 3.1.3 Behavior & Logic

1. **On Mount:**
   - Display spinner.
   - Fire `GET /api/health` with 5s timeout.
   - If `200 OK` → hide spinner, fade in S001 login popup centered in `s000-login-container`.
   - If `4xx/5xx/timeout` → hide spinner, show SMSG with `type: error`, message: *"Authentication service is unavailable. Please try again later."* CTA button: **"Retry"** (re-fires health check).

2. **Returning User Check (Parallel to Health Check):**
   - Fire `POST /api/auth/validate` with refresh token cookie.
   - If `200 OK` → immediately route to S002 (bypass S001 entirely).
   - If `401/403` → continue to S001 (normal flow).

3. **Background:**
   - Subtle gradient: `linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)`.
   - No animation that delays interaction.

---

### 3.2 S001 — Login Screen (Popup)

**Purpose:** Collect credentials, authenticate user, handle errors, support password recovery.

**Container:** Centered modal card inside S000. Overlay: `rgba(15, 23, 42, 0.4)` with `backdrop-filter: blur(4px)`.

#### 3.2.1 Layout
```
┌─────────────────────────────────────────┐
│ [S000]                                  │
│                                         │
│    ┌───────────────────────────────┐    │
│    │         [S001]                │    │
│    │  ┌─────────────────────────┐  │    │
│    │  │    Applai Resume      │  │    │
│    │  │    Generator          │  │    │
│    │  │                         │  │    │
│    │  │  Email                 │  │    │
│    │  │  ┌───────────────────┐ │  │    │
│    │  │  │                   │ │  │    │
│    │  │  └───────────────────┘ │  │    │
│    │  │  Password              │  │    │
│    │  │  ┌───────────────────┐ │  │    │
│    │  │  │              [👁] │ │  │    │
│    │  │  └───────────────────┘ │  │    │
│    │  │  [ ] Remember me       │  │    │
│    │  │                         │  │    │
│    │  │  [    Sign In    ]     │  │    │
│    │  │                         │  │    │
│    │  │  Forgot password?      │  │    │
│    │  └─────────────────────────┘  │    │
│    └───────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

#### 3.2.2 Elements

| Element | ID | Type | Label / Placeholder | Validation Rules |
|---------|-----|------|---------------------|------------------|
| Screen Badge | `s001-badge` | Div | — | Fixed top-left, text: `S001` |
| Card Title | `s001-title` | H2 | "Sign in to your account" | — |
| Email Label | `s001-email-label` | Label | "Email address" | — |
| Email Input | `s001-email` | Email | `placeholder="you@company.com"` | Required. Regex: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`. Max 254 chars. Trim whitespace on blur. |
| Email Error | `s001-email-error` | Span | Inline error text | Hidden by default. Shows: *"Please enter a valid email address."* |
| Password Label | `s001-password-label` | Label | "Password" | — |
| Password Input | `s001-password` | Password | `placeholder="Enter your password"` | Required. Min 12 chars. Max 128 chars. |
| Password Toggle | `s001-toggle-password` | Button | `aria-label="Show password"` | Icon: Eye (show) / EyeOff (hide). Toggles input `type`. |
| Password Error | `s001-password-error` | Span | Inline error text | Hidden by default. Shows: *"Password must be at least 12 characters."* |
| Remember Me | `s001-remember` | Checkbox | Label: "Remember me for 7 days" | Default: **unchecked**. If checked, refresh token TTL extends to 30 days. |
| Sign In Button | `s001-submit` | Button | "Sign In" | Primary style. Disabled state during API call. Shows spinner inside button during loading. |
| Forgot Password | `s001-forgot` | Link | "Forgot password?" | Text link, accent color. Opens password reset flow (SMSG info: *"Check your email for reset instructions."*) |
| CAPTCHA Container | `s001-captcha` | Div | — | Invisible until triggered by rate limit. |

#### 3.2.3 Interaction & Validation Rules

| Event | Action |
|-------|--------|
| **Email Blur** | Validate regex. If invalid, show `s001-email-error`, set `aria-invalid="true"`, add red border. |
| **Password Blur** | Validate length. If invalid, show `s001-password-error`. |
| **Form Submit** | 1. Prevent default. 2. Validate all fields. 3. If invalid, focus first invalid field. 4. If valid, disable submit, show spinner. 5. If CAPTCHA required, execute hCaptcha first. 6. Fire `POST /api/auth/login` with `{email, password, captchaToken}`. |
| **Login Success (200)** | Store JWT in `memory` (never localStorage). Set refresh cookie (httpOnly, Secure, SameSite=Strict). Route to S002. |
| **Login Failure (401)** | Show SMSG `type: error`, message: *"Invalid email or password."* Clear password field. Focus password. Increment attempt counter. |
| **Login Failure (429)** | Show SMSG `type: warning`, message: *"Too many attempts. Please try again in 15 minutes."* Disable form for 15 min. |
| **Login Failure (5xx)** | Show SMSG `type: error`, message: *"Something went wrong. Please try again."* |
| **Enter Key** | Triggers form submit from any input. |
| **Escape Key** | Does nothing (modal is not dismissible; login is mandatory). |

#### 3.2.4 Accessibility
- All inputs have associated `<label>` with `for` attribute.
- Error messages linked via `aria-describedby`.
- Focus trap inside modal.
- Initial focus on email input on mount.
- Color contrast ratio ≥ 4.5:1 for all text.

---

### 3.3 S002 — Main Screen

**Purpose:** Core application interface for managing and exporting resume data from a MasterCV.JSON file. Only accessible post-authentication.

#### 3.3.1 Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [S002]  Applai Resume Generator          [👤 User] [Logout] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Load from GIST]  [Display All: ●OFF]  [Export]           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  TVC01 — TreeView Component                         │   │
│  │                                                     │   │
│  │  [x] Experiences                                    │   │
│  │   |   +-[x] "2002-2004" "Company01" "My First Job"  │   │
│  │   |   | "Detailed JobDescripton for Job01..."       │   │
│  │   |   +-[ ] "2004-2009" "Company02" "My Second Job" │   │
│  │   |      "Detailed JobDescripton for Job02..."      │   │
│  │  [x] Skills                                         │   │
│  │       +-[x] "VibeCoding" *****                      │   │
│  │       +-[ ] "C#" *****                              │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 3.3.2 Elements

| Element | ID | Type | Description |
|---------|-----|------|-------------|
| Screen Badge | `s002-badge` | Div | Fixed top-left, text: `S002` |
| Header Title | `s002-header-title` | Span | "Applai Resume Generator" |
| User Avatar | `s002-avatar` | Button | `aria-label="User menu"` | Shows user initials or generic icon. Dropdown: Profile, Settings, Logout. |
| Logout Button | `s002-logout` | Button | "Logout" | Destroys session, clears JWT, routes to S000. |
| Load from GIST Button | `s002-load-gist` | Button | "Load from GIST" | Triggers GIST file picker/load flow. Loads MasterCV.JSON into TVC01. |
| Display All Toggle | `s002-display-all` | Toggle Button | "Display All" | OFF by default. When OFF, deselected nodes (and children) are hidden. When ON, all nodes visible regardless of selection state. |
| Export Button | `s002-export` | Button | "Export" | Opens S002D1 Export Dialogue PopUp. |
| TreeView Container | `s002-tvc01-container` | Div | Mount point for TVC01 component. |

#### 3.3.3 TVC01 — TreeView Component

**Purpose:** Display loaded MasterCV.JSON content as selectable, collapsible, editable nodes.

**Behavior:**
- **Selection:** All tree-nodes have a checkbox. Checked = selected, unchecked = deselected. Clicking the checkbox toggles selection state.
- **Collapse/Expand:** Double-clicking any node row toggles collapse/expand state of its children.
- **Display:** When `s002-display-all` is OFF, deselected nodes and their child nodes are hidden from view. When ON, all nodes are visible regardless of selection.
- **Editing:** Each node has an editable info-field associated with JSON entries.
- **Visual Structure:** Tree indentation indicates hierarchy. Selected state persists per node.

**Example Structure:**
```plaintext
[x] Experiences
 |   +-[x] "2002-2004" "Company01" "My First Job" 
 |   | "Detailed JobDescripton for Job01 on several lines" 
 |   +-[ ] "2004-2009" "Company02" "My Second Job" 
 |      "Detailed JobDescripton for Job02 on several lines" 
[x] Skills
     +-[x] "VibeCoding" *****
     +-[ ] "C#" *****
```

#### 3.3.4 [Display All] Button

| State | Behavior |
|-------|----------|
| **OFF (default)** | TVC01 hides all deselected nodes and their children. Only selected nodes and their selected ancestors are visible. |
| **ON** | TVC01 displays all nodes regardless of selection state. Checkboxes remain interactive. |

**Toggle Visual:** Sliding toggle or button with clear ON/OFF state indicator.

#### 3.3.5 [Export] Button

**Trigger:** Click `s002-export`.

**Action:** Open S002D1 Export Dialogue PopUp.

**Backend Logic (post-dialogue):**
- Generate a JSON file containing only selected nodes and branches from the current TVC01 state.
- The exported file has the same structure as MasterCV.JSON but is a subset (deselected nodes excluded).
- Save to GIST with the filename determined in S002D1.

#### 3.3.6 S002D1 — Export Dialogue PopUp

**Purpose:** Collect filename for exported CV JSON.

**Container:** Modal popup consistent with SMSG design system (same overlay, card styling, shadows, animations).

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│    ┌───────────────────────────────┐    │
│    │  [S002D1]                     │    │
│    │                               │    │
│    │  Export Your CV               │    │
│    │                               │    │
│    │  Please enter a qualified     │    │
│    │  name for your exported CV.   │    │
│    │                               │    │
│    │  CV Name                      │    │
│    │  ┌─────────────────────────┐  │    │
│    │  │  GeneratedCV            │  │    │
│    │  └─────────────────────────┘  │    │
│    │                               │    │
│    │  [  Cancel  ]  [  Export  ]   │    │
│    │                               │    │
│    └───────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

**Elements:**

| Element | ID | Type | Label / Placeholder | Validation / Constraints |
|---------|-----|------|---------------------|--------------------------|
| Screen Badge | `s002d1-badge` | Div | — | Fixed top-left of popup, text: `S002D1` |
| Title | `s002d1-title` | H3 | "Export Your CV" | — |
| Prompt Message | `s002d1-prompt` | P | "Please enter a qualified name for your exported CV." | — |
| CV Name Label | `s002d1-name-label` | Label | "CV Name" | — |
| CV Name Input | `s002d1-name` | Text | `placeholder="GeneratedCV"` | Required. Min 3 chars, max 23 chars. Regex: `^[a-zA-Z0-9_-]{3,23}$`. Only regular characters, numbers, hyphen, and underscore allowed. |
| Name Error | `s002d1-name-error` | Span | Inline error | Hidden by default. Shows: *"Name must be 3–23 characters. Only letters, numbers, hyphens, and underscores allowed."* |
| Cancel Button | `s002d1-cancel` | Button | "Cancel" | Secondary style. Closes popup immediately. Cancels any running export transaction. No side effects. |
| Export Button | `s002d1-export` | Button | "Export" | Primary style. Disabled until input valid. Triggers export save. |

**Behavior:**

| Event | Action |
|-------|--------|
| **Popup Open** | Pre-fill input with default value `GeneratedCV`. Focus input, select all text. |
| **Input Blur** | Validate regex and length. Show inline error if invalid. |
| **Export Click** | 1. Validate input. 2. If invalid, show error and focus field. 3. If valid, close popup. 4. Generate subset JSON from TVC01 selected nodes. 5. Check GIST for existing files matching `GeneratedCV*.JSON`. 6. If `GeneratedCV.JSON` exists, increment two-digit suffix: `GeneratedCV01.JSON`, `GeneratedCV02.JSON`, etc. 7. Save to GIST. 8. Show SMSG `type: success`: *"CV exported successfully as [filename]."* |
| **Cancel Click** | Close popup immediately. Abort any in-flight export request. Return to S002. |
| **Escape Key** | Same as Cancel. |
| **Overlay Click** | Same as Cancel. |

**Filename Generation Rules:**
- Base name: User input from `s002d1-name` (default: `GeneratedCV`).
- Extension: `.JSON` (uppercase).
- Collision handling: If `[name].JSON` exists in GIST, append two-digit counter starting at `01`: `[name]01.JSON`, `[name]02.JSON`, up to `99`.
- If all 100 variants exist, show SMSG `type: error`: *"Export failed: too many files with this name. Please choose a different name."*

#### 3.3.7 Behavior & Logic

1. **On Mount:**
   - Verify JWT validity via `POST /api/auth/validate`.
   - If `401/403`, show SMSG `type: error` → *"Session expired"* → redirect to S000.
   - TVC01 initializes empty. User must click `s002-load-gist` to load data.

2. **Load from GIST:**
   - Opens GIST file picker (specific mechanism to be defined by implementer).
   - Loads selected `MasterCV.JSON` into TVC01.
   - On parse error, show SMSG `type: error`: *"Failed to load CV file. Invalid JSON format."*

3. **Logout:**
   - `POST /api/auth/logout`, clear all tokens/storage, hard redirect to S000.

4. **Session Expiry:**
   - If JWT expires during use and refresh fails, show SMSG `type: error` → *"Session expired"* → redirect to S000.

---

### 3.4 SMSG — Message PopUp

**Purpose:** Universal feedback component for errors, warnings, success, and info messages.

#### 3.4.1 Layout
```
┌─────────────────────────────────────────┐
│                                         │
│    ┌───────────────────────────────┐    │
│    │  [ICON]  Title                │    │
│    │          Message body text    │    │
│    │          goes here.           │    │
│    │                               │    │
│    │          [  OK  ]             │    │
│    └───────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

#### 3.4.2 Elements

| Element | ID | Type | Description |
|---------|-----|------|-------------|
| Overlay | `smsg-overlay` | Div | `position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 10000` |
| Modal Card | `smsg-card` | Div | Centered, 400px max-width, white bg, 12px radius, shadow-lg |
| Icon | `smsg-icon` | SVG | 24×24px. Color matches type. |
| Title | `smsg-title` | H3 | Bold, 18px. Content depends on type. |
| Message | `smsg-message` | P | 16px, `--text-primary`. Max 3 lines. |
| Action Button | `smsg-action` | Button | Primary style. Label: "OK" or custom CTA. |
| Close (X) | `smsg-close` | Button | Top-right corner. `aria-label="Close message"` |

#### 3.4.3 Message Types & Icons

| Type | Icon | Title Default | Icon Color | Use Case |
|------|------|---------------|------------|----------|
| `error` | ❌ Circle-X (Lucide) | "Error" | `--error` | Auth failures, 5xx errors, validation blockers |
| `warning` | ⚠️ Triangle-alert (Lucide) | "Warning" | `--warning` | Rate limits, unsaved changes, partial failures |
| `success` | ✅ Circle-check (Lucide) | "Success" | `--success` | Login success, draft saved, profile updated |
| `info` | ℹ️ Circle-info (Lucide) | "Information" | `--info` | Tips, draft loaded, feature announcements |

#### 3.4.4 Behavior

| Rule | Specification |
|------|---------------|
| **Stacking** | Only one SMSG visible at a time. New message replaces existing. |
| **Auto-dismiss** | `success` and `info` auto-dismiss after 5 seconds. `error` and `warning` require manual dismissal. |
| **Focus** | On open, focus moves to `smsg-action` button. Focus trap active. |
| **Escape** | Pressing Escape dismisses the popup (except for critical errors that block flow). |
| **Animation** | Enter: fade in 200ms + scale from 0.95. Exit: fade out 150ms. |
| **Accessibility** | `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby="smsg-title"`. |

#### 3.4.5 API (Programmatic Trigger)

```typescript
interface ShowMessageParams {
  type: 'error' | 'warning' | 'success' | 'info';
  title?: string;        // Optional. Uses default if omitted.
  message: string;       // Required. Max 200 chars.
  actionLabel?: string;  // Default: "OK"
  onAction?: () => void; // Callback on button click
  persistent?: boolean;  // If true, no auto-dismiss, no Escape close
}

showMessage(params: ShowMessageParams): void;
```

---

## 4. Interaction Diagram

```mermaid
flowchart TD
    Start([Browser loads app]) --> S000

    S000[S000: Welcome Screen] -->|Mount| Health{GET /api/health}
    Health -->|200 OK| CheckAuth{POST /api/auth/validate}
    Health -->|Fail / Timeout| SMSG_Error1[SMSG: error<br/>Service unavailable]
    SMSG_Error1 -->|Click Retry| Health

    CheckAuth -->|200 + Valid Token| S002[S002: Main Screen]
    CheckAuth -->|401 / 403 / No token| S001[S001: Login Popup]

    S001 -->|User fills form| Validate{Client Validation}
    Validate -->|Invalid| InlineError[Show inline errors<br/>Focus first invalid]
    Validate -->|Valid| LoginAPI{POST /api/auth/login}

    LoginAPI -->|200 Success| S002
    LoginAPI -->|401 Unauthorized| SMSG_Error2[SMSG: error<br/>Invalid credentials]
    SMSG_Error2 -->|Click OK| S001
    LoginAPI -->|429 Rate Limited| SMSG_Warn1[SMSG: warning<br/>Too many attempts]
    SMSG_Warn1 -->|Click OK| Lockout[Disable form 15 min]
    LoginAPI -->|5xx Server Error| SMSG_Error3[SMSG: error<br/>Server error]
    SMSG_Error3 -->|Click OK| S001

    S002 -->|Click Logout| LogoutAPI{POST /api/auth/logout}
    LogoutAPI -->|Any response| S000_Clear[Clear tokens & storage]
    S000_Clear --> S000

    S002 -->|Session Expires| SMSG_Error4[SMSG: error<br/>Session expired]
    SMSG_Error4 -->|Click OK| S000

    %% Styling
    classDef screen fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef msg fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef api fill:#f3e5f5,stroke:#6a1b9a,stroke-width:1px,stroke-dasharray: 5 5

    class S000,S001,S002 screen
    class SMSG_Error1,SMSG_Error2,SMSG_Error3,SMSG_Error4,SMSG_Warn1 msg
    class Health,CheckAuth,LoginAPI,LogoutAPI api
```

---

## 5. State Machine

| State | Description | Transitions |
|-------|-------------|-------------|
| `AUTH_CHECKING` | S000 mounted, health + token validation in flight | → `AUTHENTICATED` (valid token) / → `LOGIN_REQUIRED` (health OK, no token) / → `SERVICE_DOWN` (health fail) |
| `LOGIN_REQUIRED` | S001 visible, awaiting user input | → `AUTHENTICATING` (form submit) |
| `AUTHENTICATING` | Login API in flight | → `AUTHENTICATED` (success) / → `LOGIN_ERROR` (failure) |
| `LOGIN_ERROR` | Error displayed in SMSG, S001 still visible | → `LOGIN_REQUIRED` (dismiss) / → `AUTHENTICATING` (retry) |
| `AUTHENTICATED` | Valid session, S002 visible | → `LOGGING_OUT` / → `SESSION_EXPIRED` |
| `SERVICE_DOWN` | Auth service unreachable | → `AUTH_CHECKING` (retry) |
| `SESSION_EXPIRED` | JWT expired and refresh failed | → `AUTH_CHECKING` (auto) |

---

## 6. Error Handling Matrix

| Scenario | UI Feedback | User Action | System Action |
|----------|-------------|-------------|---------------|
| Invalid email format | Inline error + red border | Correct input | None |
| Password too short | Inline error + red border | Correct input | None |
| Wrong credentials | SMSG error popup | Re-enter | Increment counter, trigger CAPTCHA after 3 |
| Rate limited (429) | SMSG warning + form disabled | Wait 15 min | Log attempt, IP block |
| Auth service down | SMSG error on S000 | Click Retry | Re-poll health |
| Network timeout | SMSG error | Click Retry | Exponential backoff (1s, 2s, 4s) |
| Session expired during use | SMSG error, redirect to S000 | Re-login | Clear invalid tokens |
| 5xx on any API call | SMSG error | Retry | Log server-side |

---

## 7. Security Checklist (Implementation Verification)

- [ ] All API calls use HTTPS
- [ ] JWT stored in memory only (never localStorage/sessionStorage)
- [ ] Refresh token is httpOnly, Secure, SameSite=Strict cookie
- [ ] Password minimum 12 characters enforced client and server side
- [ ] Rate limiting enforced server side (not client-side only)
- [ ] CAPTCHA after 3 failed attempts
- [ ] CSRF token included in all state-changing requests
- [ ] Input sanitized with DOMPurify before DOM insertion
- [ ] `autocomplete` attributes set on login inputs (`email`, `current-password`)
- [ ] No sensitive data in URL parameters
- [ ] Secure headers present on all responses
- [ ] Session timeout warning at 2 minutes before expiry
- [ ] Concurrent session limit (max 3 per user)
- [ ] Audit log for all login attempts (success + failure)

---

## 8. Asset Inventory

| Asset | Format | Notes |
|-------|--------|-------|
| App Logo | SVG | 64×64 viewBox, monochrome, primary color |
| Icons (Eye, EyeOff, X, Check, Alert, Info) | SVG / Icon Library | Lucide React or equivalent, 24px |
| Loading Spinner | CSS only | 32px, 2px border, primary color |
| Background Gradient | CSS | `linear-gradient`, no image asset needed |

---

## 9. Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| < 480px | S001 card: 100% width, 16px margin. S002: single column. |
| 480–768px | S001 card: 100% width, 24px margin. |
| > 768px | S001 card: 420px fixed width, centered. S002: max 1200px centered. |

---

## 10. Notes for Implementers

1. **No Ambiguity:** All IDs are unique and prefixed with screen number. Use exactly as specified.
2. **No Reprompting Required:** Every element, validation rule, error message, and transition is defined above.
3. **VibeCoding Ready:** Copy screen sections directly into component prompts. The state machine (§5) and interaction diagram (§4) define all logic.
4. **Testing:** Verify all error scenarios in §6 before marking complete.
5. **Accessibility:** Run axe-core or Lighthouse. Target 100% accessibility score.

---

**End of Specification**