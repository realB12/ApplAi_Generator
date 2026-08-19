# CR004-CLOSE-Button-on-MSG-Popup

## 1. Context & Goal
When the [Load from SuperCV] Button is clicked I am getting a Message Popup that asks me for confirmation to "Replace current data". 
However, this Popup only has a [Continue]-button, but no [Close]-Button 

What I need is that on such confirmaton Popups we alway have a [Close]-Button that goes back to the state immediately before the Popup is triggered. 

However make the [Continue]-Button de default activated button that will fire when the user clicks enter. 

## 3. Desired State
Every Confirmation Popup has a [Cancel] button that revokes the action that otherwise would be confirmed with the [Continue] button. 

## Final Prompt
-> Find the final Prompt in the PROMPTS Folder -> [16.1 CR003_Adding Default Login Credentials to .env.local](../../../VSC/client/AI/KIMI/PROMPTs/10-19/16.1%20CR003_Adding%20Default%20Login%20Credentials%20to%20.env.local.md)

This prompt was executed August 19th, 2026. 

# CR Confirmation
* **CR-ID: CR003** — "Adding Default Login Credentials to .env.local" (CR003 file)

* **Goal**: In TestMode, the S001 LoginPopup should prefill email/password from two new .env.local variables (VITE_TEST-USER-MAIL, VITE_TEST-USER-PW) instead of the currently hardcoded fixture values in testFixtures.ts. 

If .env.local or those values can't be loaded, both fields must stay empty and TestMode behavior should fall back to "off" (as if VITE_TESTMODE=no).

