# Photoshop Move Layers Script (Move Layers.jsx)

![](readme-images/move-layers-photoshop-script.gif)

Alternative to moving layers by dragging in the `Layers panel`.


## Usage

1. Select your input layer(s) → _Run the script for the first time_
2. Select your destination layer → _Run the script for the second time_


> The script writes 2 history steps per move:
> 1. "Move Layers Script 1/2" -> The prep
> 2. "Move Layers Script 2/2" -> The move

## Selecting layers in the document instead of the layers panel...

Since the script only cares that you have layers selected, you can select layers in the document, run the script, then select another layer in the document and run the script again, without ever touching the layers panel.

_This can be super handy if your layer structure is a mess._

![](readme-images/move-layers-photoshop-script-2.gif)

### A couple methods I'd recommend

#### Move tool:

1. Select `Move tool`
2. `Cmd + Click` a layer in the document to select it.
    - Holding down `Cmd` temporarily toggles the Auto select when using the `Move tool`. At least I would recommend having auto select unchecked and toggle it on with `Cmd`.

This method goes through locked layers.

_You can also add the modifier key `Shift` and select more layers._

#### Pretty much any other tool

I tend to use this method for the most part.

1. `Cmd + Alt + Right click` a layer in the document with almost any tool active.

This method selects locked layers just like any other layer.

_You can also add the modifier key `Shift` and select more layers. Click a layer again while still holding `Shift` and it's unselected_

> Note that in Windows you should think of every `Cmd` I mentioned here as `Ctrl`. In Mac `Cmd` is used for most shortcuts that use `Ctrl` in Windows.

## More Info

- This was written for Photoshop CC so I can’t guarantee it’ll work on anything older.
- You’ll definitely want to assign this script a shortcut  (or some other third party method). Otherwise it's not very useful.
    - I personally have a button set to trigger this script in my [Elgato Stream Deck](https://www.elgato.com/en/gaming/stream-deck).
