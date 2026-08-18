# ApplAI Generator specific Change Handling

This document desribes how the AI must be prompted for well documented change request. 

The goal here is, that 

1. change requests and
2. the rules for implementing such change requests

are not AI-prompted over and over again but are documented first in specific locations and then picket up by the AI when requested to execute ChangeRequest XYZ with the following prompt: 

```plaintext
1. Read /VSC/client/AI/KIMI/CONFIG/CHANGE_RULES.md. 
2. Then implement the change request defined in /CHANGES/requests/CR-20250116-001-my-feature.md. 3. 3. Confirm the CR ID and your intended file impact before you write any code.
```

This keeps your requests version-controlled, reproducible, and scoped.

## What is "Change"
"Change" here means among others
1. **adding** a new feature
2. **change** an existing functionality, a process or infrastructure
3. **adding, deleting, changing data** in a database, file, bucket etc. 
4. fixing a **bug**, **performance issues** or security breach, 
5. **compliance** issues
etc. 

or from a technical perspective: whatever requires a recompilation, re-test, re-distribution, etc. 

## How we handle Change-Requests 

### 1. Adhoc issues
**Ad hoc issues, ideas and change request are primarely collected in the [ **DevLogs**](../../DEV_LOGs/_ApplaiGenerator_DevLog.md)** as part of the normal DayLog or collected in a dedicated [Change YYMMDD](../../DEV_LOGs/2608/Change_260818.md) file. These files will be reviewed and when it makes sense formal Change Requests are written: 

### 2. Formal Change Requests
Formal Change Requests will be written on the basis of a formal [CR YYYYMMDD NNN kebab case title](../../CHANGES/REQUESTS/TEMPLATES/CR-YYYYMMDD-NNN-kebab-case-title.md) and then put into the [Change Request Collection folder](../../CHANGES/REQUESTS/_Collection%20of%20Change%20Requests.md).

### [ChangeList](../../CHANGES/_ChangeList.md)
Once the Formal Request is done, it will be mentioned in the [ChangeList](../../CHANGES/_ChangeList.md)

### 3. Prompt
Prompts are normally drafted in the formal [CR YYYYMMDD NNN kebab case title](../../CHANGES/REQUESTS/TEMPLATES/CR-YYYYMMDD-NNN-kebab-case-title.md) change request. However the final request is Pasted into a new Prompt-File in the [AI Prompts](../../VSC/client/AI/KIMI/PROMPTs/_AI%20Prompts.md) folder. From here it will be 1:1 copied to the AI of your choice and all feedback saved in the Promt-File, the Formal Request File and the 
[ChangeList](../../CHANGES/_ChangeList.md)

### General Remarks
Not every issue lead to a Prompt. 
And some issues are not technical and will be handled by the enclosing "Business Project"


