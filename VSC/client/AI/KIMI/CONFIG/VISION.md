# Vision.md for KIMI AI

## Metadata

Do not use this "MetaData" section for AI generation! It is is for human, internal use only. Start the document at the "1. Product Vision"-section

**Owner**: rene.baron@baronsolutions.ch
**Last updated of document**: August 8th, 2026
**Next review scheduled**: - 

* **based on the [VISION template](../../../../../../../../../../WORK/ENTITY/AI/PROVIDER/K/Kimi/CONFIG/TEMPLATES/VISION_template.md)** of the [KIMI Project Configuration File TEMPLATE Collection](../../../../../../../../../../WORK/ENTITY/AI/PROVIDER/K/Kimi/CONFIG/KIMI%20Project%20Configuration%20Files.md)

---

## 1. Product Vision
Compile a job-offer specific Resumee.md and CoverLetter.md from a given in MasterResume.json (that contains ALL skills and expertises) and a JobOffer description file with a focus on matching the content to what is required by the joboffer. 

## 2. Target Audience
| Segment   | Description | Tech Savviness         | Primary Device             |
| --------- | ----------- | ---------------------- | -------------------------- |
| Primary   | ordinary JobSeekers applying to a web published JobOffer | Low | Windows Desktop] |
| Secondary | Developers interesting in how the app is built and using it as a template for other apps  | High | Windows Desktop] |

## 3. Core User Journeys
### Journey A: The "Happy Path" (Most Critical)
1. User opens the App where he/she is asked for UserID and Password
2. After Authentication the Data from the last MasterCV.json is displayed with the same skills and experiences selected in the treeview as when left the last time. When such data is not found, he will be asked for the URL of the GIST where this MasterCV.json can be found.
3. All the data from the MasterCV.json file is displayed in a TreeView, where the user can collapse/open tree-branches, select/deselect specific tree-nodes (to activate specific skills or experiences) and edit the loaded text displayed for the tree-node related skill or experience. 
4. When the users clicks the EXPORT button, the app will generate a subset of the MasterCV.json into the CV.json file with only the previously selected nodes from the tree-view. 
5. The App can be closed anytime when the EXIT-Button is clicked.

### Journey C: Recovery / Error
1. **Authentication goes wrong**: Display an error message and let the user retry again.   

2. **MasterCV cannot be loaded**: Display an error message and let the user insert a new path. 

## 4. Success Criteria (Definition of "Done")
1. User can login, MasterCV is displayed in an editable treeview where the user either can generate the CV.JSON. 

## 5. Non-Goals (What we explicitly do NOT do)
* "No native mobile apps — SPA only"
* Use only free or OpenSource libraries with good reputation and great acceptance in the dev community. 

## 6. Competitive Differentiation
By using the best tree-view component for selecting and editing the MasterCV.json file the user is super efficient to compile a CV that is reduced to what is really relevant.  

