function tutorial(divId){
	
	return {
		home: function(){
			$('#' + divId).empty();
			var toAppend = '<div class="tutorialDiv">'+
							"<p>Welcome to PHYLOViZ Online! This is the application's index page.</p>"+
							 '<p>On the left area of the page there is a <b>Features</b> menu, where you can get information on the application or ways to access and upload data. </p>' +
							 '<p>On the upper right side, there is <b>LOGIN/REGISTER</b> area so that you can access to your stored uploaded data.</p>'+
							 '</p><label style="font-size:100%;">Note:</label> <p>To store your data for more than 24 hours for future use you have to be registered in the application.</p>'+
							'</div>';
			$('#' + divId).append(toAppend);
		},
		publicdatasets: function(){
			$('#' + divId).empty();
			var toAppend = '<div class="tutorialDiv">'+
							'<p>This is the area where you can access to all public data sets.</p>'+
								'<label style="font-size:100%; color:#FE9128;">1º - Select one data set from the table</label>'+
							'<p>Select a data set by clicking on one of the rows.</p>'+
							'<label style="font-size:100%; color:#FE9128;">2º - Launch the Tree</label>'+
							'<p>Click on the <i>Launch Tree</i> button to be redirected to the tree visualization.</p>'+
							'<label style="font-size:100%;">Notes:</label>'+
							'<p>You can not modify or delete public data sets. If you wish to modify some data set you have made public, login and access to it from your user area.</p>'+
							'</div>';
			$('#' + divId).append(toAppend);
		},
		userdatasets: function(){
			$('#' + divId).empty();
			var toAppend = '<div class="tutorialDiv">'+
							'<p>This is the area where you can access to all data sets you have uploaded.</p>'+
								'<label style="font-size:100%; color:#FE9128;">1º - Select one data set from the table</label>'+
							'<p>Select a data set by clicking on one of the rows.</p>'+
							'<label style="font-size:100%; color:#FE9128;">2º - Launch the Tree</label>'+
							'<p>Click on the <i>Launch Tree</i> button to be redirected to the tree visualization.</p>'+
							'<label>Notes:</label>'+
							'<p>You can delete data sets by selecting one of the rows and clicking on the <i>Delete</i> button. If your data set is public, it will be also deleted from the public data sets.</p>'+
							'<p>You can also change the data set name or description by selecting a row, typing a new data set name or descrition, and clicking on <i>Change Data set Name</i> or <i>Change Description</i>.</p>'+
							'</div>';
			$('#' + divId).append(toAppend);
		},
		uploaddatasets: function(){
			$('#' + divId).empty();
			var toAppend = '<div class="tutorialDiv">'+
							'<p>This is the upload area of the application.</p>'+
								'<label style="font-size:100%; color:#FE9128;">1º - Choose an input type</label>'+
							'<p>Select between a tab-separated file with profiles, a Newick file or a FASTA file with aligned sequences of the same size.</p>'+
							'<label style="font-size:100%; color:#FE9128;">2º - Select files</label>'+
							'<p>Choose the files you want to upload. In case of profile data, a column header equal to the first column header of the profile file <b>MUST</b> exist in the auxiliary data file. In case of FASTA and Newick data, identifiers from the two files are expected to be located at the first column of the auxiliary data so that association is possible.</p>'+
							'<label style="font-size:100%; color:#FE9128;">3º - Add Name and Description</label>'+
							'<p>Select an identifier for your data set an you can also add a short description.</p>'+
							'<label style="font-size:100%; color:#FE9128;">4º - Allow sharing</label>'+
							'<p>If you want, you can make your data set available for all other users in the Public data sets area. Do do that, check the <i>Make public</i> button.</p>'+
							'</div>';
			$('#' + divId).append(toAppend);
		},
		api:function(){
			$('#' + divId).empty();
			var toAppend = '<div class="tutorialDiv">'+
							'<p>This is the API information area of the application.</p>'+
							'<p>The RESTful allows communication between the server and the client. It allows access to useful services required mainly for data management.</p>'+
							'</div>';
			$('#' + divId).append(toAppend);
		},
		about:function(){
			$('#' + divId).empty();
			var toAppend = '<div class="tutorialDiv">'+
							'<p>There is no additional information.</p>'+
							'</div>';
			$('#' + divId).append(toAppend);
		},
		tree:function(){
			$('#' + divId).empty();
			var toAppend = '<p>This is the <b>Tree visualization</b> tab of the application. On the left side of the screen you have a <b>Features menu</b> that allows <i>color assignment</i>, <i>change graphic properties</i> and other <i>operations</i> to be done on the tree. You also have an option to <i>Search</i> for specific nodes on the top and a series of <i>Buttons</i> on the bottom to change some properties of the tree visualization.</p>' + 
							'<label style="font-size:100%; color:#FE9128;">Node Selection:</label>' + 
							'<p><b>Single selection</b> is made holding the <i>Shift</i> key and clicking on the desired nodes. <b>Multiple selection</b> is made by holding the <i>Shift + S</i> keys and dragging the cursor over the nodes.' + 
							'<p>To clear all selections, press the <i>Shift</i> key.</p>' +
							'<label style="font-size:100%;color:#FE9128;">Assigning Colors:</label>' + 
							'<p>Colors can be assigned using one of the different fields available at the <i>Profile</i> or <i>Auxiliary data</i> file.</p>' +
							'</p>' +
							'<label style="font-size:100%;color:#FE9128;">Graphic Properties:</label>' + 
							'<p>Here you can add Labels and change Labels, Nodes and Link sizes. Link Labels can be seen in absolute count of differences or relative (dependent on the profile length).</p>' +
							'<p>In the Layout section, you can change properties of layout extension:' +
							'<ul><li><b>Drag force coefficient</b>: Slows down animation speed and the closer two 0 the farthest the nodes will be.</li>' + 
								"<li><b>Hook's law coefficient (Spring coeficcient)</b>: Closer to 0 links are more loose.</li>" + 
								'<li><b>Gravity</b>: Negative numbers lead to nodes repel.</li>' + 
								'<li><b>Theta</b>: Controls the openning angle used to calculate the force layout. As the Theta value increases, the opening angle is reduced, thus merging the closest nodes with the overall effect of uncluttering the display.</li>' + 
								'<li><b>Mass Ratio</b>: Bigger values lead to more attraction between nodes.</li></ul>' + 
							'</p>' + 
							'<label style="font-size:100%;color:#FE9128;">Operations - Tree Modifiers:</label>' + 
							'<ul><li><b>n Locus Variant (nLV)</b>: Creates links between any nodes in the graph with differences up to and including number entered in the box.</li>' +
								 '<li><b>Tree cut-off</b>: Deletes all links between nodes with profiles with differences above the number selected.</li>' + 
								 '<li><b>Collapse at distance</b>: Collapse all nodes with differences up to the selected value.</li>' + 
								 '</ul>' +
							'<label style="font-size:100%;color:#FE9128;">Operations - Subset Operations:</label>' + 
							'<ul><li><b>Create subset</b>: Creates a subset of the tree using the selected nodes. It will create a new dataset and remake the profile comparison analysis. Login is required.</li>' +
								 '<li><b>Find Exclusive Loci</b>: Checks for profile positions that exist only in the selected nodes and not in any other node.</li>' + 
								 '<li><b>Compute Distances</b>: Computes All vs All distances between selected nodes.</li>' + 
								 '<li><b>Export Selected Data</b>: Exports profile data and auxiliary data (if exists) from selected nodes.</li>' +
								 '</ul>' +
							'<label style="font-size:100%;color:#FE9128;">Operations - Display Operations:</label>' +
							'<ul><li><b>Save Positions</b>: Saves the positions of the nodes.</li>' +
								 '</ul>' +;
			$('#' + divId).append(toAppend);
		},
		profiles: function(){
			$('#' + divId).empty();
			var toAppend = '<p>This is the <b>Profile</b> tab of the application. Here you have the information you have uploaded regarding the file used to define distances. In case of Newick file, there will be no information available.</p>' + 
							'<label style="font-size:100%; color:#FE9128;">Linking data to Tree:</label>' + 
							'<p>All rows approach:' +
								'<ul><li>1º - Click on table header.</li>' + 
								"<li>2º - Click on <i>Link to Tree</i> button next to th Pie Chart.</li></ul></p>" + 
							'<p>Selected rows approach:' +
								'<ul><li>1º - Select one row multiple rows from the table.</li>' + 
								'<li>2º - Click on table header.</li>' + 
								"<li>3º - Click on <i>Link to Tree</i> button next to th Pie Chart. Only data from selected nodes is displayed at the Pie Chart and at the Tree.</li></ul></p>" + 
							'<label style="font-size:100%;color:#FE9128;">Table querying:</label>' + 
							'<p>You can perform queries globally on the table by using the search box at the upper right side, or you can do individual or multiple column searches. You can also use regular expressions:' +
							'<ul><li><b>. (period mark)</b> - represents any character.</li>' + 
								'<li><b>[ ] (square brackets)</b>- Match anything inside the square brackets for one character position once and only once.</li>' + 
								'<li><b>$ (dollar sign)</b> - Ends with.' + 
								'<li><b>? (question mark)</b> - Matches the preceding character 0 or 1 times only.</li>' + 
								'<li><b>* (asterisk)</b> - Matches the preceding character 0 or more times.</li>' + 
								'<li><b>+ (plus)</b> - Matches the preceding character 1 or more times.</li>' + 
								'<li><b>{n} (any integer between brackets)</b> - Matches the preceding character exactly n times.</li>' + 
								"<li><b>^ (caret)</b> - Starts with.</li></ul>" +
							'</p>';
			$('#' + divId).append(toAppend);
		},
		auxiliary: function(){
			$('#' + divId).empty();
			var toAppend = '<p>This is the <b>Auxiliary Data</b> tab of the application. Here you have the information you have uploaded regarding the auxiliary data file in a tabular format.</p>' + 
							'<label style="font-size:100%; color:#FE9128;">Linking data to Tree:</label>' + 
							'<p>All rows approach:' +
								'<ul><li>1º - Click on table header.</li>' + 
								"<li>2º - Click on <i>Link to Tree</i> button next to th Pie Chart.</li></ul></p>" + 
							'<p>Selected rows approach:' +
								'<ul><li>1º - Select one row multiple rows from the table.</li>' + 
								'<li>2º - Click on table header.</li>' + 
								"<li>3º - Click on <i>Link to Tree</i> button next to th Pie Chart. Only data from selected nodes is displayed at the Pie Chart and at the Tree.</li></ul></p>" + 
							'<label style="font-size:100%;color:#FE9128;">Table querying:</label>' + 
							'<p>You can perform queries globally on the table by using the search box at the upper right side, or you can do individual or multiple column searches. You can also use regular expressions:' +
							'<ul><li><b>. (period mark)</b> - represents any character.</li>' + 
								'<li><b>[ ] (square brackets)</b>- Match anything inside the square brackets for one character position once and only once.</li>' + 
								'<li><b>$ (dollar sign)</b> - Ends with.' + 
								'<li><b>? (question mark)</b> - Matches the preceding character 0 or 1 times only.</li>' + 
								'<li><b>* (asterisk)</b> - Matches the preceding character 0 or more times.</li>' + 
								'<li><b>+ (plus)</b> - Matches the preceding character 1 or more times.</li>' + 
								'<li><b>{n} (any integer between brackets)</b> - Matches the preceding character exactly n times.</li>' + 
								"<li><b>^ (caret)</b> - Starts with.</li></ul>" +
							'</p>';
			$('#' + divId).append(toAppend);
		},
		distances: function(){
			$('#' + divId).empty();
			var toAppend = '<p>This is the <b>Distances</b> tab of the application. Here you can visualize a Interactive Distance Matrix with nodes selected on the Tree Visualization tab.</p>' + 
							'<p><b>Each cell represents a comparison between individuals.</b></p>' + 
							'<label style="font-size:100%; color:#FE9128;">Colours:</label>' + 
							'<p>Different colours are associated with the existing number of differences between each comparsion. The colour scale is available next to the Distance Matrix.</p>' + 
							'<label style="font-size:100%; color:#FE9128;">Distance Matrix Interaction:</label>' + 
							'<p>On <i>mouse over</i> a cell, it gets highlighted and information regarding its characteristcs appear on a table on the right side of the Distance Matrix. It is possible to see distances between each pair of nodes and their auxiliary data. Fields can be filtered using the <i>checkboxes</i> above the table.</p>' +
							'<p>Multiple selections can be made by clicking on a cell. Information is stored in the table.</p>' +
							'<label style="font-size:100%; color:#FE9128;">Ordering:</label>' + 
							'<p>By default, the Distance Matrix is ordered by identifier. However, you can choose to order it by any field present in the auxilary data. By selecting one of the additional options of the <i>dropdown</i> menu above the Distance Matrix.</p>' +

							'</p>';
			$('#' + divId).append(toAppend);
		}
	}
}


