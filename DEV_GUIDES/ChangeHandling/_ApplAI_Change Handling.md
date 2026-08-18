# ApplAI Generator specific Change Handling

* The **[CRnnn-German Case Title](../../CHANGES/REQUESTS/TEMPLATES/CRnnn-German%20Case%20Title.md)** Change Request TEMPLATE 

* Change Request **SAMPLE** -> **[CR001-Adjusting the Login Screen-S001](../../CHANGES/REQUESTS/CR000/CR001-Adjusting%20the%20Login%20Screen-S001.md)**

---

This document outlines **how AI-driven Change is handled for the Applai WebApp**. 

The goal here is, that change requests and the rules for implementing such change requests do not remain undocumented and are not inconsistently AI-prompted over and over again putting everyting what already runs at risk. 

That's why we want every change **documented in specific locations and only then picket up by the AI with a minimal, standardized always same prompt**: 

```plaintext
1. Read /VSC/client/AI/KIMI/CONFIG/CHANGE_RULES.md. 

2. Then implement the change request defined in /CHANGES/requests/CR-20250116-001-my-feature.md.  

3. Confirm the CR ID and your intended file impact before you write any code.
```

This keeps your requests version-controlled, reproducible, and scoped.

## What means "Change" in this context ?
"Change" here means among others
1. **adding** a new feature
2. **change** an existing functionality, a process or infrastructure
3. **adding, deleting, changing data** in a database, file, bucket etc. 
4. fixing a **bug**, **performance issues** or security breach, 
5. **compliance** issues
etc. 

or from a technical perspective: whatever requires a recompilation, re-test, re-distribution, etc. 

## How we handle Change-Requests 

### 1. Adhoc issue capturing
**Ad hoc issues, ideas and change request are primarely collected in the [ **DevLogs**](../../DEV_LOGs/_ApplaiGenerator_DevLog.md)** as part of the normal DayLog or collected in a dedicated **[DevLog](../../DEV_LOGs/_ApplaiGenerator_DevLog.md) file** such as [Change 260818](../../DEV_LOGs/2608/Change_260818.md).

These adhoc files will be reviewed. And when it makes sense, formal ["CRnnn-German Case Title"](../../CHANGES/REQUESTS/TEMPLATES/CRnnn-German%20Case%20Title.md) named Change Requests] are written as explained below. 

The Goal at this adhoc stage is to **get adhoc input written down pragmatically and fast** so that the head gets clear for the scheduled tasks at hand. 

### 2. Formal Change Requests
Formal Change Requests will be written on the basis of a formal [CRnnn-German Case Title](../../CHANGES/REQUESTS/TEMPLATES/CRnnn-German%20Case%20Title.md) Template and then put into the [Change Request Collection folder](../../CHANGES/REQUESTS/_Collection%20of%20Change%20Requests.md).

#### [ChangeList](../../CHANGES/_ChangeList.md)
Once the formal request is done, it will be mentioned in the [ChangeList](../../CHANGES/_ChangeList.md)

The goal here is to work with a [CRnnn-German Case Title](../../CHANGES/REQUESTS/TEMPLATES/CRnnn-German%20Case%20Title.md) named template, so that things are not forgotten and will be written in the correct topic structure, the right level of details and a sort order that makes sense for the AI and will - together with the finally reduce the amount of reprompting to zero.  

### 3. Prompt
Prompts are normally DRAFTED in the formal [CRnnn-my Change](../../CHANGES/REQUESTS/TEMPLATES/CRnnn-German%20Case%20Title.md)  request file. 

However the final request is pasted into a new Prompt-File in the [AI Prompts](../../VSC/client/AI/KIMI/PROMPTs/_AI%20Prompts.md) folder. 

From here it will be 1:1 copied to the AI prompt of your choice and executes. All feedback will be saved in the Promt-File as well from where a summary is then compile for the [CRnnn-German Case Title](../../CHANGES/REQUESTS/TEMPLATES/CRnnn-German%20Case%20Title.md) formal CR file and the status will be updated in the [ChangeList](../../CHANGES/_ChangeList.md)

### General Remarks
Not every issue leads to vibecoding and prompt. 
And some issues are not technical. Financial, legal, etc. issues will be handled outside the scope of the technical project by the project's enclosing "Business" section. 


