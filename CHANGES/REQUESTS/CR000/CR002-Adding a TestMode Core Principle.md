# CR002: Adding Test-Mode functionality

* The **[CRnnn-German Case Title TEMPLATE file](CR-nnn-YYMMDD-German%20Case%20Title.md)**

* The **[ChangeList](../../_ChangeList.md)**

* [Change Handling **Guidelines**](../../../DEV_GUIDEs/ChangeHandling/_ApplAI_Change%20Handling.md)

* The GENERIC [CHANGE RULES](../../../VSC/client/AI/KIMI/CONFIG/CHANGE_RULES.md) Contex Files with the Rules how all kind or Change Requests shall be handled by the AI. 

<span style="color:red; font-weight:bold">Attention</span>: **Delete this "Intro Section"** in the final AI Prompt! It is just a reminder for documentation purpose but might confuse the AI!

<- inspired by DEVLOGS [Change 260818](../../../DEV_LOGs/2608/Change_260818.md) file

* implements the [TestMode Concept](../../../DEV_GUIDEs/Architecture/TestMode-Concept.md)


---

## 1. Context & Goal
For efficiently live end-user testing and maintaining I should be able to switch the App into some kind of TestMode where then certain functionality will be different from Production Mode. This includes: 
1. Prefilling input-data with static values (for instance for the Authentication Screen). 
2. Display additional information (such as more detailed error-messages, internal messaging, debug infos, etc. ) 

## 2. Current State
Currently the app does not understand TestMode and does not provide any TestFeatures. 

I have draftet a TestMode Implementation concept you must get from my GitHub Repo as "DEV_GUIDEs/Architecture/TestMode-Concept.md" and read it as a specification for implmenting this change.

## 3. Desired State
Have the [TestMode Concept](../../../DEV_GUIDEs/Architecture/TestMode-Concept.md) full implemented

4. ACTION
1. Load and Read the Test-Mode Concept from 

