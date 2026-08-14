
> I need a **Windows software tool or an online app that reads a JSON-file and displays the JSON structure in a tree view** with the following functionality: 

Tree-nodes can be selected or deselected. When deselected and the apps [Display ALL]-button is OFF, then all deselected nodes (including their child-nodes) are hidden in the display. When the [Display ALL]-button is ON, ALL nodes are displayed regardless of whether selected or not. 

When the [EXPORT]-Button is clicked the app will generate a new JSON file with the same structure as the original JSON file but only with the selected nodes and branches in it. So the generated JSON is always a subset of the original JSON.   
  
Give me an indication whether such a ready made tool or online service exists which can do that.  

---

I could not find anything ready-made that offers exactly the specific workflow . 

**The combination** of checkbox-based tree node selection, a "Display ALL" toggle that hides deselected branches (including children), and a one-click export of only the selected nodes as a subset JSON is not available in any existing tool I found.


## Recomendation
Use jsoneditor tree UI as the starting point, add tri-state checkboxes per node, maintain selection separately from expansion/filter display state, then recursively prune the original parsed JSON on export. jsoneditor already provides the editable tree and a JavaScript API for retrieving JSON, under Apache-2.0 licensing.

You may user https://jsoneditoronline.org/#left=local.pizusa as reference (copy past the app description for your own requirements).

## Alternatives:

### Closest Windows Tool: JSONedit
JSONedit is a free Windows JSON editor with a tree view and a separate "list view" that supports multiselect, filtering by node type, and copying nodes. However, it does not have the specific "Display ALL" toggle or a direct export-to-subset-JSON feature based on tree selection. You can copy selected nodes individually, but not export a filtered tree structure in one action. 

### Closest Online Tools:
Data Formatter Pro offers an interactive tree view with search, type filtering, and export, but no individual node selection with subset export. 

JSON Remove Keys / Filter lets you keep or remove specific keys via dot-paths, but this is text-based filtering, not visual tree selection. 

Bottom line: Your requirement is quite specific and does not appear to exist as an off-the-shelf product. 
The workflow you described (visual tree selection → toggle visibility → export subset) would most likely need to be implemented as a custom web application (e.g., using a JavaScript tree component like jsTree or React Sortable Tree) or a small Python script with a GUI (using Tkinter/ttk treeview or a web framework like Streamlit).
