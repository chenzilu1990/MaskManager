{
	 
	
	function template(thisObj)
	{
		var scriptName = "template";
		1
		2
		3
		4
		5
		6
		7
		8
		9
		A
		B
		  
		//mask整合
		function onCollectClick()
		{
			 
			var activeItem = app.project.activeItem;
			if ((activeItem == null) || !(activeItem instanceof CompItem)) {
				alert("请选择或打开一个合成.", scriptName);
			} else {
				var selectedLayers = activeItem.selectedLayers;
				if (selectedLayers.length == 0) {
					alert("至少选择一个图层或者mask", scriptName);
				} else {
					app.beginUndoGroup(scriptName);
					
					
					var activeComp = activeItem;
					var selLayer = activeComp.selectedLayers[0];
					var selPros = selLayer.selectedProperties;
				 

					var maskGroup = selLayer.mask;
				 				
					 	

					var solidItem = selLayer.source;
					var aSolid = activeComp.layers.add(solidItem, activeComp.duration);


					//var aSolid = activeComp.layers.addSolid([1, 1, 1], "baise", activeComp.width, activeComp.height, 1.0, activeComp.duration);



					aSolid.moveAfter(selectedLayers[selectedLayers.length - 1]);
 

					if (selPros.length != 0) {
						//遍历选中属性
 						 
						for (var i = 0; i < selPros.length; i++) {
							
							var aMask = selPros[i];

							//挑选出属性中的mask
							if (aMask.matchName == "ADBE Mask Atom") {
								var addMask = aSolid.mask.addProperty("ADBE Mask Atom");
								 
								addMask.color = aMask.color;
								var maskPath = aMask.property("ADBE Mask Shape");
								 
								emuMaskPath(maskPath, addMask);

								 
							}
						}



				 
							
					} else {
						//只选中图层时，遍历所有选中图层
						for (var i = 0; i < selectedLayers.length ; i++) {
							//一个选中的图层
							var aSelLayer = selectedLayers[i];
							var aSelLayerXoffset = aSelLayer.transform.position.value[0] - aSelLayer.transform.anchorPoint.value[0] ;
							var aSelLayerYoffset = aSelLayer.transform.position.value[1] - aSelLayer.transform.anchorPoint.value[1] ;
							// var aSelLayerXoffset = aSelLayer.transform.position.value[0] - activeComp.width / 2;
							// var aSelLayerYoffset = aSelLayer.transform.position.value[1] - activeComp.height / 2;
							var aSelLayerOffset = [aSelLayerXoffset, aSelLayerYoffset];
							//alert(aSelLayerOffset);


							{

								//遍历选中图层的所有mask
								 
								for (var j = 1; j <= aSelLayer.mask.numProperties; j++) {
									var aMask = aSelLayer.mask(j);
									 
									var addMask = aSolid.mask.addProperty("ADBE Mask Atom");
									 

									addMask.color = aMask.color;
									var maskPath = aMask.property("ADBE Mask Shape");
									 									 
									emuMaskPath(maskPath, addMask, aSelLayerOffset);
									addMask.name = aSelLayer.name + "-"  + aMask.name; 
								}
 	 

							}

							 
						}
					}

     
					app.endUndoGroup();
					
					 
				}
			}
		}

		//拷贝路径
		function copyPath(path, aSelLayerOffset) 
		{
			var aPath = new Shape();
		 	maskVertices = new Array();
			for (var i=0; i<path.vertices.length; i++)
                maskVertices[maskVertices.length] = [path.vertices[i][0]+aSelLayerOffset[0], path.vertices[i][1]+aSelLayerOffset[1]];

			aPath.vertices = maskVertices;
			aPath.inTangents = path.inTangents;
			aPath.outTangents = path.outTangents;
			aPath.closed = path.closed;
			return aPath;
		}

		function emuMaskPath (maskPath, addMask, aSelLayerOffset)
		{	
			//遍历maskPath关键帧
			for (var k =  1; k < maskPath.numKeys + 1; k++) {

	 			var time = maskPath.keyTime(k);
				var path = maskPath.valueAtTime(time,false);
		 		//拷贝每一帧路径并设置值
				addMask.property("ADBE Mask Shape").setValueAtTime(time,copyPath(path, aSelLayerOffset));
			}
			return addMask;
		}
		


		 
		//一键分层
		function onSeparateClick()
		{
			var activeItem = app.project.activeItem;
			if ((activeItem == null) || !(activeItem instanceof CompItem)) {
				alert("请选择或打开一个合成.", scriptName);
			} else {
				var selectedLayers = activeItem.selectedLayers;
				if (activeItem.selectedLayers.length == 0)  {
					alert("至少选择一个图层或者mask", scriptName);
				} else {

					app.beginUndoGroup(scriptName);

					var activeComp = activeItem;
					var selLayer = activeComp.selectedLayers[0];
					var selPros = selLayer.selectedProperties;
            
					var maskGroup = selLayer.mask;
					 

					if (selPros.length == 0) {		//只选中图层，没选中mask



						for (var i = 0; i < selectedLayers.length; i++) {		//遍历选中的图层
							 
							var aSelLayer = selectedLayers[i];
							var maskGroup = aSelLayer.mask;
							if (maskGroup.numProperties == 0) alert("该图层没有马赛克");		//选中的图层没有mask
							for (var k = maskGroup.numProperties - 1; k >= 0; k--) {		//遍历选中图层的mask

								var aMask = maskGroup(k+1);
								 
								var maskName = aMask.name;		

		 						var dupLayer = aSelLayer.duplicate();
		 						dupLayer.moveAfter(aSelLayer);
		 						//dupLayer.name = maskName;
								dupLayer.name = aSelLayer.name + "-" + maskName;

								var masksArr = dupLayer.mask;
							
								for (var j = masksArr.numProperties - 1; j >= 0; j--) {
									var oneMask = masksArr(j + 1);
									if (oneMask.name != maskName) {oneMask.remove()}
									//oneMask.name = dupLayer.name + "-" + oneMask.name;
								}



							}
						}



					} else {

						for (var i = selPros.length - 1; i >= 0; i--) {
					 	 	var aMask = selPros[i];

					 	 	//挑选出mask
					 	 	
					 	 	if (aMask.matchName == "ADBE Mask Atom") {
					 	 		 
				 	 			var maskName = aMask.name;

		 						var dupLayer = selLayer.duplicate();
		 						dupLayer.moveAfter(selLayer);
								dupLayer.name = maskName;

								var masksArr = dupLayer.mask;
								
								for (var j = masksArr.numProperties - 1; j >= 0; j--) {
									var oneMask = masksArr(j + 1);
									if (oneMask.name != maskName) oneMask.remove();

								}

					 	 	}

						}
								
					}
 
					
					app.endUndoGroup();
					
				 
				}
			}
		}

		
		//遍历给定数组中的Mask

		/*function emuMaskPros (pros,block)
		{
			

			if (pros.matchName == "ADBE Mask Parade") {
				var masks = pros;
				for (var i = 1; i <= masks.numProperties; i++) {
					var aMask = aSelLayer.mask(i);

					var addMask = aSolid.mask.addProperty("ADBE Mask Atom");
					addMask.color = aMask.color;
					var maskPath = aMask.property("ADBE Mask Shape");
					 
				
					 
					emuMaskPath(maskPath, addMask);
					addMask.name = aMask.name;
				}
			} else {

			}

			
		}*/


		

		function maskCopyPathAtTime (mask, path , time)
		{
				
				

		}


		 
		
		// 
		// This function puts up a modal dialog asking for a scale_factor.
		// Once the user enters a value, the dialog closes, and the script scales the comp.
		// 
		function BuildAndShowUI(thisObj)
		{
			// Create and show a floating palette.
			var my_palette = (thisObj instanceof Panel) ? thisObj : new Window("palette", scriptName, undefined, {resizeable:true});
			if (my_palette != null)
			{
				var res = 
					"group { \
						orientation:'column', alignment:['fill','top'], alignChildren:['left','top'], spacing:5, margins:[0,0,0,0], \
						cmds: Group { \
							alignment:['fill','top'], \
							collectButton: Button { text:'mask整合', alignment:['fill','center'] }, \
							separatetButton: Button { text:'一键分层', alignment:['fill','center'] }, \
						}, \
					}";
				



				/*var ares = 
					"group { \
						alignment:['fill','fill'], \
						l: Group { \
							orientation:'column', alignment:['left','fill'], \
							header: Group { \
								alignment:['fill','top'], \
								title: StaticText { text:'" + rd_MarkerNavigatorData.scriptName + "', alignment:['fill','center'] }, \
								help: Button { text:'" + rd_MarkerNavigator_localize(rd_MarkerNavigatorData.strHelp) +"', maximumSize:[30,30], alignment:['right','center'] }, \
							}, \
							r1: Group { \
								alignment:['fill','fill'], \
								listBox: ListBox { properties:{multiselect:true}, alignment:['fill','fill'] }, \
							}, \
							cmds: Group { \
								alignment:['fill','bottom'], \
								refreshBtn: Button { text:'" + rd_MarkerNavigator_localize(rd_MarkerNavigatorData.strRefresh) + "', alignment:['fill','bottom'], preferredSize:[-1,20] }, \
							}, \
						}, \
						r: Group { \
							orientation:'column', alignment:['fill','top'], alignChildren:['fill','top'], \
							r1: Group { \
								timeText: StaticText { text:'" + rd_MarkerNavigator_localize(rd_MarkerNavigatorData.strTime) + "', enabled:false, alignment:['left','center'] }, \
								time: StaticText { text:'', enabled:false, alignment:['fill','center'] }, \
							}, \
							r2: Group { \
								commentText: StaticText { text:'" + rd_MarkerNavigator_localize(rd_MarkerNavigatorData.strComment) + "', enabled:false, alignment:['left','center'] }, \
								comment: EditText { text:'', characters:20, enabled:false, alignment:['fill','center'], preferredSize:[-1,20] }, \
							}, \
							optsPnl: Panel { \
								text:'" + rd_MarkerNavigator_localize(rd_MarkerNavigatorData.strOptions) + "', enabled:false, alignment:['fill','fill'], alignChildren:['fill','top'], \
								r1: Group { \
									chText: StaticText { text:'" + rd_MarkerNavigator_localize(rd_MarkerNavigatorData.strChapter) + "', enabled:false, alignment:['left','center'] }, \
									ch: EditText { text:'', characters:20, enabled:false, alignment:['fill','center'], preferredSize:[-1,20] }, \
								}, \
								r2: Group { \
									urlText: StaticText { text:'" + rd_MarkerNavigator_localize(rd_MarkerNavigatorData.strURL) + "', enabled:false, alignment:['left','center'] }, \
									url: EditText { text:'', characters:20, enabled:false, alignment:['fill','center'], preferredSize:[-1,20] }, \
								}, \
								r3: Group { \
									frmText: StaticText { text:'" + rd_MarkerNavigator_localize(rd_MarkerNavigatorData.strFrameTarget) + "', enabled:false, alignment:['left','center'] }, \
									frm: EditText { text:'', characters:20, enabled:false, alignment:['fill','center'], preferredSize:[-1,20] }, \
								}, \
							}, \
						}, \
					}";
*/







				my_palette.margins = [10,10,10,10];
				my_palette.grp = my_palette.add(res);  
				
				// Workaround to ensure the edittext text color is black, even at darker UI brightness levels.
				var winGfx = my_palette.graphics;
				var darkColorBrush = winGfx.newPen(winGfx.BrushType.SOLID_COLOR, [0,0,0], 1);
				 
				
				my_palette.grp.cmds.collectButton.onClick = onCollectClick;
				my_palette.grp.cmds.separatetButton.onClick = onSeparateClick;
				
				my_palette.onResizing = my_palette.onResize = function () {this.layout.resize();}
			}
			
			return my_palette;
		}
		
		
		// 
		// Sets newParent as the parent of all layers in theComp that don't have parents.
		// This includes 2D/3D lights, camera, av, text, etc.
		//
		function makeParentLayerOfUnparentedInArray(layerArray, newParent)
		{
			for (var i = 0; i < layerArray.length; i++) {
				var curLayer = layerArray[i];
				if (curLayer != newParent && curLayer.parent == null) {
					curLayer.parent = newParent;
				}
			}
		}
		
		
		//
		// Scales the zoom factor of every camera by the given scale_factor.
		// Handles both single values and multiple keyframe values.
		function scaleCameraZoomsInArray(layerArray, scaleBy)
		{
			for (var i = 0; i < layerArray.length; i++) {
				var curLayer = layerArray[i];
				if (curLayer.matchName == "ADBE Camera Layer") {
					var curZoom = curLayer.zoom;
					if (curZoom.numKeys == 0) {
						curZoom.setValue(curZoom.value * scaleBy);
					} else {
						for (var j = 1; j <= curZoom.numKeys; j++) {
							curZoom.setValueAtKey(j,curZoom.keyValue(j)*scaleBy);
						}
					}
				}
			}
		}
		
		// 
		// The main script.
		//
		if (parseFloat(app.version) < 8) {
			alert("This script requires After Effects CS3 or later.", scriptName);
			return;
		}
		
		var my_palette = BuildAndShowUI(thisObj);
		if (my_palette != null) {
			if (my_palette instanceof Window) {
				my_palette.center();
				my_palette.show();
			} else {
				my_palette.layout.layout(true);
				my_palette.layout.resize();
			}
		} else {
			alert("Could not open the user interface.", scriptName);
		}
	}
	
	
	template(this);
}