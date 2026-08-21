# NAVIGATION.md — AI Context: Core Navigation Button Rules

## Purpose of Document
This Context Files defines the minimal, unambiguous rule set for how AI shall vibecode standard buttons like [CANCEL], [CLOSE], [ESCape Keyboard event] and [X]) across all screen types and task states.  

> **Convention base:** Microsoft Windows / Fluent Design Guidelines.

---

## 1. Purpose of these Rules
Buttons with the same names - such as [CANCEL] or [CLOSE] shall trigger the same core functionality, subsequent navigation and restoration/manipulation of state accross all the application - as long as not specified otherwise. 

When a Standard Button from the list below is not further specified, the herein implied rules must be applied or the generator must stop and ask for clarifications before building!

The term "Standard Button" includes the ESCAPE-key and the [X] present in all screen in the top right corner. 

This helps consistency accross the application and avoids the repeated specification of these standard buttons. 

## 2. How these Rules shall be applied
NAVIGATION.md refiens SPEC.md and TECH.md in a sense, that it ensures, that their Standard Buttons and related Navigation comply with the herein specified naming conventions, functionality, navigation rules etc. 

This document advices generators to actively recommend adding Standard Buttons and Navigation when they are missing in SPEC.md or TECH.md. 

So, NAVIGATON.md is not really an AI context file on itself for vibecoding, but is used by AI to check the quality of SPEC.md and TECH.md which finally might overwrite the herein made rules. 

## 3. Naming Conventions
In all documentations all Standard Buttons shall be written within in brackets such as [CANCEL] so that it is clear that [CANCEL] means the Button rather than the "Cancel()" functionality.

All Standard Button Names are always in English - even when i8n is applied at a later stage. 

Standard Button-Names are always one-word in ALL-CAPITAL letters.   

Non Standard Buttons are in [] as well, but written in CamelCase and can be several words to be i8n-zed.


## 4. List of Standard Buttons

| Button | Definition | Promise |
|--------|-----------|---------|
| **[OK]** | Confirm Input | Verifys and confirms changed or inserte data and starts the screen's default behavior. |
| **[ENTER]** | Keyboard "OK" | Must behave identically to [OK] |
| **[CANCEL]** | Go back to last state | **Zero side effects.** The system always returns to the exact state before the current screen/modal opened. Changes will be lost. Running transactions are stopped. When restoration of last state is no longer or potentially not posssible use [CLOSE] instead. |
| **[CLOSE]** | Just close the screen | **Change and side effects remain and running transactions continue in a fire&forget mode.** Any work already applied or saved is preserved. |
| **[X]** | Title-bar close button in the top right corner. | Must behave identically to the screen's primary dismiss action (CLOSE or CANCEL). |
| **[ESC]** | Keyboard dismissal. | Must behave identically to the screen's primary dismiss action (CLOSE or CANCEL). |
| **[SAVE]** | Saves current Change | Only selectable when content was changed. Deactivate [SAVE] when changes are successfully saved. Display an error message when not with a [RETRY] and [CLOSE] button that returns to the changed Screen |
| **[STOP]** | Interrupt an in-flight background task. | **Side effects already exist.** The task is halted, but partial results might remain. Navigation remains on the current Screen that confirms the Stop in a MessagePopUp that informs about the current/stopped state (when possible) |
| **[CONTINUE]** | Continous a stopped task | **Side effects exist.** The task was halted and will continue (only display when continuation is possible and spinner is shown) |
| **[RETRY]** | Retry failed operation | Displays only on error-screens when an operation has failed besides [CANCEL] button. |
| **[EXIT]** | Like [ESC] followed by application EXIT | Displays a Confirmation Popup where user must confirm leaving the application without saving and without stopping already running transactions. When confirmed, behaves identically to the screen's primary dismiss action (CLOSE or CANCEL), does the same with ev. cascading parent screeens and when finally reaching the last screen, loggs the user out, frees all resources and finally closes the application. When the User [CLOSE]s the Confirmation Screen with confirming the "Exit()", the Confirmation Screen closes and returns to the last state.
| **[LOGOUT]** |Returns to Login | Behavior identical with EXIT with the difference that navigation returns to the Login-Screen in a state as if launched from scratch. Purpose is to login with a different user. |

Buttons with names OTHER than the ones listed above, must always be explicitely specified in SPEC.md and do not automatically comply with the herein enforced rules. 

[EXIT] and [LOGOUT] are normally not positioned on normal screens, but handled only as MenuOptions or at specific situation such as Application/System-Failure, Timeouts or non-responsive BackendActivity.  

---

## 5. Universal Rules (All Screens)

1. **Never use [CANCEL] and [CLOSE] interchangeably.** If the screen has already created side effects or still runs a non-revertible transaction, use [CLOSE]
However, when the screen can cleanly revert everything and can restore the previous state 100%, use [CANCEL].

2. **Every modal must contain an explicit safe action button** in the body. Never rely solely on the [X] title-bar button.

3. **ESC and [X] must always map to the same action** as the body's safe-dismiss button.

4. **Button Order must comply with Windows/Microsoft convention):** Primary/commit action on the **LEFT**, safe/dismiss action on the **RIGHT**.
   - Example: `[SAVE] [CANCEL]` or `[DELETE] [CANCEL]`  

5. **Never use generic [OK]** for destructive or committing actions. Use the verb: `[Send]`, `[Delete]`, `[Pay]`, `[Sign In]` instead. 

6. **If a background task (spinner) is running:**
   - If the task is **fully undoable** (no persistent state changed yet): use **[CANCEL]**.
   - If the task has **already created side effects** (partial download, temp files, state change): use **[STOP]** or **[CLOSE]**, not [CANCEL].
   - Never disable the **[STOP]**/**[CLOSE]** unless the operation is physically uncancelable for < 2 seconds.

---

## 6. Screen-Type Rules

### 6.1 Main Screen (Modeless / Primary Window)
- **Dismiss action:** [CLOSE] only (Never use [CANCEL] on a main screen).  If unsaved work exists or transactions are still spinning, prompt to save before logging out the user, free all resources and closing the window/app. 
- **[X] title bar:** triggers [CLOSE] and therefore identical with [CLOSE]
- **[ESC] Keyboard:** triggers [CLOSE] and therefore identical with [CLOSE]
- **Button placement:** [X] in title bar is sufficient; no [CLOSE] button needed unless it's a panel.

### 6.2 Authentication Screen (Login / Sign-Up / MFA)
- **Dismiss action:** [CANCEL].
- **Rationale:** Authentication is a self-contained transaction. No side effects should exist until the final "Sign In" button is clicked and succeeds. Abandoning the flow must leave no partial session, temp tokens, or half-created accounts.
- **[X] title bar:** Maps to [CANCEL]. 
- **[ESC]:** Maps to CANCEL.
- **Buttons:** `[Sign In]` (primary, left) `[CANCEL]` (safe, right).
- **Exception:** If the auth screen is embedded as a panel in a main screen (modeless), use [CLOSE] instead.

### 6.3 Process CONFIRMATION Screen (Modal Dialog)
Confirmation Screens **confirm the start of a critical chage or long lasting transaction** (e.g. loading a file, calling a remote service) or change of application state (Logout, Exit, Discard all Changes, Aborting a transaction).

No transaction is running at this moment and not state change has happend yet.  
 
#### Message Text
Short description what is going to happen next such as "Loading File", "Booking your Flight"

#### Buttons 
This type of screens always only have these two buttons: 

1. **[CONTINUE]**: Signals process confirmation -> Close the modal to launch the  process from the parent screen - most probly with a with a Processing Status PopUp 

2. **[CANCEL]**. Revert all selections, closes modal, returns to previous state without side-effects.
  
* **[ X ] title bar and [ESC]** are mapped to [CANCEL].

### 6.4 Processing Status PopUp (Modal Dialog)
Processing Status PopUps are displayed for previously condfirmed, long lasting transactions and normally will display a spinner and/or progress bar to illustrate progress. 

Dismiss buttons depends on the progress' status and its revertability / revokability

1. Display **[CANCEL]** when the transaction did not start yet or when it can be easily revoked without Side Effects. Revoke the transaction, close the modal and return to previous state.
  
2. Display **[CLOSE]** and **[STOP]** **when the transactions is spinning** and either cannot be fully revoked or has side-effects: 

    * **[STOP]** stops the process and opens a Stop Transaction PopUp that informs about the Stopped State and will ask for [CONTINUE] to resume the stopped process or to [CLOSE] it. Continue() and Close() is always handled by this panel, not the PopUp.    

    * **[CLOSE]** leaves the transaction inattended in a fire&forget mode, closes the modal and returns to the parent screen.
    
* **[ X ] title bar and [ESC]**: Map to the current dismiss action ([CANCEL] or [CLOSE]). Neither [X] nor [ESC] will ever [STOP]

### 6.5 Stop Transaction PopUp (Modal Dialog)
This Popup is called from a Processing Status PopUp when its [STOP] or [CLOSE] button is clicked to stop an ongoing transaction. It informs about the Stopped State such as how many files of how many total were alreay written. 

With the [CONTINUE]-button the modal is closed and the parent tries to to resume the stopped process. 

With [CLOSE] thwill try to cancel the process, and when not possible let it continue in a fire&forget mode that finally releases resources and memory again. 



---

## 7. Background Task Rules (Spinner Active)

| State | Dismiss Button | [X] / ESC Behavior | Rationale |
|-------|---------------|-------------------|-----------|
| **Spinner running, task undoable** | **CANCEL** | Triggers CANCEL | Task can be aborted and be restarted with zero residue (e.g., in-memory search, uncommitted form validation). |
| **Spinner running, with side effects** | **STOP** | Triggers STOP | Task has already written state (e.g., partial file download, DB write, API call made with progression feedback). -> opens Popup asking for [CONTINUE] vs. [CLOSE] |
| **Spinner running, awaits completion notice** | **CLOSE** | Triggers CLOSE | Task cannot be stopped and will either complete or fail |
| **Spinner finished, result shown** | **[CLOSE]** | Triggers CLOSE | The task is done; the user is merely dismissing the completion notice. |

- **Never show [CANCEL] on a completion/success screen.** Use [CLOSE] instead.

- **If [STOP] is used,** the UI must clearly display what was already completed (e.g., "3 of 5 files loaded").

---

## 8. Quick Decision Matrix

| Screen Type                     | Side Effects?      | Spinner? | Use    | [X]/ESC |
|---------------------------------|--------------------|----------|--------|---------|
| Main Screen                     | Yes / No           | No       | CLOSE  | CLOSE   |
| Auth Screen                     | No (until success) | No       | CANCEL | CANCEL  |
| Confirmation (pre-commit)       | No                 | No       | CANCEL | CANCEL  |
| Confirmation (post-commit)      | Yes                | No       | CLOSE  | CLOSE   |
| Task in progress (undoable)     | No                 | Yes      | CANCEL | CANCEL  |
| Task in progress (side effects) | Yes                | Yes      | STOP   | STOP    |
| Task complete / Result          | Yes                | No       | CLOSE  | CLOSE   |

---

## 9. Naming Conventions for AI Vibe-Coding

- Use `onCancel()` only when the handler truly reverts state.
- Use `onClose()` only when the handler dismisses without reverting.
- Use `onStop()` only for interrupting background tasks with side effects.
- Map `onEscapeKey()` and `onTitleBarClose()` to the appropriate handler above — never implement custom logic directly in those handlers.
