{
	 
	
	function template(thisObj)
	{
		var scriptName = "template";
		

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
							var aSelLayerOffset = [aSelLayerXoffset, aSelLayerYoffset];




							

							//遍历选中图层的所有mask
							 
							for (var j = 1; j <= aSelLayer.mask.numProperties; j++) {
								var aMask = aSelLayer.mask(j);
								 
								var addMask = aSolid.mask.addProperty("ADBE Mask Atom");
								 

								addMask.color = aMask.color;
								var maskPath = aMask.property("ADBE Mask Shape");
								 									 
								emuMaskPath(maskPath, addMask, aSelLayerOffset);
								//addMask.name = aSelLayer.name + "-"  + aMask.name; 
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

			if (maskPath.isTimeVarying) {

				for (var k =  1; k < maskPath.numKeys + 1; k++) {

		 			var time = maskPath.keyTime(k);
					var path = maskPath.valueAtTime(time,false);
			 		//拷贝每一帧路径并设置值
					addMask.property("ADBE Mask Shape").setValueAtTime(time,copyPath(path, aSelLayerOffset));
				}
			} else {
				var path = maskPath.value;
				addMask.property("ADBE Mask Shape").setValue(copyPath(path,aSelLayerOffset));
			}
			return addMask;
		}
		


		 
		//一键分层
		function onSeparateClick()
		{
			var activeItem = app.project.activeItem;
			if ((activeItem == null) || !(activeItem instanceof CompItem)) {
				alert("请选中或打开一个合成.", scriptName);
			} else {
				var selectedLayers = activeItem.selectedLayers;
				if (activeItem.selectedLayers.length != 1)  {
					alert("请选中一个图层或者多个mask", scriptName);
				} else {

					app.beginUndoGroup(scriptName);

					var activeComp = activeItem;
					var selLayer = activeComp.selectedLayers[0];
					var selPros = selLayer.selectedProperties;
            
					var maskGroup = selLayer.mask;
					 

					if (selPros.length == 0) {		//只选中图层，没选中mask



						 
							 
						var aSelLayer = selLayer;
						var maskGroup = aSelLayer.mask;
						var numMasks = maskGroup.numProperties;
						if (maskGroup.numProperties == 0) alert("第" + aSelLayer.index + "图层 : " + aSelLayer.name + "没有马赛克");		//选中的图层没有mask
						for (var k = numMasks; k >= 1; k--) {		//遍历选中图层的mask

							var aMask = maskGroup(k);
							 
							var maskName = aMask.name;		

	 						var dupLayer = aSelLayer.duplicate();
	 						dupLayer.moveAfter(aSelLayer);
	 						dupLayer.name = maskName;






							var masksArr = dupLayer.mask;
						
							for (var j = numMasks; j >= 1; j--) {
								var oneMask = masksArr(j);

								if (j != k) oneMask.remove();

							}



						}




					} else {

						for (var i = selPros.length - 1; i >= 0; i--) {
					 	 	var aMask = selPros[i];

					 	 	//挑选出mask
					 	 	// alert(aMask.matchName);
					 	 	// alert(aMask.isMask);
					 	 	if (aMask.isMask) {
					 	 		 
				 	 			var maskName = aMask.name;
				 	 			var maskIndex = aMask.propertyIndex;
				 	 			//alert(maskIndex);
		 						var dupLayer = selLayer.duplicate();
		 						dupLayer.moveAfter(selLayer);
								dupLayer.name = maskName;

								var masksArr = dupLayer.mask;
								
								for (var j = masksArr.numProperties; j >= 1; j--) {
									var oneMask = masksArr(j);

									if (j != maskIndex) oneMask.remove();

								}

					 	 	}

						}
								
					}
 
					
					app.endUndoGroup();
					
				 
				}
			}
		}

		//刷新
		function onRefreshBtnClick()
		{
			my_palette.grp.cmds.listBox.removeAll();
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
							if (maskGroup.numProperties == 0) alert("第" + aSelLayer.index + "图层没有马赛克");		//选中的图层没有mask
							for (var k = maskGroup.numProperties - 1; k >= 0; k--) {		//遍历选中图层的mask

								 

								var masksArr = aSelLayer.mask;
							
								for (var j = masksArr.numProperties - 1; j >= 0; j--) {
									var oneMask = masksArr(j + 1);
									my_palette.grp.cmds.listBox.add("item", oneMask.name);


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


		 
		var a = "maskName";
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
									refreshBtn : Button { text : '刷新', alignment : ['fill', 'center'] },\
									listBox : ListBox { properties:{multiselect:true}, alignment:['fill','center'] },\
								}, \
							}";
				


 





				my_palette.margins = [10,10,10,10];
				my_palette.grp = my_palette.add(res);  
				
				for (var i = 0; i < 3; i++) {
					my_palette.grp.cmds.listBox.add("item", a);
				}


				// Workaround to ensure the edittext text color is black, even at darker UI brightness levels.
				var winGfx = my_palette.graphics;
				var darkColorBrush = winGfx.newPen(winGfx.BrushType.SOLID_COLOR, [0,0,0], 1);
				 
				
				my_palette.grp.cmds.collectButton.onClick = onCollectClick;
				my_palette.grp.cmds.separatetButton.onClick = onSeparateClick;
				my_palette.grp.cmds.refreshBtn.onClick = onRefreshBtnClick;

				my_palette.onResizing = my_palette.onResize = function () {this.layout.resize();}
			}
			
			return my_palette;
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