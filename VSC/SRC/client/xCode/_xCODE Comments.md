# xCODE Comments Folder

## Principles of xCode-SourceCode Documentation
**This folder is developers only internal documentation** and it is therefore never part of the final product! 

xCode-Files contain instructions, technical hints, tips, background information, recommendations, ideas for improvement etc. that are only relevant to sourcecode mainainers/developers and therefore must not be shared with the end-user or other project stakeholders. 

This folder contains **MarkDown (*.md) formatted CodeComment-files** which in their entirety mimic the directory structures and filenames of the VSC managed SourceCode-project-folder. 

So, for instance, the *.vscode/launch.json* file under the ProjectRoot is commented with a corresponding *.vscode/launch.json.md* file in this xCODE Folder. 

However, be aware, that not every tiny file is commented this way. When not, the file is just missing in the xCode folder (but can be added anytime later, should it make sense). 

**This folder is documentation only**: whereas this folder is included into the GitHub Repo, it must be explicitely excluded from builds and deployments. 

## Starting Points
Same as for the **SourceCode** the Starting point of this Code-Doc is the **[Main.cs](Main.cs.md)-file**. 

Run/Debug/Deploy Configuration start with the [launcher.json](.vscode/launcher.json.md) documentation 

## Core Files


#### vvv--: : : : TODO : : : :--vvv

```plaintext

+--.vscode
   +--launch.json   (VSC standard: run/debug configuration start)
+--bin              (VSC standard: the compiled binaries such as dlls etc. )
+--my_scripts       (my personal location for PowerShell Deployment Scripts
   +--debug.ps1     (Powershell Script to install the new built Plugin in a live FloLauncher.exe in debug mode)
   +--release.ps1   (Powershell Script generate the optimized (lean) production code)   
+--obj              (VSC standard: don't touch)
+- xCode            (my Code Documentation folder)
+--Flow.Launcher.Plugin.FlClicker.csproj  (VSC standard: Project Configuration File)
+--Flow.Launcher.Plugin.FlClicker.sln     (VSC standard: Project Solution File)
+--Main.cs          (VSC standard: MainProgram and therefore Single Point of entry into the SourceCode)
+--plugin.json      (FlowLauncher Standard: GitHub Configuration for Production Releases). 

```