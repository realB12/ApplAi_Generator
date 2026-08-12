# What it means to OWN an AI generated App and sell it for profit

The following app on https://fluxtimer.pplx.app is life and publicly accessible

It is generated with Perplexity Pro version.

It just took me 10 minutes for the prompt and the AI 10 minutes to generate a first local draft and another 2 minutes to publish this for the public.

So all in all 20 minutes for creating an advanced Workout-Timer similar to the Seconds Pro App. But the point here is not the feature. Its what follows afterwards.

As this app is is ment to sell customized workouts for individuals it **must be predictably stable** for the next few years and to PREDICTABLY add new features without crashing or changing things customers are already used to use (an therefore have spent time to learn the process). There must be no change to what has worked so far.

And therefore I have to OWN the app (code) and all the building process the same way I had to own it before AI. Owning is taking full responsibility for the code, the manuals, the setup etc. in a litteral sense: knowing all answers related to the product.

So after I had prompted and generated my first code iteration in less than half an hour, taking ownership took ways longer: 

* **Step 1** I had to download the code from the Perplexity generated Repo onto MY machine into MY VSC editor under MY control using MY tools. And it took me 2 hours to find out whether this was doable at all and how to do it and what tools and tweaking was required. Not mutch of assistance from AI. 

* **Step 2**: Creating project structdure folders and a project related development environment with my own GitHub Repos associated to manage the code: another 2 hours (testing and documentation included). Finally I was able to compile the code on my machine. 

* **Step 3**: However, compiling the code as suggested by the AI failed on my machine - off course. Why? Because AI has built and tested for Linux - not Windows.   
  
However, the AI has helped a lot and what would have taken me hours or even days figuring out the machine-code level cryptic (Linux related) errormessages where they are coming from, AI was able to point out DIRECTLY in which configuration files I had to change what to tweek it for Windows. 

**Lesson learned **: Either harness your AI that it really builds for your (Windows) setup (but might not find then a solution that meets your requirements) or ask AI before building your code what it means and advice for porting the code into your context.  

Step 4. Once the app was compiled successfully on my machine, publishing it with Perplexity AI was a breeze: 5 minutes.

So what I have got so far:
In 20 Minutes I have generated a minimal clone that mimics the core functionality of a professional app (Seconds Pro).

It took me all in all 5 hours to OWN it in a sense that I could claim that I can keep it running regardless of AI and that it really IS my code under my full control. 

Next steps:

It took me 2 days to figure out the exact additional features, final datastructure, interfaces with other apps, including sound, etc. to get the prototype ready. 
Another 2 days for user manual and generating meaningful example/template sessions to play with or to copy from. 

Most of what followed the fist AI generation was conventional programming where I am just co-piloted by Perplexity for simple function and test case generation and code documentation.

However, just adding a single "color" field to the database that steers the color of a step when displayed, has triggered a lot of unwanted code-change and has burned tokens massivele, where in the end, I had to completely roll back and do it manually again because the thing has become too messy when left in the hands of AI. And such manual tweaking is ways cheaper than burning tokens on minor increments. 

In a nutshell:
Generating an app is - when it comes to own and maintaine the code over a longer time - like downloading an existing app from GitHub before AI. The difference is, that owned code is really our code and you still have an AI which is absolutely great to explain this code to you, to advice and sometimes even fix errors and suggest for next steps. 