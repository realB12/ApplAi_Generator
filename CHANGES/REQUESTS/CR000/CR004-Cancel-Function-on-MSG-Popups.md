# CR004-Cancel-Function-on-MSG-Popups

## 1. Context & Goal
When the [Load from SuperCV] Button is clicked, I am getting a Message Popup that asks me for confirmation to "Replace current data". 

However, this Popup only has a Standard [CONTINUE], but no [CLOSE]-Button nor an [X] button in the top right corner for closing the PopUp returning to the laste state without side-effects, nor does it react on [ESC].   

What I need is that **ALL persistent confirmation Popups always have 
1. a [CLOSE]-Button in the footer and an [X] button in the top-right corner**, that will close the Popup either immediately. 

## Semantics of "Cancel"
The "Cancel"-Function is triggered by an [X]- or [Cancel]-button or when the user clicks "Escape" on the keyboard -> [ESC]. 

**When no transaction** is running in the background and therefore no spinner is displayed in the PopUp, **"Cancel" means closing the Popup** without side effects and returning to the previous state from where the Popup was launched. 

However **when a Popup has a running spinner** hinting for a running background transaction that waits for completion, then [Cancel] triggers another Confirmation PopUp where you have to either click an

1. [Abort]-Button for cancelling the running transaction and only after its successful abortion (which might take a while as well, with the spinner spinning), the Popup will be closed. 

2. [Close]-Button to close the PopUp and keep the transaction running in fire and forget mode. 

When [Abort] is clicked but the transaction still hangs, the Popup can always be closed with the [Close] button (leaving the terminating transaction pending). 

## Difference between "Cancel" and "Close"
In a nutshell: "Cancel" is about cancelling a running process or transaction - which might be a complex process again - whereas Close is just closing a window without side-effect and things to consider. 

"Cancel" is differnet to "Close" in a sense that "Cancels" always terminates (aborts) a started process (sequence of activites/screens) and/or running transactions or terminates the process in a "fire and forget mode" where the transactions keeps going in the backgroud. 

"Close" on the other side is just closing a static screen without any side effects. 
## Semantics [Close], [Logout] and [Exit]-Buttons on MainScreens
[Close], [Logout] and [Exit]-buttons on MainScreens such as S002 have always immediate effect and will logout resp. exit without terminating or waiting for running transactions (fire and forget style)

## Semantics for [ESC]-keyboard-event
[ESC] keyboard event is always handled like the [Cancel] or [Close] button.
(There is never a [CLOSE] and a [CANCEL] button on the same screen. 

## 3. Desired State
Every Confirmation Popup has a an active [Cancel] and [X]-button that revokes the Process that otherwise would be confirmed with the [Continue] button. 

The process for "Cancelling" a running trunsaction such as when cancelling the loading or writing of a JSON-file when the fileserver is down needs to be specified first bevor it is implemented.

## Final Prompt
-> This Changae Request is executed August 19th, 2026 by the final Prompt in the PROMPTS Folder -> [17 CR004-Cancel-Function-on-MSG-Popups](../../../VSC/client/AI/KIMI/PROMPTs/10-19/17%20CR004-Cancel-Function-on-MSG-Popups.md)

