# Creating the SPEC.md 

This Prompt has generated the final [SPEC](../../CONFIG/SPEC.md) in a detail that would have taken me days to compile manually!

## Key Lessons Learned
Do not write the SPEC.md yourself! Get it generated from AI. 

Although this version was generated with the [01_EVAL_Best DevStack for ApplaiGenerator ](../../../PROMPTs/00-09/01_EVAL_Best%20DevStack%20for%20ApplaiGenerator%20.md) Prompt I have found that I was not clear on the Authentication part, which I wanted afterwards to be State of the Art. 

Thefore the more generic [05_Specs for the Login Form](../../../PROMPTs/00-09/05_Specs%20for%20the%20Login%20Form.md) with a focus on the Authenticaton panel turned out to be the better candidae for the MVP. Then just adding the Specs for the MainScreen was just a breeze. 

Do not try to early write the Specs in the detail and format the AI will write the Specs. Stay Generic. Just describe what you want. Using explicite Screennames such as "S001", "S002" and "SMSG" of generic Message Popups helps a lot to stay focused. 

Describing then every Screen creates a  good structure for prompting the SPEC.md.


## The Prompt

Give me the spec.md for building a state of the art top secure Welcome Screen / Landing Page ("S000") with a Login PopUp displayed ("S001") of a secure Single Page Application which, when filled in right, navigates to the MAIN-Screen ("S002"). 

For every Screen give me a short description of the Labels, Input-fields and Buttons with their function. 

Give me an interaction diagram where its visible how navigation can flow between screens upon what event. 

Always follow international best practices and best in class examples for Login-Screens and Authentication procedures

Compile the Spec.MD ready-made for vibecoding in a sense, that all ambiguite, inconsistences etc. is removed and we can be assured that no reprompting will be required. 

Specs only! Do not code yet! 

## "S000" Welcome Screen
The Welcome Screen S001 just displays a Welcome message and the Application's Name which is "Applai Resume Generator". It checks whether the Authenticaton service is up and running and when yes displays the S001 Login Screen centered in the middle of its screen. 

## "S001" Login Screen
Design the Login Screen to interantional standards and best practices. 
1. Define its Input Fields with input rules/constraints
2. Define the button it needs and the functionality behind
3. Specify Propts the Users are greated with. 

Consider that a returning user is just passed by (no need to enter the form). 

## "S002" Main Screen
In the mainscreen the user can either load a new MasterCV.JSON file from a GIST.
The loaded *.JSON file is then displayed in a feature-rich TreeView Component ("TVC01") 

### "TVC01" TreeView Component
This TreeView component displays the loaded MasterCV.JSON content as selectable nodes with editable info-field associated with JSON-enties such as

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

All tree-nodes can be selected or deselected.

All tree-nodes can be collapse and extended again by double clicking the row

### [Display All] Button
When the S002 Screen's [Display ALL]-button is OFF, then all deselected nodes (including their child-nodes) are hidden in the TreeView. 

When the [Display ALL]-button is ON, ALL nodes are displayed in the TreeView regardless of whether selected or not. 

### [Export] Button
When the [EXPORT]-Button is clicked the "S002D1" Export Dialogue PopUp appears where the user can choose a Name for the exported JSON file. 

The such exported GeneratedCVnn.JSON file has the same structure as the originally loaded MasterCV.JSON file, but will contain only the previously selected nodes and branches in it, but not the deselected ones.

So the generated GeneratedCV.JSON is always a subset of the original JSON.  

### S002D1 Export Dialogue PopUp
This Popup appears in the "S002" MainScreen when the [EXPORT]-Button is clicked. Here the user can insert a Name for the exported JSON file. 

The default name for the exported file is "GeneratedCV". Should it already exist in the GIST it will be saved with a two-digit number extension "nn" such as "GeneratedCV01.JSON", then Generated02CV.JSON and so on. 

So the Popup has the following componnents
1. A message that prompts the user to insert a qualified name for the exported CV

2. An "CV Name" labeled **input-field** where the suser inserts a qualified name for the exported CV (length between min. 3 and max 23 letters, only regular characters, numbers and "-" and "_" allowed. 

3. a **[Cancel]-Button** that just closes the PopUp without any sideeffects. This includes the cancellation of an already running export transaction -> so the Popup will close by all means!

4. an **[Export]-Button** that closes the PopUp and makes the underlying S002 Main Screen to same the GeneratedCVnn.JSON to the GIST according to the herein specified rules. 

Make sure the design of this PopUp is consistend with the "SMSG" design for Messages, Errors and Warnings. 

## "SMSG" PopUp for Messages, Errors and Warnings
Use a standard, best in class PopUp to display all kind of messages: errors, warnings, etc. Use different Icons to differentiate the various message types. 


## Design Notes

### ScreenNumbers
Write the ScreenNumbers "S001", "S002" etc into the top left corner of every screen (simplifies troubeshooting when users can refer to explicite ScreenNumbers). 

### Error Messages
Have a consistent concept/pattern about how to display error and warning messages in a PopUp (Use international best practices for this standard)

----

