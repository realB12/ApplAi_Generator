# ApplAi :: The Generator

This locally running BrowserApp **generates job application artefacts** from a given in JobOffer.PDF and a MasterCV.JSON file. 

You can create your **MasterCV.JSON** file with the free **[Reactive Resume v5 and higher](https://rxresu.me/) Resume Creator App** from where the CV-data can be exported as a JSON-file you want to rename as "MasterCV.JSON". 

Create the **JobOffer.PDF** by inserting the Job Offer URL into the AppliAI Agent that will copy the job-offer into a GitHub hosted PDF. 


## Features

## Current Features
Currently the App displays a a tree of the given in CV's skills and experiences the user can individually activate/deactivate for whether they will appear in final joboffer specific CV-fieles. 

Currently the Generator generates just *.md files for further manual editing (that when final will be manually compiled into PDFs using the Markdown monster's PDF-export function). 

### Next Features
* manually editing activated items with versioning-carousel (moving back and forth versions with the click of a button). 
* Automated page breaks where it makes sense (such as keeping Titels and first list items together) 
* Setting manual page breaks and page numbers
* Creating an index for CVs longer than 3 pages. 
* Ai support for spellchecking and recommendations

### Planned
Ai driven highlighting of skills and experiences upon job offer requirements with a button to automatically switch on/off relevant/irrelevant items. 



## Project Configuration 


### GitHub
This subproject is stored in its own **"ApplAi_Generator" named GitHub Repo** on https://github.com/realB12/ApplAi_Generator

