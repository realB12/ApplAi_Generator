# 13 Mapping the Reactive Resume to the TrreeView

Find the example Reactive Resume generated SuperCV.json file at https://github.com/realB12/ApplAi_Generator/blob/main/VSC/data/SuperCV/supercv.json. 

Files similar to SuperCV.json need to be DYNAMICALLY represented in the Applai Generator's TreeView Component on S002 where they have to remain collapsible, selectable and exportable as defined. 

Static assumption about the content is wrong as the SuperCV.json may contain everything from nothing to full blown. 

At least the maximum depth level of the structure is given by the example. Further you may assume that the amount of topics like "Experiences" or "Skills" are complete. But you have to be aware that the datamodel for every topic id different (but within the topic, the datastructure is consistent) 

What kind of solution do you suggest to implement this in the current App?

