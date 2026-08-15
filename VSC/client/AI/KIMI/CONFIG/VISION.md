# Vision.md for KIMI AI

## 1. Product Vision
Compile a job-offer specific Resumee.md and CoverLetter.md from a given in GIT hosted JSON file e.g. "MasterResume.json" (that contains ALL skills, expertises, base data typical for resumes) and a JobOffer description file in PDF format with a focus on matching the content to what is required by the job-offer. 

## 2. Target Audience
| Segment   | Description | Tech Savviness         | Primary Device             |
| --------- | ----------- | ---------------------- | -------------------------- |
| Primary   | ordinary jobseekers applying for a web-published job-offer | Low | Windows Desktop] |
| Secondary | Developers interesting in how the app is built and using it as a template for other apps  | High | Windows Desktop] |

## 3. Core User Journeys
### Journey A: The "Happy Path" (Most Critical)
1. **Authentication**: User opens the App and is greated witha Welcome Screen (S000) where he/she is asked for UserID and Password (S001 — Login Popup). This step is skipped when the User is recognized (e.g. from a cached token).   

2. After successful Authentication the MainScreen (S002) displays the same state (TreeView for the last loaded Resume file with the same boxes selected/deselected as when the App was left the last time). When such Resume.json data is not or no longer found (neither in the cache nor in the GIST), the user will be asked for the URL of the GIST from where a new MasterResume can be loaded. When the GIST cannot be found, no Resume files can be found or when no Resume file can be loaded from the GIST: show a warning. 

3. Once a valid Resume Files was loaded, all the data from the such loaded JSON-file is displayed in the MainScreen's TreeView, where the user can collapse/open tree-branches, select/deselect specific tree-nodes (to activate specific skills or experiences) and edit the loaded text displayed for the tree-nodes related to skills or experiences. 

4. When the users clicks the [EXPORT] button, the user will be asked for Name for this file e.g. "GeneratedCV.json", the app will generate a subset of the initially loaded MasterResume.json into the "GeneratedCV.json" file with only the selected nodes from the tree-view. 

5. The App can be closed anytime when the CLOSE-Button is clicked.

### Journey C: Recovery / Error
1. **Authentication goes wrong**: Display an error message and let the user retry again.   

2. **MasterResume cannot be loaded**: Display an error message and let the user insert a new path. 

3. **GIST not found**: Display an error message and let the user insert a new path.

4. **MasterResume is not valid JSON**: Display an error message and let the user select a different file.

## 4. Success Criteria (Definition of "Done")
1. User can login
2. a valid MasterResume can be loaded from a given in GIST URL
3. The MasterResume is displayed in an editable treeview
4. A copy of the MasterResume can be written to the GIST with only the selected Nodes in the TreeView. 
5. All functionality must work in a Mobile Browser (smaller screen) too. 

## 5. Non-Goals (What we explicitly do NOT do)
* "No native mobile apps — SPA only"
* Use only free or OpenSource libraries with good reputation and great acceptance in the dev community. 
* English language and date format is enough. No Internationalisation is required. 

## 6. Competitive Differentiation
By using the best tree-view component for selecting and editing the MasterResume.json file the user is super efficient to compile a Resume that is reduced to what is really relevant for the job-application.  

