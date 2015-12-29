function tutorial(divId){
	
	return {
		home: function(){
			$('#' + divId).empty();
			var toAppend = '<div class="tutorialDiv">'+
							"<p>Welcome to PHYLOViZ Online! This is the application's index page.</p>"+
								'<label>Operations:</label>'+
							'<p>On the left side you have all the operations  you can perform. You can access to public datasets, upload and access your own datasets. </p><label>Note:</label> <p>To upload and to access your own data you have to be registered in the application.</p>'+
							'</div>';
			$('#' + divId).append(toAppend);
		},
		publicdatasets: function(){
			$('#' + divId).empty();
			var toAppend = '<div class="tutorialDiv">'+
							'<p>This is the area where you can access to all the public datasets.</p>'+
								'<label>1º - Select one dataset from the table</label>'+
							'<p>Select a dataset by clicking on one of the rows.</p>'+
							'<label>2º - Launch the Tree</label>'+
							'<p>Click on the <i>Launch Tree</i> button to be redirected to the tree visualization.</p>'+
							'<label>Notes:</label>'+
							'<p>You can not modify or delete public datasets. If yu which to modify the datasets you have made public, login and access to them on your user area.</p>'+
							'</div>';
			$('#' + divId).append(toAppend);
		},
		userdatasets: function(){
			$('#' + divId).empty();
			var toAppend = '<div class="tutorialDiv">'+
							'<p>This is the area where you can access to all the datasets that you have uploaded.</p>'+
								'<label>1º - Select one dataset from the table</label>'+
							'<p>Select a dataset by clicking on one of the rows.</p>'+
							'<label>2º - Launch the Tree</label>'+
							'<p>Click on the <i>Launch Tree</i> button to be redirected to the tree visualization.</p>'+
							'<label>Notes:</label>'+
							'<p>You can delete datasets by selecting one of the rows and clicking on the <i>Delete</i> button. If your dataset is public, it will be also deleted from the public datasets.</p>'+
							'<p>You can also change the dataset name or description by selecting a row, typing a new dataset name or descrition, and clicking on <i>Change Dataset Name</i> or <i>Change Description</i>.</p>'+
							'</div>';
			$('#' + divId).append(toAppend);
		},
		uploaddatasets: function(){
			$('#' + divId).empty();
			var toAppend = '<div class="tutorialDiv">'+
							'<p>This is the upload area of the application.</p>'+
								'<label>1º - Choose an input type</label>'+
							'<p>Select between a tab-separated file with profiles, a Newick file or a FASTA file with aligned sequences of the same size.</p>'+
							'<label>2º - Select files</label>'+
							'<p>Choose the files you want to upload. To link the tab-separated profile data with the auxiliary data, the first column header of each file must be the same.</p>'+
							'<label>3º - Add Name and Description</label>'+
							'<p>Select an identifier for your dataset an you can also add a short description.</p>'+
							'<label>4º - Allow sharing</label>'+
							'<p>If you want, you can make your dataset available for all other users. Do do that, check the <i>Make public</i> button.</p>'+
							'</div>';
			$('#' + divId).append(toAppend);
		}
	}
}