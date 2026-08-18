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