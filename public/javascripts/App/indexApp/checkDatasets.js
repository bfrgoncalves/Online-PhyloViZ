

function checkDatasets(){

	$.ajax({
      url: '/api/db/datasets',
      data: $.param({select: 'name'}),
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
		if (forceSelect == countOptions) options += '<option selected = "selected">'+datasetName+'</option>';
		else options += '<option>'+datasetName+'</option>';
	}
	parent.append('<select class="selectpicker" title = "'+placeh+'" id="'+dropDownID+'" data-live-search="true">'+options+'</select>');

	$('.selectpicker').selectpicker();
	  $('.selectpicker').selectpicker({
	    style: 'btn-info',
	    size: 5
	});
}