# ApplaiGenerator :: Generating Job Application Artefacts from a MasterCV

This locally running BrowserApp **generates job application artefacts** from a given in JobOffer.PDF and a MasterCV.JSON file. 

You can create your **MasterCV.JSON** file with the free **[Reactive Resume v5 and higher](https://rxresu.me/) Resume Creator App** from where the CV-data then will be exported as the bespoke "MasterCV.JSON"-file. 

You can crate the **JobOffer.PDF** by inserting the Job Offer URL into the [ApplaiScraper Agent]() that will copy the job-offer into a GitHub hosted PDF - or alternatively you create a PDF from the web-published Job-Offer with your own tools or AI.  

## Features

### Current Features
Currently the App displays a a tree of the given in CV's skills and experiences. 

From within this tree, the user can individually activate/deactivate those items for appearance in the final joboffer-specific jop-application artefacts. 

Currently the ApplaiGenerator generates just *.md files for further manual editing (me personally I am using WestWind0s "Markdown Monster"-Editor that finally allows me to export the files in *.pdf and/or *.docx format.)

### Next Features
* manually editing activated items with versioning-carousel (moving back and forth versions with the click of a button). 
* Automated page breaks where it makes sense (such as keeping Titels and first list items together) 
* Setting manual page breaks and page numbers
* Creating an index for CVs longer than 3 pages. 
* Ai support for spellchecking and recommendations

### Planned
Ai-driven highlighting of skills and experiences upon job offer requirements with a button to automatically switch on/off relevant/irrelevant     items. 


## Folder Structure
* 
## Project Configuration 


### GitHub
This subproject is stored in its own **"ApplAi_Generator" named GitHub Repo** on https://github.com/realB12/ApplAi_Generator

