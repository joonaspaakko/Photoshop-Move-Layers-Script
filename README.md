- [Usage](#usage)
- [Align to selection after move](#align-to-selection-after-move)
- [Useful info about layer selection!](#useful-info-about-layer-selection)
  - [Selecting layers with move tool:](#selecting-layers-with-move-tool)
  - [Selecting layers without the move tool:](#selecting-layers-without-the-move-tool)
- [Known issues](#known-issues)
- [More Info](#more-info)

# Photoshop Move Layers Script (Move Layers.jsx) <!-- omit in toc -->

Alternative to moving layers by dragging in the `Layers panel`. Really handy if target position is anywhere outside the viewport in the layers panel and you need to scroll to it.

_I'm only scrolling by dragging with the mouse in this gif to make it clear what is going on..._
 
![](readme-images/move-layers-photoshop-script.gif)


## Usage

1. Select your input layer(s) → _Run the script for the first time
2. Select your destination layer → _Run the script for the second time

## Align to selection after move

If you make a selection with the marquee tool anytime before step 2, the layers are centered to that selection after the move is done. There shouldn't be a need to turn this behavior off in normal use, but if you want to, set a variable called `useAlignToSelection` to `false`. 

_________

## Useful info about layer selection!

In addition to selecting layers in the layer panel, you can also select layers by directly clicking them in the document. Selecting layers in the document has some advantages, especially if your layer structure is a mess. With this script you can move layers without touching the layers panel, if you want. _That is what I do in the gif below:_

![](readme-images/move-layers-photoshop-script-2.gif)

### Selecting layers with move tool:

1. Select `Move tool`
2. `Cmd + Click` a layer in the document to select it.
    - Holding down `Cmd` temporarily toggles the Auto select when using the `Move tool`. At least I would recommend having auto select unchecked and toggle it on with `Cmd`.
  
>  - This method goes through locked layers.
>  - You can also add the modifier key `Shift` and select more layers. Click a layer again while still holding `Shift` and it's unselected

**Note!** Think of every `Cmd` as `Ctrl` in Windows. In Mac `Cmd` is used for most shortcuts that use `Ctrl` in Windows.

### Selecting layers without the move tool:

I tend to use this method most of the time. With almost any other tool active.

1. `Cmd + Alt + Right click` a layer in the document

>  - This method selects locked layers just like any other layer.
>  - You can also add the modifier key `Shift` and select more layers. Click a layer again while still holding `Shift` and it's unselected

**Note!** Think of every `Cmd` as `Ctrl` in Windows. In Mac `Cmd` is used for most shortcuts that use `Ctrl` in Windows.

____

## Known issues
- The scroll position may shift around a bit at times. It's pretty negligible. I fixed this for versions 1.2. - 1.3. but I brought it back as a necessary evil to make the important stuff work like I want.
- ~~In v.1.2.-1.3. "Align to selection" will silently fail if it's unable to create a group in the target scope. This will happen if the scope has maximum allowed nested groups (10) already.~~ Fixed in 1.4.

## More Info

- This was written for Photoshop CC so I can’t guarantee it’ll work on anything older.
- You’ll definitely want to assign this script a shortcut (or some other third party method). Otherwise it's not very useful.
    - For Mac users I'd recommend this [Alfred Workflow](https://github.com/joonaspaakko/Photoshop-Illustrator-Script-Launcher-Using-Alfred). It does also make sense defining any script shortcuts through Alfred as well.
    - I personally have a button set to trigger this script in my [Elgato Stream Deck](https://www.elgato.com/en/gaming/stream-deck).
