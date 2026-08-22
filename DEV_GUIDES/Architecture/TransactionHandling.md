# Complex Transaction Handling

## Context
The most critical and difficult system failures to handle, analyse and fix from a users perspective and in terms of business impact it is not when the system crashes or shows wrong data, but when transactions are fired and not taken care of whether they have successfully completed, have crashed in between, are still endlessly spinning and what kind of side-effects they might have caused that all went fully unnotice. 

Especially in the context of AI generated code, not knowing where such transactions are going is not just potential isolated failure in your scope of responsibilities but might cause services blame and banning you and your company for inappropriate and/or excessing request(-loops) or you might end-up in endless (legal, financial, reputational) disputes when your system tells another story than the receiving system and vice-versa. 

### Motivation
As the health of (long lasting) transactions is non negotiable and therefore must be part of the initial design rather than an after-thought when the system already sucks,  I highly recommend that every vibecoded project must having transactional security and control baked into the initial context. 

## TRANS.md
I have put whatever "transactional" in a dedicated TRANS.md file which when referenced by the SPEC.md is part of the AI generated Apps overall AI Context. 

### Scope of Trans.md
Currently the Trans.md just covers transactionsl GUI aspects. It defines the standard Confirmatin and Error Messages, Icons and Popups, Spinners and Progres Bars that will keep users informed about the current transactions state and what he/she can do to Cancel, Close, Stop, Continue, Revoke, Postpone, Delay, Resume, ReRun, Analyse, ... Running transactions from the moment where they are launched from a so called BASE-Screen till the control is given back to this Base-Screen either completed or failed (or the app completyl crashed and fucked).    



### TRANS.md should not be used. 
However, it can be ignored by all applications that have nothing asynchrously going on or all transactions can always be fired and forgotten without caring for fails. When it works, it works - when not - it does not. 
Adding Tans.md would jus tadd unnecessary and confusing PopUp-Bloat to something thats not worth it and the user might never care. 
For Debugging other, more pragmatic tools (Logs, Console/Admin mode, etc.) have to be used anyway in the background, without bloating the frontend.



. 
**Long-running transactions** typically follow a standard sequence of modal states designed to keep users informed at each stage without letting them think the app has frozen.


#### Side note: 
I have chosen TRANS as it might not only relate to TRANSactions but many other TRANS-things such as TRANSPort(ation), TRANSition, or in general for everything that is moved between system and therfore requires standardization to keep such system in sync upon commonly agreed protocols. 


## Standard PopUps for long running and/or critical transactions
### Confirmation Modal
Shown before the transaction starts, this modal summarizes the action (amount, fees, recipient, etc.) and requires explicit user consent, often with "Confirm"/"Cancel" buttons, since these actions usually can't be undone.

### Awaiting-Signature / Authorization Modal
For financial transactions a modal appears asking the user to approve or sign the transaction in their external wallet, typically disabling the app's confirm button and showing "Confirm in wallet...".

### Pending / Processing Modal
Once submitted, a modal shows a spinner or progress indicator with status text like "Processing" or "Waiting for confirmation," often including a transaction hash or link to track progress externally. 

### Success Modal
Displayed when the transaction completes, this modal confirms success with a checkmark, summary/receipt details, and often a link to view full details (block explorer, order confirmation, etc.), plus an option to start a new action.

### Failure / Error Modal
If the transaction fails or is rejected, an error modal explains what went wrong (e.g., insufficient funds, network timeout, user rejection) and offers a retry or adjust-and-resubmit option. Notably, user-initiated cancellations (like wallet rejection) are often handled silently by resetting to idle rather than showing an alarming error.

### Timeout / Stuck-Transaction Modal
For unusually long waits, some apps show a modal explaining the delay (e.g., "network congestion") with options to wait, speed up (increase fee), or cancel the pending transaction.

## Summary of the typical modal sequence:

Modal Stage	Purpose	Typical UI Elements
Confirmation	Get explicit user consent before starting	Action summary, Confirm/Cancel buttons 
designsystem.digital
Awaiting signature	Wait for external approval (wallet, 2FA, etc.)	"Confirm in [wallet/app]..." disabled button 
cryptoskills
Pending/processing	Show transaction is in progress	Spinner, status text, hash/ID link 
web3ux
+1
Confirming (blockchain-specific)	Show progressive finality	Block count, confirmation progress bar 
chainscorelabs
+1
Success	Confirm completion	Checkmark, receipt, explorer link, "done" action 
chainscorelabs
Failure/error	Explain what went wrong	Error message, retry button 
cryptoskills
Timeout/stuck	Handle abnormal delays	Explanation, speed-up/cancel options 
chainscorelabs
+1



A key best practice across these patterns is to avoid a single generic "Loading..." modal for the entire flow — using distinct states prevents users from wondering whether they need to act (e.g., check their wallet) versus simply waiting. This is especially relevant for something like fluXTimer or job-offer tools where you might have async operations (API calls, blockchain interactions, or long-running backend jobs) that benefit from the same idle → pending → success/error state machine pattern