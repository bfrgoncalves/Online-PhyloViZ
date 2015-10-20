

function checkDatasets(){

	$.ajax({
      url: '/api/db/postgres/find/datasets/all',
      //data: $.param({name: 'name'}),
      processData: false,
      contentType: false,
      type: 'GET',
      success: function(data){
        createDropdown(data, '#existingDatasets', 'Select an existing dataset...', 0, 'selectDataset');
      }

    });
}

function createDropdown(data, dropdownDiv, placeh, forceSelect, dropDownID){

	var parent = $(dropdownDiv);
	var options = '<option data-hidden = "true"></option>';;
	countOptions = 0;
	for (var index in data){
		countOptions += 1;
		var datasetName = data[index].name;
		var datasetID = data[index].dataset_id;
		if (forceSelect == countOptions) options += '<option value="'+datasetID+'">'+datasetName+'</option>';
		else options += '<option value="'+datasetID+'">'+datasetName+'</option>';
	}
	parent.append('<select class="selectpicker" title = "'+placeh+'" id="'+dropDownID+'" data-live-search="true">'+options+'</select>');

	$('.selectpicker').selectpicker();
	  $('.selectpicker').selectpicker({
	    style: 'btn-info',
	    size: 5
	});
}