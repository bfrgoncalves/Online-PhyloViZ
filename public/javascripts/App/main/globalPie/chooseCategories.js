
function chooseCategories(graphObject, method){
	var toAppend = '<div style="width:100%;height:60%;font-size:150%;text-align:center;">';
	toAppend += '<div style="width:40%;height:50%;float:left;"><label>Exclude</label><select style="height:100%;" size="10" id="toSelectCategories'+method+'"></select></div>';
	toAppend += '<a class="btn btn-default" style="margin-top:10%;" type="button" id="transferCategoryButton">Transfer</a>';
	toAppend += '<div style="width:40%;height:50%;float:right"><label>Include</label><select style="height:100%;" size="10" id="selectedCategories'+method+'"></select></div>';
	toAppend += '<div style="width:100%;text-align:center;"><button style="margin-top:10%;" class="btn btn-primary" id="changeCategoriesButton">Ok</button></div>';
	toAppend += '<div style="width:100%;text-align:center;margin-top:5%;">Select the different categories you want to see in the Tree visualization. By default, only the top 20 results are displayed. All the others are classified as <b><i>Others</i>.</b><br></div>';
	toAppend += '</div>';

	graphObject.currentCategorySelected = [];
	graphObject.arrayOfCurrentCategories = [];
	graphObject.changeFromFilterCategories = false;

	$('#dialog').empty();
	$('#dialog').append(toAppend);

	var optionsSelected = '';
	var countCategoriesS = 0;
	for(i in graphObject.categoriesAdded){
		countCategoriesS++;
		optionsSelected += '<option id="selectedC'+countCategoriesS+'" value="' + graphObject.categoriesAdded[i].label + '" counts="'+ graphObject.categoriesAdded[i].value +'">' + graphObject.categoriesAdded[i].label + ' (n=' + graphObject.categoriesAdded[i].value + ')</option>';
	}

	var optionstoSelect = '';
	var countCategoriesUs = 0;
	for(i in graphObject.categoriesThatCanBeAdded){
		countCategoriesUs++;
		optionstoSelect += '<option id="toselectC'+countCategoriesUs+'" value="' + graphObject.categoriesThatCanBeAdded[i].label + '" counts="'+graphObject.categoriesThatCanBeAdded[i].value+'">' + graphObject.categoriesThatCanBeAdded[i].label + ' (n=' + graphObject.categoriesThatCanBeAdded[i].value + ')</option>';
	}

	$("#selectedCategories"+method).append(optionsSelected);
	$("#toSelectCategories"+method).append(optionstoSelect);

	$('#dialog').dialog({
      height: $(window).height() * 0.4,
      width: $(window).width() * 0.4,
      modal: true,
      resizable: true,
      dialogClass: 'no-close success-dialog'
	});

	$("#toSelectCategories"+method).change(function(){
		graphObject.currentCategorySelected = [$("#toSelectCategories"+method+" option:selected").val(), 'wasUnselected', $("#toSelectCategories"+method+" option:selected").attr('id'), $("#toSelectCategories"+method+" option:selected").attr('counts')];
	});
	$("#selectedCategories"+method).change(function(){
		graphObject.currentCategorySelected = [$("#selectedCategories"+method+" option:selected").val(), 'wasSelected', $("#selectedCategories"+method+" option:selected").attr('id'), $("#selectedCategories"+method+" option:selected").attr('counts')];
	});

	$('#transferCategoryButton').click(function(){
		if(graphObject.currentCategorySelected.length > 0){
			if(graphObject.currentCategorySelected[1] == 'wasSelected'){
				$('#' + graphObject.currentCategorySelected[2]).remove();
				countCategoriesUs++;
				var toUnselected = '<option id="toselectC'+countCategoriesUs+'" value="' + graphObject.currentCategorySelected[0] + '" counts="'+graphObject.currentCategorySelected[3]+'">' + graphObject.currentCategorySelected[0] + ' (n=' + graphObject.currentCategorySelected[3] + ')</option>';
				$("#toSelectCategories"+method).append(toUnselected);

			}
			else if(graphObject.currentCategorySelected[1] == 'wasUnselected'){
				$('#' + graphObject.currentCategorySelected[2]).remove();
				countCategoriesS++;
				var toSelected = '<option id="selectedC'+countCategoriesS+'" value="' + graphObject.currentCategorySelected[0] + '" counts="'+graphObject.currentCategorySelected[3]+'">' + graphObject.currentCategorySelected[0] + ' (n=' + graphObject.currentCategorySelected[3] + ')</option>';
				$("#selectedCategories"+method).append(toSelected);
			}
		}
		graphObject.currentCategorySelected = [];
	});

	$('#changeCategoriesButton').click(function(){
		graphObject.arrayOfCurrentCategories = [];
		var toBeSelected = document.getElementById("selectedCategories"+method);
		for (i = 0; i < toBeSelected.length; i++) {
	        graphObject.arrayOfCurrentCategories.push(toBeSelected.options[i].value);
	    }
	    graphObject.changeFromFilterCategories = true;

	    if(method == 'isolates') $("#selectByMetadata").trigger("change");
	    else if(method == 'profiles') $("#selectByScheme").trigger("change");
	    $('#dialog').dialog('close');

	})


}