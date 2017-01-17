function loadButtonFunctions(){

	return {

		datasetInfo: function(graphObject){

			$("#datasetInfobt").click(function(){

				var toDialog = '<div id="divinfoDataset">';



	        	$('#dialog').empty();

				var table = {};
				//table.headers = ['Data Set Name', 'Data Set Size', 'Type', 'Metadata', 'Max. Link Distance'];
				table.data = {'Data Set Name':graphObject.graphInput.dataset_name, 'Data Set Size':graphObject.graphInput.nodes.length, 'Data Type':graphObject.graphInput.data_type};
				try{
					table.data['Date'] = graphObject.graphInput.data_timestamp[0].split('T')[0];
				}
				catch(err){
					table.data['Date'] = 'Undefined';
				}

				if (graphObject.graphInput.metadata.length > 0) table.data.Metadata = 'True';
				else table.data.Metadata = 'False';

				if (graphObject.graphInput.data_type == 'profile' || graphObject.graphInput.data_type == 'fasta') table.data['Original Profile Size'] = graphObject.graphInput.nodes[0].profile.length;
				if(graphObject.graphInput.hasOwnProperty('goeburst_timer')) table.data['goeBURST Execution Time'] = graphObject.graphInput.goeburst_timer;
				
				table.data['Max. Link Distance'] = graphObject.maxLinkValue;

				if(graphObject.graphInput.hasOwnProperty('missing_threshold')) table.data['Missing Data Threshold'] = graphObject.graphInput.missing_threshold;
				if(graphObject.graphInput.hasOwnProperty('analysis_method')) table.data['Analysis Method'] = graphObject.graphInput.analysis_method;
				table.data['goeBURST Profile Size'] = graphObject.graphInput.subsetProfiles[0].profile.length;
				if(graphObject.graphInput.hasOwnProperty('parent_id')){
					url = window.location.href.substring(0,window.location.href.lastIndexOf("/")) + '/' + graphObject.graphInput.parent_id;
					table.data['Parent Data Set'] = '<a href="'+url+'">'+url+'</a>';
				}
				for(parameter in table.data){
					toDialog += '<p><b>' + parameter + '</b> : ' + table.data[parameter];
				}

				toDialog += '</div>';

				$('#dialog').append(toDialog);

				/*
				constructTable(graphObject.graphInput, table, 'infoDataset', function(){
					$('#tableinfoDataset tfoot').remove();
				});
				*/

				$('#dialog').dialog({
			              height: $(window).height() * 0.40,
			              width: $(window).width(),
			              modal: true,
			              resizable: true,
			              dialogClass: 'no-close success-dialog'
			          });


			});

		},

		numberOfNodes: function(graphObject){

			var graph = graphObject.graphInput;

			$('#numberOfNodes').append(' <b>' + graph.nodes.length + '</b>');

		},

		profileLength: function(graphObject){

			var profileLength = graphObject.graphInput.nodes[0].profile.length;

			$('#countProfileSize').text(profileLength);

		},

		datasetName: function(graphObject){

			var graph = graphObject.graphInput;

			$('#datasetNameDiv').append(' <b>'+ graph.dataset_name + '</b>');

		},

		resetPositionButton: function(graphObject){
			$('#resetPositionButton').click(function(e) {
				graphObject.renderer.reset();
				graphObject.renderer.reset();
				graphObject.adjustLabelPositions();
				nodePosition=graphObject.layout.getNodePosition(graphObject.TopNode.id);
				//graphObject.layout.setNodePosition(graphObject.TopNode.id, 0, 0);
				graphObject.renderer.moveTo(nodePosition.x,nodePosition.y);
				graphObject.graphFunctions.adjustScale(graphObject);
				graphObject.graphFunctions.launchGraphEvents(graphObject);

				if(graphObject.isLayoutPaused){
			        graphObject.renderer.resume();
			        setTimeout(function(){ graphObject.renderer.pause();}, 50);
			    }
			});
		},

		pauseButton: function(graphObject){

			var graph = graphObject.graphInput;
			var renderer = graphObject.renderer;
			graphObject.isLayoutPaused = false;

			setTimeout(function(){

				if (Object.keys(graph.positions).length > 0){
			        renderer.pause();
					graphObject.isLayoutPaused = true;

			        $('#pauseLayout')[0].innerHTML = "Resume Layout";
			        $('#iconPauseLayout').toggleClass('glyphicon glyphicon-pause',false);
			        $('#iconPauseLayout').toggleClass('glyphicon glyphicon-play',true);
			    }

			}, 500);

		    $('#pauseLayout').click(function(e) {
	              e.preventDefault();
	              if(!graphObject.isLayoutPaused){
	                renderer.pause();
	                graphObject.isLayoutPaused = true;
	                $('#pauseLayout')[0].innerHTML = "Resume Layout";
	                $('#iconPauseLayout').toggleClass('glyphicon glyphicon-pause',false);
	                $('#iconPauseLayout').toggleClass('glyphicon glyphicon-play',true);
	              }
	              else{ 
	                renderer.resume();
	                graphObject.isLayoutPaused = false;
	                $('#pauseLayout')[0].innerHTML = "Pause Layout";
	                $('#iconPauseLayout').toggleClass('glyphicon glyphicon-play',false);
	                $('#iconPauseLayout').toggleClass('glyphicon glyphicon-pause',true);
	                
	              }
	        });
		},


		graphicButtons: function(graphObject){

			$('#AddLinkLabels').prop('checked', false);
			$('#AddLabels').prop('checked', false);

			$('#NodeSizeSlider').change(function(e){
	            NodeSize(this.value, this.max, graphObject);
	        });

	        $('#SizeProperty').change(function(e){
	            ChangeNodeSizeOption(graphObject, this.value);
	        });

          	$('#NodeLabelSizeSlider').change(function(e){
            	LabelSize(this.value, graphObject, graphObject.nodeLabels, 'node');
          	});

          	$('#LinkLabelSizeSlider').change(function(e){
            	LabelSize(this.value, graphObject, graphObject.linkLabels, 'link');
          	});

          	$('#scaleLink').change(function(e){
            	scaleLink(this.value, graphObject);
          	});

          	$('#scaleNode').change(function(e){
            	scaleNodes(this.value, graphObject);
          	});

          	$("#SpringLengthSlider").attr({
		         "max" : graphObject.maxLinkValue,
		    });

          	$('#SpringLengthSlider').change(function(e){
	            changeSpringLength(this.value, this.max, graphObject);
	        });

	        $('#DragSlider').change(function(e){
	            changeDragCoefficient(this.value, this.max, graphObject);
	        });

	        $('#SpringCoefSlider').change(function(e){
	            changeSpringCoefficient(this.value, this.max, graphObject);
	        });

	        $('#GravitySlider').change(function(e){
	            changeGravity(this.value, this.max, graphObject);
	        });

	        $('#ThetaSlider').change(function(e){
	            changeTheta(this.value, this.max, graphObject);
	        });

	        $('#MassSlider').change(function(e){
	            changeMass(this.value, this.max, graphObject);
	        });

	        $('#buttonChangeToOuter').click(function(e){
	        	if(graphObject.withcenter){
	        		changeColorToOuterRing(graphObject);
	            	$('#outerColorLegendDiv').css({'display':'block'});
	            	graphObject.withcenter = false;
	        	}
	        });

	        $('#resetLayout').on('click', function(e){

	        	$("#ThetaSlider").val(graphObject.defaultLayoutParams.theta);
	        	$("#GravitySlider").val(graphObject.defaultLayoutParams.gravity);
	        	$("#DragSlider").val(graphObject.defaultLayoutParams.dragCoeff);
	        	$("#SpringCoefSlider").val(graphObject.defaultLayoutParams.springCoeff);
	        	$("#MassSlider").val(graphObject.defaultLayoutParams.massratio);

	        	changeMass(graphObject.defaultLayoutParams.massratio, 20, graphObject);
	        	changeTheta(graphObject.defaultLayoutParams.theta, 100, graphObject);
	        	changeGravity(graphObject.defaultLayoutParams.gravity, 1, graphObject);
	        	changeSpringCoefficient(graphObject.defaultLayoutParams.springCoeff, 10, graphObject);
	        	changeDragCoefficient(graphObject.defaultLayoutParams.dragCoeff, 100, graphObject);
	        });


	        $('#AddLabels').change(function(e){
	            if (this.checked){
	              if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
	           	  	
	           	  	$('#dialog').empty();
	           	  	var toAppend = '<div style="width:100%;height:50%;text-align:center;"><p>Using this web browser, you might experience some performance loss when adding labels. Do you wish to continue?</p><br><button id="yesLabels" class="btn btn-primary">Yes</button><button id="noLabels" class="btn btn-danger">No</button></div>';

	           	  	$('#dialog').append(toAppend);
	           	  	$('#dialog').dialog();

	           	  	$('#yesLabels').click(function(){
	           	  		AddNodeLabels(graphObject);
	           	  		$('#dialog').dialog('close');
	           	  	});
	           	  	$('#noLabels').click(function(){
	           	  		$('#AddLinkLabels').prop('checked', false);
	           	  		$('#dialog').dialog('close');

	           	  	});
	           	  }
	           	  else AddNodeLabels(graphObject);
	            } 
	            else{
	              $('.node-label').css('display','none');
	              graphObject.tovisualizeLabels = false;
	            } 
          	});

          	$('#AddLogScaleNodes').change(function(e){
	            if (this.checked){
	              graphObject.isLogScaleNodes = true;	
	              changeLogScaleNodes(graphObject);
	            } 
	            else{
	              graphObject.isLogScaleNodes = false;	
	              changeLogScaleNodes(graphObject);
	            } 
          	});

          	$('#AddLogScale').change(function(e){
	            if (this.checked){
	              graphObject.isLogScale = true;	
	              changeLogScale(graphObject);
	            } 
	            else{
	              graphObject.isLogScale = false;	
	              changeLogScale(graphObject);
	            } 
          	});

          	$('#AddLinkLabels').change(function(e){
	            if (this.checked){
	           	  if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
	           	  	console.log(navigator.userAgent.toLowerCase());
	           	  	$('#dialog').empty();
	           	  	var toAppend = '<div style="width:100%;height:50%;text-align:center;"><p>Using this web browser, you might experience some performance loss when adding labels. Do you wish to continue?</p><br><button id="yesLabels" class="btn btn-primary">Yes</button><button id="noLabels" class="btn btn-danger">No</button></div>';

	           	  	$('#dialog').append(toAppend);
	           	  	$('#dialog').dialog();

	           	  	$('#yesLabels').click(function(){
	           	  		AddLinkLabels(graphObject);
	           	  		$('#dialog').dialog('close');
	           	  	});
	           	  	$('#noLabels').click(function(){
	           	  		$('#AddLinkLabels').prop('checked', false);
	           	  		$('#dialog').dialog('close');

	           	  	});
	           	  }
	           	  else AddLinkLabels(graphObject);
	            } 
	            else{
	              if(graphObject.graphInput.data_type != "newick") $('#divselectLabelType').css({"display": "none"});
	              $('#divselectLabelType').css({"display": "none"});
	              $('.link-label').css('display','none');
	              graphObject.tovisualizeLinkLabels = false;
	            } 
          	});

          	$('#labelType').change(function(e){
          		if(this.value == 'relative'){

          			var profileSize = graphObject.graphInput.nodes[0].profile.length;

          			graphObject.graphGL.forEachLink(function(link) {
                      //console.log(link.id);
                      graphObject.linkLabels[link.id].innerText = (parseFloat(graphObject.linkLabels[link.id + 'default']) / profileSize).toFixed(2);                    
                  	});

          		}
          		else{
          			var profileSize = graphObject.graphInput.nodes[0].profile.length;

          			graphObject.graphGL.forEachLink(function(link) {
                      //console.log(link.id);
                      graphObject.linkLabels[link.id].innerText = parseInt(graphObject.linkLabels[link.id + 'default']);                    
                  	});
          		}
          	});

          	$('#labelTypeNewick').change(function(e){
          		if(this.value == 'bootstrap'){

          			graphObject.graphGL.forEachLink(function(link) {
                      graphObject.linkLabels[link.id].innerText = link.data.bootstrap;                    
                  	});

          		}
          		else{
          			graphObject.graphGL.forEachLink(function(link) {
                      graphObject.linkLabels[link.id].innerText = link.data.value;                    
                  	});
          		}
          	});

          	$('#zoomIn').click(function(){
          		graphObject.renderer.zoomIn();
          	});

          	$('#zoomOut').click(function(){
          		graphObject.renderer.zoomOut();
          	});

		},


		operationsButtons: function(graphObject){

			if (graphObject.graphInput.isPublic == true){
				$('#generatePublicLinkButton').html('Revoke Public Link');
			} 

			$('#distanceButton').click(function(e){
				var cont = true;
				if (graphObject.selectedNodes.length < 2){
					var message = 'To compute distances, first you need to select more than one node.'; 
					cont=false;
				}
				else if (graphObject.selectedNodes.length >= 500){
					var message = 'To much nodes selected. The maximum number is currently 500.';
					cont=false;
				}

				if(!cont){
					var toDialog = '<div style="text-align: center;"><label>'+message+'</label></div>';

			    	$('#dialog').empty();
					$('#dialog').append(toDialog);
					$('#dialog').dialog({
				              height: $(window).height() * 0.15,
				              width: $(window).width() * 0.2,
				              modal: true,
				              resizable: true,
				              dialogClass: 'no-close success-dialog'
				          });
					return false;
				}
            	if(graphObject.graphInput.data_type == 'newick') getNewickDistances(graphObject);
            	else checkLociDifferences(graphObject);

	        });

	        $('#savePositionsButton').click(function(e){
	            saveTreePositions(graphObject);
	        });

	        if(graphObject.graphInput.data_type[0] != 'profile') $('#createSubset1').css({"display":"none"});

	        $('#createSubset1').click(function(e){

	        	graphObject.freezeSelection = true;

	        	var toDialog = '<div style="text-align: center;"><label>Subset information:</label></div>' + 
	        					'<label for="datasetNameSubset">Dataset Name</label>' +
								'<input class="form-control input-sm" id="datasetNameSubset" type="text" placeholder="Select a name for the dataset" required/>'+
								'<label for="dataset_description_Subset">Dataset Description</label>' +
								'<input class="form-control input-sm" id="dataset_description_Subset" type="text" placeholder="Description"/>' + 
								'<br>'+
								'<div id="profileAnalysisMethod">'+
								'<label class="input-formats" for="sel_analysis_method">Analysis Method</label>'+	
								'<select id="sel_analysis_method">'+
									'<option value="core">Core Analysis</option>'+
									'<option value="pres-abs">Presence/Absence</option>'+
								'</select></div><br>'+
								'<div id="missingcheckboxsubset" style="text-align:left;height:5%;">'+
								'<label class="checkbox-inline"><input type="checkbox" id="missingchecksubset"/>Has missings</label>'+
								'<label class="checkbox-inline"><input class="input-sm" id="missingdelimitersubset" type="text" placeholder="Missings character" required style="display:none"/></label>'+
	        					'</div><br>'+
	        					'<div class="col-md-12" id="div_threshold" style="display:none;">'+
								'<div class="col-md-6">'+
								'<span id="span_threshold">Threshold (Absent Loci)<input id="missingthreshold" type="range" value="100" min="0" max="100" required/></span>'+
								'</div><div>'+
								'<input type="text" style="width:30%;" id="textInput" value="100" disabled></div></div>'+
	        					'<div style="width:100%;text-align:center"><button id="okButtonsubset" class="btn btn-primary btn-md">OK</button></div><br><div id="errorSubset" style="width:100%;text-align:center;"></div>';

	        	$('#dialog').empty();
				$('#dialog').append(toDialog);
				$('#dialog').dialog({
			              height: $(window).height() * 0.50,
			              width: $(window).width() * 0.50,
			              modal: true,
			              resizable: true,
			              dialogClass: 'no-close success-dialog'
			          });

				$('#sel_analysis_method').change(function(){
					if($(this).val() == 'core') {
						$('#missingcheckboxsubset').css({"display":"block"});
						$('#missingchecksubset').css({"display":"block"});
						$('#missingdelimitersubset').css({"display":"none"});
						$('#div_threshold').css({"display":"none"});
						document.getElementById('missingchecksubset').checked = false;
					}
					else{
						$('#missingcheckboxsubset').css({"display":"block"});
						$('#missingchecksubset').css({"display":"none"});
						$('#missingdelimitersubset').css({"display":"block"});
						$('#div_threshold').css({"display":"block"});
						document.getElementById('missingchecksubset').checked = true;
					}
				});

				$('#missingthreshold').change(function(){
			  		document.getElementById('textInput').value=this.value; 
				});


				$('#missingchecksubset').click(function(){
				  if ($(this).is(':checked')) $('#missingdelimitersubset').css({"display": "block"});
				  else $('#missingdelimitersubset').css({"display": "none"});
				  
				});

				$('#dialog').on('dialogclose', function(event) {
				     graphObject.freezeSelection = false;
				 });
				$('#okButtonsubset').click(function(){

					if(graphObject.selectedNodes.length == 0){
						$('#errorSubset').empty();
						$('#errorSubset').append('<label>First you need to select some nodes.</label>');
						return false;
					}
					
					var datasetN = $('#datasetNameSubset').val();
					var descriptionS = $('#dataset_description_Subset').val();
					var missingsubset = true;
					var missingCharsubset = '';

					var analysis_method = 'core';
					analysis_method = $('#sel_analysis_method').val();
					var missing_threshold = '0';

					if(document.getElementById('missingchecksubset').checked){
					    missingsubset = true;
					    missingCharsubset = $('#missingdelimitersubset').val();
					    if (analysis_method == 'pres-abs') missing_threshold = $('#missingthreshold').val();
					}

					nodeNames = selectedDataNames(graphObject);
					console.log(nodeNames);

	            	createSubset(nodeNames, window.location.href.substr(window.location.href.lastIndexOf('/') + 1), datasetN, descriptionS, missingsubset, missingCharsubset, analysis_method, missing_threshold, function(data){
	            		if(!data.error){
	            			$('#dialog').dialog('close');
	            			graphObject.freezeSelection = false;
	            		}
	            		else{
	            			$('#createSubset1').trigger('click');
	            			setTimeout(function(){
	            				$('#dialog').append('<br><div style="width:100%;text-align:center;"><label>'+data.error+'</label></div>');
	            			}, 200);
	            		}
	            	});
				});
	        });

			$('#exportgoeBURST').click(function(){
				exportgoeBURSTprofiles(graphObject);
			});

			$('#exportoriginal').click(function(){
				exportprofiles(graphObject);
			});

	        $('#viewSequences').click(function(e){
	            createMSA(graphObject);
	        });

	        var showExclusiveInfo = true;

	        if(graphObject.graphInput.nodes[0].profile.length > 2000 && graphObject.graphInput.nodes.length > 3000){
	        	$('#exclusiveLoci').css({'display': 'none'});
	        	showExclusiveInfo = false;
	        }

	        if(graphObject.graphInput.nodes.length > 3000){
	        	var toDialog = '<div style="text-align: center;"><label>Due to the large number of nodes, <b>NLV graph</b> option ';
	        	if(!showExclusiveInfo) toDialog += 'and <b>Find Exclusive Loci</b> option are not available.';
	        	else toDialog += 'is not available.';

	        	toDialog += 'We are working to solve this problem.</label></div>';

	        	$('#dialog').empty();
				$('#dialog').append(toDialog);
				$('#dialog').dialog({
			              height: $(window).height() * 0.20,
			              width: $(window).width() * 0.40,
			              modal: true,
			              resizable: true,
			              dialogClass: 'no-close success-dialog'
			          });
	        }



	        $('#exclusiveLoci').click(function(e){
	            get_exclusive_loci(graphObject, function(){
	            	if (graphObject.exclusive_loci.length == 0){
	            		if (graphObject.selectedNodes.length != 0) var toDialog = '<div style="text-align: center;"><label>There are no unique profile positions related to the selected group.</label></div>';
			        	else var toDialog = '<div style="text-align: center;"><label>Select one or more nodes to find exclusive loci.</label></div>';
			        	$('#dialog').empty();
						$('#dialog').append(toDialog);
						$('#dialog').dialog({
					              height: $(window).height() * 0.20,
					              width: $(window).width() * 0.40,
					              modal: true,
					              resizable: true,
					              dialogClass: 'no-close success-dialog'
					          });
	            	}
	            	else write_exclusive_file(graphObject);
	            });
	        });

	        $('#updateMetadata').click(function(e){
	            updateMetadata(graphObject);
	        });

	        $('#Choosecategories').click(function(e){
	            chooseCategories(graphObject, graphObject.linkMethod);
	        });

	        $('#generatePublicLinkButton').click(function(e){
	            PublicLink(graphObject);
	        });

	        $('#getLinkButton').click(function(e){
	        	getLink(graphObject);
	        });

	        $('#exportSelectedDataButton').click(function(e){
	            exportSelectedDataTree(graphObject);
	        });

	        $('#saveImageButton1').click(function(e){
	        	
	        	var toDialog = '<div style="text-align: center;"><label>Only what is visible on the screen will appear on the pdf. Make sure to re-center the tree or adjust the positioning before printing.</label></div>' + 
	        					'<div id="buttonoptionsdiv" style="width:90%;position:absolute;bottom:2px;text-align:center;">' + 
	        					'<div style="width:20%;float:left";><button id="cancelButtonPDF" class="btn btn-danger btn-md">Cancel</button></div>' +  
	        					'<div style="width:20%;float:right";><button id="okButtonPDF" class="btn btn-primary btn-md">OK</button></div>' +  
	        					'</div>';

	        	$('#dialog').empty();
				$('#dialog').append(toDialog);
				$('#dialog').dialog({
			              height: $(window).height() * 0.15,
			              width: $(window).width() * 0.2,
			              modal: true,
			              resizable: true,
			              dialogClass: 'no-close success-dialog'
			          });

				$('#okButtonPDF').click(function(){
					printDiv(graphObject);
				});

				$('#cancelButtonPDF').click(function(){
					$('#dialog').dialog("close");
				});

	        });

	        $("#SplitTreeSlider").attr({
		        "max" : graphObject.maxLinkValue,
		        "value" : graphObject.maxLinkValue 
		    });
		    
		    $("#NLVnumber").attr({
		        "max" : graphObject.graphInput.maxDistanceValue,
		        "value" : 0
		    });

		    if(!graphObject.graphInput.hasOwnProperty('distanceMatrix')){
		    	$('#NLVgraph').css({"display": "none"});
		    }



	        $('#SplitTreeSlider').change(function(e){
	            splitTree(graphObject, this.value);
	        });

	        $('#NLVnumber').change(function(e){
            	NLVgraph(graphObject, this.value);
          });

		},

		searchButton: function(graphObject){

			$('#searchForm').submit(function(e) {
                  e.preventDefault();
                  var nodeId = $('#nodeid').val();
                  centerNode(nodeId, graphObject);
              });
		}

	}
}

function AddLinkLabels(graphObject){

  $('#divselectLabelType').css({"display": "block"});
  $('.link-label').css('display','block');
  if(graphObject.graphInput.data_type != "newick") {
  	$('#labelType').css({"display": "block"});
  	$('#labelTypeNewick').css({"display": "none"});
  }
  else{
  	$('#labelType').css({"display": "none"});
  	$('#labelTypeNewick').css({"display": "block"});
  }
  for (i in graphObject.removedLinks){
    var labelStyle = graphObject.linkLabels[graphObject.removedLinks[i].id].style;
    labelStyle.display = "none";
  }
  graphObject.tovisualizeLinkLabels = true;
  if(graphObject.isLayoutPaused == true){
  	graphObject.renderer.resume();
	setTimeout(function(){ graphObject.renderer.pause();}, 50);
  }
  else graphObject.renderer.resume();

}

function AddNodeLabels(graphObject){
  $('.node-label').css('display','block');
  graphObject.tovisualizeLabels = true;
  if(graphObject.isLayoutPaused == true){
  	graphObject.renderer.resume();
	setTimeout(function(){ graphObject.renderer.pause();}, 50);
  }
  else graphObject.renderer.resume();
}