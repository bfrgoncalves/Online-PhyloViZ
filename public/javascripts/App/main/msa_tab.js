

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
	});

	$('#menuLocation').empty();
	$('#alignmentLocation').empty();
	console.log(graphObject);
	
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
	opts.vis = {conserv: false, overviewbox: false}
	opts.zoomer = {alignmentHeight: window.innerHeight * 0.7, labelWidth: 110,labelFontsize: "15px",labelIdLength: 50}
	opts.conf = {dropImport: true};

	// init msa
	var m = new msa.msa(opts);

	// the menu is independent to the MSA container
	var menuOpts = {};
	menuOpts.el = document.getElementById('menuLocation');
	menuOpts.msa = m;
	var defMenu = new msa.menu.defaultmenu(menuOpts);
	//defMenu.views = {};
	delete defMenu.views['10_import'];
	delete defMenu.views['40_vis'];
	delete defMenu.views['70_extra'];
	delete defMenu.views['80_export'];
	delete defMenu.views['90_help'];
	delete defMenu.views['95_debug'];

	m.addView("menu", defMenu);

	// call render at the end to display the whole MSA
	m.render();

	$('.nav-tabs > li.active').removeClass('active');
  	$('.tab-pane.active').removeClass('active');
  	$('#FASTATab').addClass('active');
  	$('#FASTAContent').addClass('active');

	$("#waitingGifMain").css('display', 'none');
	status('');

}
