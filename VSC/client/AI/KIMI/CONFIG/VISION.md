# Vision.md for KIMI AI
 
## 1. Product Vision
Compile a job-offer-specific `Resume.md` and `CoverLetter.md` from 
1. a Supabase hosted, "SuperCV.json" called  master-file (that lists ALL skills, expertise, and base resume data) and 
2. a job-offer description PDF
The such created `Resume.md` and `CoverLetter.md` shall be reduced to what the specific job-offer requires.

### Scope of MVP version
For the first MVP, the app lists and loads a user-selected SuperCV.json file from a `Applai`-named Supabase Storage bucket's fixed named `SuperCV` folder (`Applai/SuperCV/...`), lets the user modify it, and saves the such "reduced" resume back to that same folder under a new name such as `myGeneratedCV.json`. For this MVP, users manually upload new SuperCV master JSON files outside the app (for example through the Supabase dashboard). 

In-app master-file upload might be impolemented in a future stage.

The core component displays the loaded JSON file in an editable, collapsible TreeView where nodes can be selected/deselected to include them in or exclude them from the newly generated `myGeneratedCV.json`.

## 2. Target Audience
| Segment | Description | Tech Savviness | Primary Device |
| --------- | ----------- | ---------------------- | -------------------------- |
| Primary | Ordinary jobseekers applying for a web-published job-offer | Low | Windows Desktop |
| Secondary | Developers interested in how the app is built and using it as a template for other apps | High | Windows Desktop |

## 3. Core User Journeys
### Journey A: The "Happy Path" (Most Critical)
1. **Authentication:** User opens the app and is greeted with the Welcome Screen (S000), where the S001 Login Popup asks for their email and password. Authentication is performed by Supabase Auth against the user's own Supabase account; a valid Supabase Auth account is what makes a login succeed. This step is skipped when an in-memory Supabase session is restored.

2. **MainScreen:** After successful authentication, the MainScreen (S002) displays the last session state when available, including the TreeView and its selections. When resume data is absent from the cache, S002D2 — the SuperCV Master File Import Dialogue — opens. The user selects a file already present in the fixed `Applai/SuperCV` folder; no storage URL is entered. If the Storage bucket/folder cannot be accessed, contains no suitable resume files, or the selected file cannot be loaded, show a warning. The MainScreen provides three global action buttons: [EXIT] to close the app, [LOGOUT] to return to the Welcome Screen, and [CANCEL] to abort running transactions or reset node selections.

3. Once a valid resume file is loaded, all data from the JSON file is displayed in the MainScreen TreeView with all boxes initially selected. The user can collapse/open branches, select/deselect tree nodes to activate specific skills or experiences, and edit loaded text for skills or experiences. [CANCEL] resets all nodes to selected and discards text modifications when no transaction is running.

4. When the user clicks [EXPORT], the user supplies a name for the export JSON file such as `myGeneratedCV.json` (pre-filled from user settings if configured). When the name is valid, the popup closes and the app generates a subset of the loaded SuperCV JSON containing only selected TreeView nodes, then saves it into the SuperCV folder in Supabase Storage. Existing-name collisions use the established auto-suffix rules against the Storage object listing.

5. The app can be exited anytime when the [EXIT] button is clicked. EXIT closes the application immediately without waiting for pending transactions, after user confirmation.

### Journey C: Recovery / Error
1. **Authentication goes wrong:** Display an error and let the user retry. Invalid Supabase credentials show the standard invalid-email-or-password message. When no authenticated Supabase session exists, never show any screen other than S000 Welcome and S001 Authentication popup.

2. **SuperCV.json cannot be loaded:** Display an error and let the user choose a different file from the SuperCV Master File Import Dialogue.

3. **Supabase Storage bucket/folder or file is unavailable:** Display an error that `Applai/SuperCV` or the selected file is not accessible, then let the user retry or choose another listed file.

4. **SuperCV is not valid JSON:** Display an error and let the user choose a different file from the SuperCV Master File Import Dialogue.

## 4. Success Criteria (Definition of "Done")
1. User can log in with valid Supabase Auth credentials.
2. A valid SuperCV master file can be listed and loaded from Supabase Storage path `Applai/SuperCV`.
3. The SuperCV master file is displayed in an editable TreeView.
4. A copy of the SuperCV master file containing only selected TreeView nodes can be written to the `Applai/SuperCV` folder in Supabase Storage.
5. All functionality works in a mobile browser (smaller screen) too.

## 5. Non-Goals (What we explicitly do NOT do)
* No native mobile apps — SPA only.
* Use only free or OpenSource libraries with good reputation and great acceptance in the dev community.
* English language and date format is enough. No internationalisation is required.
* No in-app upload or creation of new SuperCV master files in this MVP; users upload those files outside the app. This is a future-stage feature.

## 6. Competitive Differentiation
By using an efficient TreeView for selecting and editing a SuperCV JSON file, the user can efficiently compile a job-offer-specific, relevant resume from a complete SuperCV template reduced to what is relevant for the application.

## ChangeLog
> **Supabase migration pass (2026-08-17):** This revision replaces the GIST-backed MasterResume load/save flow with Supabase Auth (user login) and Supabase Storage (bucket "Applai", folder "SuperCV") for master/generated CV files. See inline "UPDATED 2026-08-17 (Supabase migration)" callouts for each specific change.