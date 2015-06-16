

function checkDatasets(){

	$.ajax({
      url: '/api/db/datasets',
      data: $.param({select: 'name'}),
      processData: false,
      contentType: false,
      type: 'GET',
      success: function(data){
        createDropdown(data);
      }

    });
}

function createDropdown(data){

	var parent = $('#existingDatasets');
	var options = '<option data-hidden = "true"></option>';;

	for (var index in data){
		var datasetName = data[index].name;
		options += '<option>'+datasetName+'</option>';
	}
	parent.append('<select class="selectpicker" title = "Select an existing dataset..." id="selectDataset" data-live-search="true">'+options+'</select>');

	$('.selectpicker').selectpicker();
	  $('.selectpicker').selectpicker({
	    style: 'btn-info',
	    size: 5
	});
}