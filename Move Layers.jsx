// Move Layers.jsx - Version 1.3
// Alternative method for moving layers, because dragging layers can be terrible at times.

// USAGE:
// 1. Select your input layer(s)
//    - Run the script for the first time
// 2. Select your destination layer
//    - Run the script for the second time
// If you do a marquee selection before step 1, step 2 will center the layers to that selection.
// This can be handy if you know the layers would get hidden behind layers in the current location + stack order. 

// ########################################################

// Changelog:
// ==========

// 1.3
// - Fixed an error with the target location index — This made v1.2. unusable. Woopsie...
// - Changed to how the step is checked. 
//   - I used to do it by removing the txt file holding the holding. So if the file existed, the current step would've been "2/2" and otherwise "1/2"
//   - Now if the current history state is "1/2", then the script will execute step 2 and otherwise step 1. 
//   - This change means you can undo once and run the script again, in case you happen to move layers in the wrong place, just like in v1.1.
//   - This change also means you can't do anything except select the target layer between steps 1 and 2. Which in turn means you have to make the marquee selection before step 1 if you wish to use it.
// - Removed the step where I painted the layers red before the move, but I figured it was unnecessary since they are already selected and highlighted.

// 1.2
// - Changed the way layers are moved. It doesn't rely on Groups anymore.
// - Layers are colored red in the first step and return to previous color in the second step
// - Align to selection still relies on groups and will quietly fail if the layers can't be grouped in the dropped scope.
//   - I guess I could make it more reliable by trying the align on before the move and then again after the move if the first try failed.
//   - Marquee selection has to be made before step 1.
// - Added a variable at the top of the script called "useAlignToSelection", which you can use to disable align to selection if you don't want to use it
// - Scroll position is no longer affected

// 1.1.
// - Moved layer(s) are centered to the active marquee selection as a group.
//     - Not always necessary, but sometimes when you move the layers in the stack,
//       they get covered by other layers... and when that happens you likely also want
//       to move the layer(s) to new coordinates. That's where this feature comes in.
//
//     USAGE:
//     1. Make a marquee selection in the document
//     2. Select the layers you want to move → Run the script
//           - You can also make the marquee selection here if you want... (Not in version 1.2)
//     3. Select the destination layer → Run the script
// - Known issue: The scroll position may shift around a bit at times. I would say it's negligible....

// 1.0.
// - First version. Basic functionality
// - Known issue: The scroll position may shift around a bit at times. I would say it's negligible....


#target photoshop

var useAlignToSelection = true; // Aligns the layers to a marquee selection if one is active...

var doc = app.activeDocument;
var initialActiveLayer = doc.activeLayer;
var activeIndex = initialActiveLayer.itemIndex;
var activeHistory = app.activeDocument.activeHistoryState;
var step2 = activeHistory.name === "Move Layers Script 1/2";

var scriptPath = new File($.fileName);
var textFilePath = scriptPath.parent + "/" + scriptPath.name.substring(0, scriptPath.name.lastIndexOf('.')) + ".jsx - Layer IDs.txt";

var n = !step2 ? '1' : '2';
doc.suspendHistory("Move Layers Script "+ n +"/2", "init()");

function init() {

  // *****
  //  1/2
  // *****
  if ( !step2 ) {

    writeFile( textFilePath, getSelectedLayers().id );
    
  }
  // *****
  //  2/2
  // *****
  else {

    var layerIDs = readFile( textFilePath );
    buildSelectionWithIDs( layerIDs );
    
    // (new File( textFilePath )).remove();

    if ( useAlignToSelection ) {
      var selectionBounds = selectionExists();
    }


    // MOVE LAYERS
    var desc32 = new ActionDescriptor();
      var ref13 = new ActionReference();
      ref13.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
    desc32.putReference( charIDToTypeID('null'), ref13 );
      var ref14 = new ActionReference();
      // ref14.putIdentifier( charIDToTypeID( "Lyr " ), activeID );
      ref14.putIndex( charIDToTypeID('Lyr '), activeIndex );
    desc32.putReference( charIDToTypeID('T   '), ref14 );
    desc32.putBoolean( charIDToTypeID('Adjs'), false );
    desc32.putInteger( charIDToTypeID('Vrsn'), 5 );
      var list5 = new ActionList();
      for ( var i=0; i < layerIDs.length; i++ ) {
        list5.putInteger( layerIDs[i] );
      }
    desc32.putList( charIDToTypeID('LyrI'), list5 );
    try { executeAction( charIDToTypeID('move'), desc32, DialogModes.NO ); } catch(e) { alert( e );}

    // If doc has selection, align layers to selection as a group if it is possible to make a group.
    // It may fail if the target layer scope is nested too deep inside groups, since there is a max nested group count.
    if ( selectionBounds ) {
      try { 
        // GROUP
        var desc1379 = new ActionDescriptor();
          var ref410 = new ActionReference();
          ref410.putClass( stringIDToTypeID('layerSection') );
        desc1379.putReference( charIDToTypeID('null'), ref410 );
          var ref411 = new ActionReference();
          ref411.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
        desc1379.putReference( charIDToTypeID('From'), ref411 );
        desc1379.putInteger( stringIDToTypeID('layerSectionStart'), 250 );
        desc1379.putInteger( stringIDToTypeID('layerSectionEnd'), 251 );
        desc1379.putString( charIDToTypeID('Nm  '), "Temp Group (Align)" );
        executeAction( charIDToTypeID('Mk  '), desc1379, DialogModes.NO );

        align( app.activeDocument.activeLayer, selectionBounds );

        // UNGROUP
        var desc1382 = new ActionDescriptor();
          var ref412 = new ActionReference();
          ref412.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
        desc1382.putReference( charIDToTypeID('null'), ref412 );
        executeAction( stringIDToTypeID('ungroupLayersEvent'), desc1382, DialogModes.NO );
      } catch(e) {}
    }
    
  }
  
}

function deselect() {
  var desc87 = new ActionDescriptor();
  var ref33 = new ActionReference();
  ref33.putProperty( charIDToTypeID('Chnl'), charIDToTypeID('fsel') );
  desc87.putReference( charIDToTypeID('null'), ref33 );
  desc87.putEnumerated( charIDToTypeID('T   '), charIDToTypeID('Ordn'), charIDToTypeID('None') );
  executeAction( charIDToTypeID('setd'), desc87, DialogModes.NO );
}

function selectionExists() {
	
  var selection = false;
  try { 
    selection = app.activeDocument.selection.bounds; 
    deselect(); 
  } catch(e) {}
  return selection;
	
}

function align( alignThisLayer, targetBounds ) {

  var atlBounds = alignThisLayer.boundsNoEffects;
  
  var atl = {
    offset: {
      top: atlBounds[1].value,
      right: atlBounds[2].value,
      bottom: atlBounds[3].value,
      left: atlBounds[0].value,
    },
  };
  var target = {
    offset: {
      top: targetBounds[1].value,
      right: targetBounds[2].value,
      bottom: targetBounds[3].value,
      left: targetBounds[0].value,
    },
  };
  
  var image_width = atl.offset.right - atl.offset.left;
  var image_height = atl.offset.bottom - atl.offset.top;
  
  var target_width = target.offset.right - target.offset.left;
  var target_height = target.offset.bottom - target.offset.top;
  
  var translateX = target.offset.left - atl.offset.left - ( image_width/2 ) + ( target_width/2 );
  var translateY = target.offset.top - atl.offset.top - ( image_height/2 ) + ( target_height/2 );
  alignThisLayer.translate( translateX, translateY );
  
}

function buildSelectionWithIDs( ids ) {
  for ( var i = 0; i < ids.length; i++ ) {
    var add = (i===0) ? false : true;
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID('Lyr '), ids[i]);
    var desc = new ActionDescriptor();
    desc.putReference(charIDToTypeID('null'), ref);
    if ( add ) desc.putEnumerated( stringIDToTypeID('selectionModifier'), stringIDToTypeID('selectionModifierType'), stringIDToTypeID('addToSelection'));
    desc.putBoolean(charIDToTypeID('MkVs'), false);
    executeAction(charIDToTypeID('slct'), desc, DialogModes.NO);
  }
}

function paintRed() {
  var desc206 = new ActionDescriptor();
  var ref101 = new ActionReference();
  ref101.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
  desc206.putReference( charIDToTypeID('null'), ref101 );
  var desc207 = new ActionDescriptor();
  desc207.putEnumerated( charIDToTypeID('Clr '), charIDToTypeID('Clr '), charIDToTypeID('Rd  ') );
  desc206.putObject( charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc207 );
  executeAction( charIDToTypeID('setd'), desc206, DialogModes.NO );
}

function getSelectedLayers() {
  var idxs = [];
  var ids = [];
  var ref = new ActionReference();
  ref.putEnumerated( charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
  var desc = executeActionGet(ref);
  if ( desc.hasKey(stringIDToTypeID('targetLayers')) ) {
    desc = desc.getList( stringIDToTypeID( 'targetLayers' ));
    var c = desc.count;
    for ( var i=0; i<c; i++ ) {
      var n = 0; try { activeDocument.backgroundLayer; } catch(e) { n = 1; }
      var idx = desc.getReference( i ).getIndex()+n;
      n = n == 0 ? 1 : 0;
      idxs.push( idx+n );
      toIdRef = new ActionReference();
      toIdRef.putIndex( charIDToTypeID("Lyr "), idx );
      var id = executeActionGet(toIdRef).getInteger( stringIDToTypeID( "layerID" ));
      ids.push( id );
    }
  }
  return {
    idx: idxs,
    id: ids
  };
}

function writeFile( filePath, array ) {
	
  var file = new File( filePath );
  file.open('w');
  file.writeln( array.join(',') );
  file.close();
	
}

function readFile( filePath ) {
	
  var file = new File( filePath ),
  fileOpen = file.open('r');
  var array = file.readln();
  file.close();
  return !fileOpen ? false : array.split(',');
	
}
