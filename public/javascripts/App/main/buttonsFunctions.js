function loadButtonFunctions(){

	return {

		numberOfNodes: function(graphObject){

			var graph = graphObject.graphInput;

			$('#numberOfNodes').append(' '+ graph.nodes.length);

		},

		profileLength: function(graphObject){

			var profileLength = graphObject.graphInput.nodes[0].profile.length;

			$('#countProfileSize').append(' '+ profileLength);

		},

		datasetName: function(graphObject){

			var graph = graphObject.graphInput;

			$('#datasetNameDiv').append(' '+ graph.dataset_name);

		},

		resetPositionButton: function(graphObject){
			$('#resetPositionButton').click(function(e) {
				graphObject.renderer.reset();
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


	        $('#AddLabels').change(function(e){
	            if (this.checked){
	              $('.node-label').css('display','block');
	              graphObject.tovisualizeLabels = true;
	            } 
	            else{
	              $('.node-label').css('display','none');
	              graphObject.tovisualizeLabels = false;
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
	              $('.link-label').css('display','block');
	              for (i in graphObject.removedLinks){
	                var labelStyle = linkLabels[graphObject.removedLinks[i].id].style;
	                labelStyle.display = "none";
	              }
	              graphObject.tovisualizeLinkLabels = true;
	            } 
	            else{
	              $('.link-label').css('display','none');
	              graphObject.tovisualizeLinkLabels = false;
	            } 
          	});

		},


		operationsButtons: function(graphObject){

			if (graphObject.graphInput.isPublic == true){
				$('#generatePublicLinkButton').html('Revoke Public Link');
			} 

			$('#distanceButton').click(function(e){
				if (graphObject.selectedNodes.length < 2) alert('To compute distances, first you need to select more than one node.');
	            else checkLociDifferences(graphObject.selectedNodes, graphObject.graphInput.metadata);
	        });

	        $('#savePositionsButton').click(function(e){
	            saveTreePositions(graphObject);
	        });

	        $('#generatePublicLinkButton').click(function(e){
	            PublicLink(graphObject);
	        });

	        $('#saveImageButton1').click(function(e){
	            printDiv(graphObject.width, graphObject.height);
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