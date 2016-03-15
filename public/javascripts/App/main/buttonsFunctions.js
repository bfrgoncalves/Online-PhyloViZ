function loadButtonFunctions(){

	return {

		numberOfNodes: function(graphObject){

			var graph = graphObject.graphInput;

			$('#numberOfNodes').append(' <b>' + graph.nodes.length + '</b>');

		},

		profileLength: function(graphObject){

			var profileLength = graphObject.graphInput.nodes[0].profile.length;

			$('#countProfileSize').append(' <b>' + profileLength + '</b>');

		},

		datasetName: function(graphObject){

			var graph = graphObject.graphInput;

			$('#datasetNameDiv').append(' <b>'+ graph.dataset_name + '</b>');

		},

		resetPositionButton: function(graphObject){
			$('#resetPositionButton').click(function(e) {
				graphObject.renderer.reset();
				graphObject.graphFunctions.adjustScale(graphObject);
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

			if (Object.keys(graph.positions).length > 0){
		        renderer.pause();
				graphObject.isLayoutPaused = true;

		        $('#pauseLayout')[0].innerHTML = "Resume Layout";
		        $('#iconPauseLayout').toggleClass('glyphicon glyphicon-pause',false);
		        $('#iconPauseLayout').toggleClass('glyphicon glyphicon-play',true);
		    }

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

			$('#NodeSizeSlider').change(function(e){
	            NodeSize(this.value, this.max, graphObject);
	        });

          	$('#NodeLabelSizeSlider').change(function(e){
            	LabelSize(this.value, graphObject, graphObject.nodeLabels, 'node');
          	});

          	$('#LinkLabelSizeSlider').change(function(e){
            	LabelSize(this.value, graphObject, graphObject.linkLabels, 'link');
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
	              $('.node-label').css('display','block');
	              graphObject.tovisualizeLabels = true;
	              if(graphObject.isLayoutPaused == true){
	              	graphObject.renderer.resume();
        			setTimeout(function(){ graphObject.renderer.pause();}, 50);
	              }
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
	              if(graphObject.graphInput.data_type != "newick") $('#divselectLabelType').css({"display": "block"});
	              $('.link-label').css('display','block');
	              for (i in graphObject.removedLinks){
	                var labelStyle = linkLabels[graphObject.removedLinks[i].id].style;
	                labelStyle.display = "none";
	              }
	              graphObject.tovisualizeLinkLabels = true;
	              if(graphObject.isLayoutPaused == true){
	              	graphObject.renderer.resume();
        			setTimeout(function(){ graphObject.renderer.pause();}, 50);
	              }
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
				if (graphObject.selectedNodes.length < 2) alert('To compute distances, first you need to select more than one node.');
				else if (graphObject.selectedNodes.length >= 500) alert('To much nodes selected. The maximum number is currently 500.');
	            else checkLociDifferences(graphObject);
	        });

	        $('#savePositionsButton').click(function(e){
	            saveTreePositions(graphObject);
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

	        $('#exportSelectedDataButton').click(function(e){
	            exportSelectedDataTree(graphObject);
	        });

	        $('#saveImageButton1').click(function(e){
	            printDiv(graphObject);
	        });

	        $("#SplitTreeSlider").attr({
		        "max" : graphObject.maxLinkValue,
		        "value" : graphObject.maxLinkValue 
		    });

		    $("#NLVnumber").attr({
		        "max" : graphObject.maxLinkValue,
		        "value" : 0
		    });

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