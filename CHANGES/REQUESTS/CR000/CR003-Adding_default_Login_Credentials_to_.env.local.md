# CR003-Adding_default_Login_Credentials_to_.env.local

## 1. Context & Goal
When the app is VB Code launched locally in TestMode (with "npm run dev" or URL = http://localhost:3000/?test=1) the UserName and Password for the LoginScreen must be prefilled with the following environment variables from the .env.local file. 

* **VITE_TEST-USER-MAIL**:  defines the default Testuser's Login eMail Address
* **VITE_TEST-USER-PW**: defines the default Testuser's Login LoginPassword

## 2. Exception handling
When the .env.local file cannot be found or loaded or the Values cannot be found or loaded keep BOTH fields empty and switch ProductionMode behavior as if TestMode is switched off (as if VITE_TESTMODE=no) 

## 2. Current State
In TestMode the Login pannel is filled with some hardcoded default values. These hardcoded values needs to be removed and Reading of default values for Testuser must be replaced by the values from the .env.local file.  

## 3. Desired State
When in TestMode display the UserName and Password from the  .env.local file. 
Do not change anything else. 

## Final Prompt
-> Find the final Prompt in the PROMPTS Folder -> [16.1 CR003_Adding Default Login Credentials to .env.local](../../../VSC/client/AI/KIMI/PROMPTs/10-19/16.1%20CR003_Adding%20Default%20Login%20Credentials%20to%20.env.local.md)

This prompt was executed August 19th, 2026. 

# CR Confirmation
* **CR-ID: CR003** — "Adding Default Login Credentials to .env.local" (CR003 file)

* **Goal**: In TestMode, the S001 LoginPopup should prefill email/password from two new .env.local variables (VITE_TEST-USER-MAIL, VITE_TEST-USER-PW) instead of the currently hardcoded fixture values in testFixtures.ts. 

If .env.local or those values can't be loaded, both fields must stay empty and TestMode behavior should fall back to "off" (as if VITE_TESTMODE=no).

