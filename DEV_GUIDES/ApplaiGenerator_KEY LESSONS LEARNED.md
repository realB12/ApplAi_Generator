# ApplaiGenerator: Key Lessons learned

## Save credits on keep sessions short
Credits do not increase with the size of your code but with the "length" of your session!! (Restarting ApplaiGenerator development in a new session gave me 10x cheaper costs when adding new features!)

## Create as much of the apps functionality in the first iteration already 
You can trust that AI will come up with something useful regardless how waste and complex your given in specs will be. 
Most probably its not the best code, but the most complete architecture, structure, conceptual design and other deeply thought through, best practice meta-level stuff an individual rarely can compile. 
Based on this first draft, let the AI explain its code. Ask for diagrams and charts, state-models, etc. till you get the full high-level picture. 
Then you may review the sensitive parts and re-engineer those. 
Or when you are not happy with the overall concept, adjust it to your needs and re-generat from scratch. 

Building from small into complex like in the old days is over. Now you can go full circus and just review the critical parts. 

## Telling AI to generate a copy of an existing application is gold
Just tell your AI to generate the functionality of a commercial app (in my case Seconds Pro) is gold. 
Alternatively you can search for a similar app or already existing clone on GitHub and ask you AI to load it into you local dev-environment. 

## Be aware that AI might build for a different environment
Don't expect the AI generated Code to run on your local machine or within your IDE out of the box. Often, when not explicitely told to compile for YOUR environment,  AIs generate for Linux which will result in hours of guesswork when you are not a professional on either side of the porting. 
**Solution**: Either harness your AI that it really builds for your (Windows) setup (but might not find then a solution that meets your requirements) or ask AI before building your code what it means and advice for porting the code into your context, UPFRONT. 

## AI is good value for first prototype. Too expensive for adding features
Just adding color codes to the app was more expensive (310 credits) than generating the app from scratch (280 credits) -> wondering whether it would have been cheaper to add this functionality in the initial draft rather than adding it in a next iteration.

-> remember: **continue work in a new session may cost you 10x+ less!**

## Use Iterations
When you use Feature- or IterationNumbers when Prompting, the AI will use them along generated code-documentatoin when adding feature-related new code or when code is changed. 

So when you keep your iterations small and specific (for example just adding the color feature), you can reprolduce and follow up this change and learn form it when you need to apply the same change to different code. 

Yes, going in ministeps with AI costs you some tokens, but the documentation and assistance you are getting out of it is worth it.

## Sources
* [ApplaiGenerator DIARY](../../01%20DASHBOARD/ApplaiGenerator_DIARY.md)
* [ApplaiGeneratorDevLog](../DEV_LOG/_ApplaiGenerator_DevLog.md)

## Extended Insights
* [Owning The Code](Owning%20The%20Code.md)