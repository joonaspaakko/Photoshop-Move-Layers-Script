// Move Layers.jsx - Version 1.1.
// Alternative method for moving layers, because dragging layers can be terrible at times.

// USAGE:
// 1. Select your input layer(s)
//    - Run the script for the first time
// 2. Select your destination layer
//    - Run the script for the second time

// The script writes 2 history steps per move:
// 1. "Move Layers Script 1/2" → The prep
// 2. "Move Layers Script 2/2" → The move

// This also means you can undo the move phase with (Cmd+Z), select another
// destination layer and run the script again, without having to
// start all over again if you happen to move to the wrong location.

// Known issues:
// - The scroll position may shift around a bit at times. I would say it's negligible....

// ########################################################

// Changelog:
// ==========

// 1.1.
// - Moved layer(s) are centered to the active marquee selection as a group.
//     - Not always necessary, but sometimes when you move the layers in the stack,
//       they get covered by other layers... and when that happens you likely also want
//       to move the layer(s) to new coordinates. That's where this feature comes in.
//
//     USAGE:
//     1. Make a marquee selection in the document
//     2. Select the layers you want to move → Run the script
//           - You can also make the marquee selection here if you want...
//     3. Select the destination layer → Run the script

// 1.0.
// - First version. Basic functionality


#target photoshop

var doc = app.activeDocument;
var initialActiveLayer = doc.activeLayer;
var tempGroupName = 'TempGroup (Move Layers Script)';
var tempLayerName = 'TempLayer (Move Layers Script)';
var tempGroup = getLayer( tempGroupName );

var n = tempGroup === false ? '1' : '2';
doc.suspendHistory("Move Layers Script "+ n +"/2", "init()");

function init() {
  
  // *****
  //  1/2
  // *****
  if ( tempGroup === false ) {
    
    app.runMenuItem( stringIDToTypeID('groupLayersEvent') );
    doc.activeLayer.name = tempGroupName;
    
    // Starting from here, we make sure that the temp group is always collapsed after its created.
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // This part takes advantage of how a new group is automatically collapsed
    // if the current layer selection (top level) has more than one layer.
    
    var tempFolder = doc.activeLayer;
    
    var selection_length = 0;
    for ( var i=0; i < tempFolder.layers.length; i++ )
    selection_length++;
    
    if ( selection_length < 2 ) {
      var tempLayer = doc.artLayers.add();
      tempLayer.move( tempFolder, ElementPlacement.INSIDE );
      tempLayer.name = tempLayerName;
      doc.activeLayer = tempLayer.parent;
      app.runMenuItem( stringIDToTypeID('ungroupLayersEvent') );
      app.runMenuItem( stringIDToTypeID('groupLayersEvent') );
      doc.activeLayer.name = tempGroupName;
    }
    
  }
  // *****
  //  2/2
  // *****
  else{
    
    var activeLayer = initialActiveLayer;
    
    // If Temp layer is selected, undo the preparation...
    if ( tempGroupName === activeLayer.name ) {
      
      app.runMenuItem( stringIDToTypeID('ungroupLayersEvent') );
      
    }
    // Move...
    else {
      
      var selectionBounds = selectionExists();
			
      // I don't quite understand why, but the selection + translate (align)
      // somehow prevented the script from continuing. Works just fine
      // without "suspendHistory" though. The other mysterious part about
      // this is that if I made the selection before the prep phase, it
      // failed. If I made the selection after the prep phase, it worked.
      // But as it turns out, deselecting before align fixed the issue.
      deselect();
      
      function deselect() {
        function cTID(s) { return app.charIDToTypeID(s); };
        function sTID(s) { return app.stringIDToTypeID(s); };

          var desc87 = new ActionDescriptor();
              var ref33 = new ActionReference();
              ref33.putProperty( cTID('Chnl'), cTID('fsel') );
          desc87.putReference( cTID('null'), ref33 );
          desc87.putEnumerated( cTID('T   '), cTID('Ordn'), cTID('None') );
          executeAction( cTID('setd'), desc87, DialogModes.NO );
      };
      
      if ( selectionBounds ) {
        align( tempGroup, selectionBounds );
      }
      
      tempGroup.move( activeLayer, ElementPlacement.PLACEBEFORE );
      doc.activeLayer = tempGroup;
      app.runMenuItem( stringIDToTypeID('ungroupLayersEvent') );
      
    }
    
    // Get rid of temp layer if it was created in the first phase.
    var tempLayer = getLayer( tempLayerName );
    if ( tempLayer !== false ) tempLayer.remove();
    
  }
  
}

function selectionExists() {
	
	var selection = false;
	try { selection = app.activeDocument.selection.bounds; } catch(e) {}
	
	return selection;
	
}

function getLayer( layerName ) {
  try {
    
    var select = charIDToTypeID( "slct" );
    var actionDescriptor = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    var actionReference = new ActionReference();
    var layer = charIDToTypeID( "Lyr " );
    actionReference.putName( layer, layerName );
    actionDescriptor.putReference( idnull, actionReference );
    var makeVisibleID = charIDToTypeID( "MkVs" );
    actionDescriptor.putBoolean( makeVisibleID, false );
    var layerId = charIDToTypeID( "LyrI" );
    var actionList = new ActionList();
    actionList.putInteger( 1 );
    actionDescriptor.putList( layerId, actionList );
    executeAction( select, actionDescriptor, DialogModes.NO );
    
    return app.activeDocument.activeLayer;
    
  } catch(e) {
    return false;
  }
  
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
