// Move Layers.jsx - Version 1.0.
// Alternative method for moving layers, because dragging layers can be terrible at times.

// USAGE:
// 1. Select your input layer(s)
//    - Run the script for the first time
// 2. Select your destination layer
//    - Run the script for the second time

// The script writes 2 history steps per move:
// 1. "Move Layers Script 1/2" -> The prep
// 2. "Move Layers Script 2/2" -> The move
//

// Known issues:
// - The scroll position may shift around a bit at times...

// ########################################################

// Changelog:
// ==========

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
      
      tempGroup.move( activeLayer, ElementPlacement.PLACEBEFORE );
      doc.activeLayer = tempGroup;
      app.runMenuItem( stringIDToTypeID('ungroupLayersEvent') );
      
    }
    
    // Get rid of temp layer if it was created in the first phase.
    var tempLayer = getLayer( tempLayerName );
    if ( tempLayer !== false ) tempLayer.remove();
    
  }
  
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
