

function createMSA(graphObject){

	if (graphObject.selectedNodes.length < 1){
		alert("first you need to select some nodes");
		return false;
	}

	status('Creating Sequence Visualization...');
	$("#waitingGifMain").css({'display': 'block'});

	$('#clearFASTA').click(function(){
		$('#menuLocation').empty();
		$('#alignmentLocation').empty();
		$('#noSequences').css({'display': 'block'});
		$('#clearFASTA').css({'display': 'none'});
	});

	$('#menuLocation').empty();
	$('#alignmentLocation').empty();
	
	var opts = {};

	// set your custom properties
	// @see: https://github.com/greenify/biojs-vis-msa/tree/master/src/g 
	//opts.seqs = msa.utils.seqgen.getDummySequences(1000,300);

	opts.seqs = [];

	for(i in graphObject.selectedNodes){
		var node = graphObject.selectedNodes[i];
		opts.seqs.push({"id": node.data.idGL, "meta": "", "name": node.data.key, "seq": node.data.sequence});
	}

	opts.el = document.getElementById("alignmentLocation");
	opts.vis = {scaleslider:true}
	opts.zoomer = {alignmentHeight: window.innerHeight * 0.5}
	//opts.conf = {dropImport: true};

	// init msa
	var m = new msa.msa(opts);

	// the menu is independent to the MSA container
	var menuOpts = {};
	menuOpts.el = document.getElementById('menuLocation');
	menuOpts.msa = m;
	var defMenu = new msa.menu.defaultmenu(menuOpts);
	//defMenu.views = {};
	delete defMenu.views['10_import'];
	//delete defMenu.views['40_vis'];
	//delete defMenu.views['70_extra'];
	//delete defMenu.views['80_export'];
	delete defMenu.views['90_help'];
	delete defMenu.views['95_debug'];

	m.addView("menu", defMenu);

	// call render at the end to display the whole MSA
	m.render();

	var hide = false;

	$($('#menuLocation').find('ul')[1]).prepend('<li id="removePoly">Hide Non-Polymorphic Sites</li>');    

	$('#removePoly').click(function(){
		if(!hide){
			//var threshold = prompt('Enter the threshold value (in decimal values)');
			//var threshold = 1;
			ColumnFilter(defMenu, 1);
			$('#removePoly').text('Show Non-Polymorphic Sites');
			hide = true;
		}
		else{
			ColumnFilter(defMenu, 0);
			$('#removePoly').text('Hide Non-Polymorphic Sites');
			hide = false;
		}

	});

	$('.nav-tabs > li.active').removeClass('active');
  	$('.tab-pane.active').removeClass('active');
  	$('#FASTATab').addClass('active');
  	$('#FASTAContent').addClass('active');

  	$('#clearFASTALocation').css({'display': 'block'});
  	$('#noSequences').css({'display': 'none'});

	$("#waitingGifMain").css('display', 'none');
	status('');

}

function ColumnFilter(menu, threshold){    
	var msa = menu.msa;
	var hidden = [];
	var maxLen = msa.seqs.getMaxLength();
	var hidden = [];
	// TODO: cache this value
	var conserv = msa.g.stats.scale(msa.g.stats.conservation());
	var end = maxLen - 1;
	for (var i = 0; 0 < end ? i <= end : i >= end; 0 < end ? i++ : i--) {
		if (threshold != 0 && conserv[i] == threshold) {
			hidden.push(i);
		}
	}
	return msa.g.columns.set("hidden", hidden);
}
