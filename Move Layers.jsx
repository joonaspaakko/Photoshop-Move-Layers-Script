// Move Layers.jsx - Version 1.4.
// Alternative method for moving layers, because dragging layers can be terrible at times.

// USAGE:
// 1. Select your input layer(s)
//    - Run the script for the first time
// 2. Select your destination layer
//    - Run the script for the second time

// If you do a marquee selection anytime before step 2 the layers will be centerd to that selection after the move.
// This can be handy if you know the layers would get hidden behind layers in the current location + stack order.

// #########################''###############################

// Changelog:
// ==========

// 1.4
// - I FINALLY brought back the way the script used to work up to version 1.1. First step creates a group. This makes the script way better to use.
//   - The reason why I originally tried to get around using it was that the script would be utterly useless if the maximum level of nesting was reached
//   - Now the script falls back to a marker layer in such case, which I think is quite fine...
// - Improved "useAlignToSelection". It also no longer uses groups, which was unnecessary and caused it to fail as well, if the nesting was too deep.
// - Like in version 1.2. the optional marquee selection can be made at any point before step 2.
// - IDs are no longer stored in a text file (versions 1.2 - 1.3.), they are stored inside PS instead.
// - Fixed some brain farts in the 1.3 changelog
// - Tested in PS CC 2019 (20.0.8)

// 1.3
// - Fixed an error with the target location index — This made v1.2. unusable. Woopsie...
// - Changed to how the step is checked.
//   - Now the steps are triggered based on the current history state.
//   - This change means you can undo once and run the script again, in case you happen to move layers in the wrong place, just like in v1.1.
//   - This change also means you can't do anything except select the target layer between steps 1 and 2. Which in turn means you have to make the marquee selection before step 1 if you wish to use it.
// - Removed the step where I painted the layers red before the move. I figured it was unnecessary since they are already selected and highlighted.

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

var useAlignToSelection = true; // Aligns the layers to a marquee selection. Does nothing if there is no selection.

var doc = app.activeDocument;
var activeLayer = doc.activeLayer;

// eraseObj( tempDataName );

var tempDataName = 'move-layers-scripts'
var tempData = fetchObj( tempDataName );
var selectedLayers = getSelectedLayers();
var tempLayerName = 'STEP 1/2 (Move Layers.jsx)';
var tempLayerName2 = 'TEMP LAYER (Move Layers.jsx)';
var tempLayer = getLayerByName( tempLayerName );

var step = !tempLayer ? '1' : '2';
doc.suspendHistory("Move Layers Script "+ step +"/2", "init()");''

function init() {
  
  // *****
  //  1/2
  // *****
  if ( step == '1' ) {
    
    var displayDialogs = app.displayDialogs;
    
    // TRY GROUPING
    try {
      app.displayDialogs = DialogModes.NO;
      app.runMenuItem( stringIDToTypeID('groupLayersEvent') ); // Group layers
      var tempFolder = doc.activeLayer;
      tempFolder.name = tempLayerName;
      // This trick relies on how PS collapses a group if the selection has more than one layer.
      if ( tempFolder.length < 2 ) {
        var tempLayer = doc.artLayers.add(); // Add a filler layer
        tempLayer.move( tempFolder, ElementPlacement.INSIDE );
        tempLayer.name = tempLayerName2;
        doc.activeLayer = tempLayer.parent;
        app.runMenuItem( stringIDToTypeID('ungroupLayersEvent') ); // Ungroup → All grouped layers get selected...
        app.runMenuItem( stringIDToTypeID('groupLayersEvent') ); // Group
        doc.activeLayer.name = tempLayerName;
      }
    }
    // USE A MARKER LAYER if grouping isn't possible
    catch (e) {
      var step1marker = doc.artLayers.add();
      // step1marker.name = 'MOVING: ' + layers.names.join(', ');
      step1marker.name = tempLayerName;
      step1marker.move( activeLayer, ElementPlacement.PLACEBEFORE );
    }
    
    app.displayDialogs = displayDialogs;
    
    var data = {
      nextStep: '2',
      ids: selectedLayers.ids.join(','),
      docId: doc.id,
      markerId: doc.activeLayer.id
    };
    storeObj( data, tempDataName );
    paintRed();
    
  }
  // *****
  //  2/2
  // *****
  else {
    
    var targetLayerIndex = activeLayer.itemIndex;
    var layerIDs = tempData.ids.split(',');
    
    // If document has an active selection, center layers to that.
    if ( useAlignToSelection ) {
      var selection = selectionExists();
      align( app.activeDocument.activeLayer, selection );
    }
    
    buildSelectionWithIDs( layerIDs );
    moveLayers( layerIDs, targetLayerIndex );
    deleteLayerWithID( tempData.markerId );
    
    tempData.nextStep = '1';
    storeObj( tempData, tempDataName );
    
  }

}


// ********************
//  FUNCTION WAREHOUSE
// ********************

function moveLayers( layerIDs, targetLayerIndex ) {
  
  // MOVE LAYERS
  var desc32 = new ActionDescriptor();
    var ref13 = new ActionReference();
    ref13.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
  desc32.putReference( charIDToTypeID('null'), ref13 );
    var ref14 = new ActionReference();
    // ref14.putIdentifier( charIDToTypeID( "Lyr " ), activeID );
    ref14.putIndex( charIDToTypeID('Lyr '), targetLayerIndex );
  desc32.putReference( charIDToTypeID('T   '), ref14 );
  desc32.putBoolean( charIDToTypeID('Adjs'), false );
  desc32.putInteger( charIDToTypeID('Vrsn'), 5 );
    var list5 = new ActionList();
    for ( var i=0; i < layerIDs.length; i++ ) {
      list5.putInteger( layerIDs[i] );
    }
  desc32.putList( charIDToTypeID('LyrI'), list5 );
  try { executeAction( charIDToTypeID('move'), desc32, DialogModes.NO ); } catch(e) {}
  
}

function align( alignThisLayer, targetBounds ) {
  
  try {
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
  } catch (e) {}
  
}

// Check if a selection exists in the document and return bounds if it does...
function selectionExists() {
	
  var selection = false;
  try {
    selection = app.activeDocument.selection.bounds;
    deselect();
  } catch(e) {}
  return selection;
	
}

// Deselects a marquee selection...
function deselect() {
  
  var desc87 = new ActionDescriptor();
  var ref33 = new ActionReference();
  ref33.putProperty( charIDToTypeID('Chnl'), charIDToTypeID('fsel') );
  desc87.putReference( charIDToTypeID('null'), ref33 );
  desc87.putEnumerated( charIDToTypeID('T   '), charIDToTypeID('Ordn'), charIDToTypeID('None') );
  executeAction( charIDToTypeID('setd'), desc87, DialogModes.NO );
  
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

function getSelectedLayers() {
  var layers = {
    idxs: [],
    ids: [],
    names: []
  };
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
      layers.idxs.push( idx+n );
      toIdRef = new ActionReference();
      toIdRef.putIndex( charIDToTypeID("Lyr "), idx );
      var id = executeActionGet(toIdRef).getInteger( stringIDToTypeID( "layerID" ));
      layers.ids.push( id );
      layers.names.push( getLayerNameByID( id ) );
      
    }
  }
  return layers;
}

function getLayerNameByID( id ) {
  ref = new ActionReference();
  ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID( "Nm  " ));
  ref.putIdentifier( charIDToTypeID( "Lyr " ), id );
  return executeActionGet(ref).getString(charIDToTypeID( "Nm  " ));
}

function deleteLayerWithID( id ) {
  
  try {
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID('Lyr '), id);
    var desc = new ActionDescriptor();
    desc.putReference( charIDToTypeID('null'), ref );
    executeAction( charIDToTypeID('Dlt '), desc, DialogModes.NO );
  } catch (e) {}
  
}

// Finds and selects layer by its name from anywhere within the document, even it's nested.
function getLayerByName( layerName ) {
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

// Makes active layer(s) red....
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

// *************************
//  STORING PERSISTENT DATA
// *************************
// This was taken from a script that comes with PS called "Fit Image.jsx"
// → /Adobe Photoshop CC 2019/Presets/Scripts/Fit Image.jsx
// I haven't really modified it in any way, just organized it into easier to throw around functions:

// fetchObj('identifier_String')
// storeObj({}, 'identifier_String')
// eraseObj('identifier_String');

// Returns the stored js object
// Returns undefined if no previous data is found.
function fetchObj( identifier ) {
  if ( !identifier ) identifier = 'tempStorage_QcjEA7AK4s7K7zkC01vLnEcx';
  var obj;
  try {
    var desc = app.getCustomOptions(identifier);
    if ( desc ) obj = {}; else obj = undefined;
    descriptorToObject(obj, desc, identifier);
  } catch(e) {
    obj = undefined;
  }
  return obj;
}

// Stores a js object (persistent)
function storeObj( obj, identifier ) {
  if ( !identifier ) identifier = 'tempStorage_QcjEA7AK4s7K7zkC01vLnEcx';
  var desc = objectToDescriptor(obj, identifier);
  app.putCustomOptions(identifier, desc);
}

// Erases the stored js object
function eraseObj( identifier ) {
  if ( !identifier ) identifier = 'tempStorage_QcjEA7AK4s7K7zkC01vLnEcx';
  objectToDescriptor({}, identifier);
  app.eraseCustomOptions(identifier);
}

///////////////////////////////////////////////////////////////////////////////
// Function: objectToDescriptor
// Usage: create an ActionDescriptor from a JavaScript Object
// Input: JavaScript Object (o)
//        object unique string (s)
//        Pre process converter (f)
// Return: ActionDescriptor
// NOTE: Only boolean, string, number and UnitValue are supported, use a pre processor
//       to convert (f) other types to one of these forms.
// REUSE: This routine is used in other scripts. Please update those if you
//        modify. I am not using include or eval statements as I want these
//        scripts self contained.
///////////////////////////////////////////////////////////////////////////////
function objectToDescriptor (o, s, f) {
	if (undefined != f) {
		o = f(o);
	}

	var d = new ActionDescriptor;
	var l = o.reflect.properties.length;
	d.putString( app.charIDToTypeID( 'Msge' ), s );
	for (var i = 0; i < l; i++ ) {
		var k = o.reflect.properties[i].toString();
		if (k == "__proto__" || k == "__count__" || k == "__class__" || k == "reflect")
			continue;
		var v = o[ k ];
		k = app.stringIDToTypeID(k);
		switch ( typeof(v) ) {
			case "boolean":
				d.putBoolean(k, v);
				break;
			case "string":
				d.putString(k, v);
				break;
			case "number":
				d.putDouble(k, v);
				break;
			default:
			{
				if ( v instanceof UnitValue ) {
					var uc = new Object;
					uc["px"] = charIDToTypeID("#Pxl"); // pixelsUnit
					uc["%"] = charIDToTypeID("#Prc"); // unitPercent
					d.putUnitDouble(k, uc[v.type], v.value);
				} else {
					throw( new Error("Unsupported type in objectToDescriptor " + typeof(v) ) );
				}
			}
		}
	}
    return d;
}

///////////////////////////////////////////////////////////////////////////////
// Function: descriptorToObject
// Usage: update a JavaScript Object from an ActionDescriptor
// Input: JavaScript Object (o), current object to update (output)
//        Photoshop ActionDescriptor (d), descriptor to pull new params for object from
//        object unique string (s)
//        JavaScript Function (f), post process converter utility to convert
// Return: Nothing, update is applied to passed in JavaScript Object (o)
// NOTE: Only boolean, string, number and UnitValue are supported, use a post processor
//       to convert (f) other types to one of these forms.
// REUSE: This routine is used in other scripts. Please update those if you
//        modify. I am not using include or eval statements as I want these
//        scripts self contained.
///////////////////////////////////////////////////////////////////////////////

function descriptorToObject (o, d, s, f) {
	var l = d.count;
	if (l) {
	    var keyMessage = app.charIDToTypeID( 'Msge' );
        if ( d.hasKey(keyMessage) && ( s != d.getString(keyMessage) )) return;
	}
	for (var i = 0; i < l; i++ ) {
		var k = d.getKey(i); // i + 1 ?
		var t = d.getType(k);
		strk = app.typeIDToStringID(k);
		switch (t) {
			case DescValueType.BOOLEANTYPE:
				o[strk] = d.getBoolean(k);
				break;
			case DescValueType.STRINGTYPE:
				o[strk] = d.getString(k);
				break;
			case DescValueType.DOUBLETYPE:
				o[strk] = d.getDouble(k);
				break;
			case DescValueType.UNITDOUBLE:
				{
				var uc = new Object;
				uc[charIDToTypeID("#Rlt")] = "px"; // unitDistance
				uc[charIDToTypeID("#Prc")] = "%"; // unitPercent
				uc[charIDToTypeID("#Pxl")] = "px"; // unitPixels
				var ut = d.getUnitDoubleType(k);
				var uv = d.getUnitDoubleValue(k);
				o[strk] = new UnitValue( uv, uc[ut] );
				}
				break;
			case DescValueType.INTEGERTYPE:
			case DescValueType.ALIASTYPE:
			case DescValueType.CLASSTYPE:
			case DescValueType.ENUMERATEDTYPE:
			case DescValueType.LISTTYPE:
			case DescValueType.OBJECTTYPE:
			case DescValueType.RAWTYPE:
			case DescValueType.REFERENCETYPE:
			default:
				throw( new Error("Unsupported type in descriptorToObject " + t ) );
		}
	}
	if (undefined != f) {
		o = f(o);
	}
}
