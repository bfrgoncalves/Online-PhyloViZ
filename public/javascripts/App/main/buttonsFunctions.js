const loadButtonFunctions = () => {

    return {

        datasetInfo: (graphObject) => {

            $('#datasetInfobt').click(function(){

                const dialog_box = $("#dialog");

                dialog_box.empty();

                let toDialog = '<div id="divinfoDataset">';
                let table = {};

                table.data = {'Data Set Name': graphObject.graphInput.dataset_name, 'Data Set Size': graphObject.graphInput.nodes.length, 'Data Type': graphObject.graphInput.data_type};

                try{
                    table.data['Date'] = graphObject.graphInput.data_timestamp[0].split('T')[0];
                }
                catch(err){
                    table.data['Date'] = 'Undefined';
                }

                if (graphObject.graphInput.metadata.length > 0){
                    table.data.Metadata = 'True';
                }
                else{
                    table.data.Metadata = 'False';
                }

                if (graphObject.graphInput.data_type === 'profile' || graphObject.graphInput.data_type === 'fasta') {
                    table.data['Original Profile Size'] = graphObject.graphInput.nodes[0].profile.length;
                }
                if(graphObject.graphInput.hasOwnProperty('goeburst_timer')) {
                    table.data['goeBURST Execution Time'] = graphObject.graphInput.goeburst_timer;
                }

                table.data['Max. Link Distance'] = graphObject.maxLinkValue;

                if(graphObject.graphInput.hasOwnProperty('missing_threshold')){
                    table.data['Missing Data Threshold'] = graphObject.graphInput.missing_threshold;
                }
                if(graphObject.graphInput.hasOwnProperty('analysis_method')){
                    table.data['Analysis Method'] = graphObject.graphInput.analysis_method;
                }

                table.data['goeBURST Profile Size'] = graphObject.graphInput.subsetProfiles[0].profile.length;

                if(graphObject.graphInput.hasOwnProperty('parent_id')){
                    const url = window.location.href.substring(0,window.location.href.lastIndexOf("/")) + '/' + graphObject.graphInput.parent_id;
                    table.data['Parent Data Set'] = '<a href="'+url+'">'+url+'</a>';
                }
                for(let parameter in table.data){
                    toDialog += '<p style="font-size:12px;"><b>' + parameter + '</b> : ' + table.data[parameter];
                }

                toDialog += '</div>';

                dialog_box.append(toDialog);

                dialog_box.dialog({
                    height: $(window).height() * 0.40,
                    width: $(window).width(),
                    modal: true,
                    resizable: true,
                    dialogClass: 'no-close success-dialog'
                });


            });

        },

        /*
        numberOfNodes: (graphObject) => {

            var graph = graphObject.graphInput;

            $('#numberOfNodes').append(' <b>' + graph.nodes.length + '</b>');

        },
        */

        profileLength: (graphObject) => {

            const profileLength = graphObject.graphInput.nodes[0].profile.length;

            $('#countProfileSize').text(profileLength);

        },

        datasetName: (graphObject) => {

            const graph = graphObject.graphInput;

            $('#datasetNameDiv').append(' <b>'+ graph.dataset_name + '</b>');

        },

        resetPositionButton: (graphObject) => {
            $('#resetPositionButton').click(function() {
                graphObject.renderer.reset();
                graphObject.renderer.reset();
                graphObject.adjustLabelPositions();

                const nodePosition = graphObject.layout.getNodePosition(graphObject.graphInput.sameNodeHas[graphObject.TopNode.id]);

                graphObject.renderer.moveTo(nodePosition.x,nodePosition.y);
                graphObject.graphFunctions.adjustScale(graphObject);
                graphObject.graphFunctions.launchGraphEvents(graphObject);

                if(graphObject.isLayoutPaused){
                    graphObject.renderer.resume();
                    setTimeout( () => {
                        graphObject.renderer.pause();
                    }, 50);
                }
            });
        },

        resetPinButton: (graphObject) => {
            $('#resetPinButton').click(function() {
                if (graphObject.pinNodes === undefined || graphObject.pinNodes === false){
                    graphObject.pinNodes = true;
                    $("#resetPinButton").toggleClass("btn-warning", true);
                    $("#resetPinButton").toggleClass("btn-default", false);
                    $("#iconResetPin").toggleClass("fa-thumb-tack", false);
                    $("#iconResetPin").toggleClass("fa-chain-broken", true);
                    
                    graphObject.graphGL.forEachNode((node) => {
                        graphObject.layout.pinNode(node, true);
                    });
                }
                else{
                    graphObject.pinNodes = false;
                    $("#resetPinButton").toggleClass("btn-warning", false);
                    $("#resetPinButton").toggleClass("btn-default", true);
                    $("#iconResetPin").toggleClass("fa-thumb-tack", true);
                    $("#iconResetPin").toggleClass("fa-chain-broken", false);

                    graphObject.graphGL.forEachNode((node) => {
                        graphObject.layout.pinNode(node, false);
                    });
                }

            });
        },

        screenshotButton: (graphObject) => {

            $("#screenshotMode").off("click").on("click", () => {
                if (graphObject.screenshot === undefined || graphObject.screenshot === false){
                    graphObject.screenshot = true;
                    $("#col_webgl").css({opacity:0});
                    $("#searchForm").css({opacity:0});
                    $("#screenshotMode").toggleClass("btn-warning", true);
                    $("#screenshotMode").toggleClass("btn-default", false);

                    const dialog_box = $('#dialog');

                    const toDialog = '<div style="text-align: center;"><label>Screenshot Mode:</label></div>' +
                    '<div text-align:center;">' +
                    '<div>In this mode, only the tree and legend is visible for a better image retrieval. We recomend using browser plugins for the screenshot.</div>' +
                    '</div>';

                    dialog_box.empty();
                    dialog_box.append(toDialog);
                    dialog_box.dialog({
                        height: $(window).height() * 0.15,
                        width: $(window).width() * 0.2,
                        modal: true,
                        resizable: true,
                        dialogClass: 'no-close success-dialog'
                    });
                }
                else {
                    graphObject.screenshot = false;
                    $("#col_webgl").css({opacity:1});
                    $("#searchForm").css({opacity:1});
                    $("#screenshotMode").toggleClass("btn-warning", false);
                    $("#screenshotMode").toggleClass("btn-default", true);
                }
            });
            
        },

        legendsButton: (graphObject) => {
            
            $("#legendsButton").off("click").on("click", () => {
                if($('#AddLinkLabels').prop('checked') === false || $('#AddLabels').prop('checked') === false){
                    $('#AddLinkLabels').prop('checked', true);
                    $('#AddLabels').prop('checked', true);
                    $("#legendsButton").toggleClass("btn-warning", true);
                    $("#legendsButton").toggleClass("btn-default", true);
                }
                else {
                    $('#AddLinkLabels').prop('checked', false);
                    $('#AddLabels').prop('checked', false);
                    $("#legendsButton").toggleClass("btn-warning", false);
                    $("#legendsButton").toggleClass("btn-default", true);

                }
            });
        },

        pauseButton: (graphObject) => {

            const graph = graphObject.graphInput;
            const renderer = graphObject.renderer;

            graphObject.isLayoutPaused = false;

            setTimeout( () => {

                if (Object.keys(graph.positions).length > 0){
                    renderer.pause();
                    graphObject.isLayoutPaused = true;

                    $('#pauseLayout')[0].innerHTML = "Resume Layout";

                    const icon_pause_layout = $('#iconPauseLayout');
                    icon_pause_layout.toggleClass('fa fa-pause',false);
                    icon_pause_layout.toggleClass('glyphicon fa-play',true);
                }

            }, 500);

            $('#pauseLayout').click(function(e) {
                e.preventDefault();
                if(!graphObject.isLayoutPaused){
                    renderer.pause();
                    graphObject.isLayoutPaused = true;
                    //$('#pauseLayout')[0].innerHTML = "Resume Layout";

                    const icon_pause_layout = $('#iconPauseLayout');
                    $("#pauseLayout").toggleClass("btn-warning", true);
                    $("#pauseLayout").toggleClass("btn-default", false);
                    icon_pause_layout.toggleClass('fa fa-pause',false);
                    icon_pause_layout.toggleClass('fa fa-play',true);
                }
                else{
                    renderer.resume();
                    graphObject.isLayoutPaused = false;
                    //$('#pauseLayout')[0].innerHTML = "Pause Layout";

                    const icon_pause_layout = $('#iconPauseLayout');
                    $("#pauseLayout").toggleClass("btn-warning", false);
                    $("#pauseLayout").toggleClass("btn-default", true);
                    icon_pause_layout.toggleClass('fa fa-play',false);
                    icon_pause_layout.toggleClass('fa fa-pause',true);

                }
            });
        },


        graphicButtons: (graphObject) => {

            const add_link_labels_button = $('#AddLinkLabels');
            const add_node_labels_button = $('#AddLabels');
            const spring_length_slider_button = $('#SpringLengthSlider');


            add_link_labels_button.prop('checked', false);
            add_node_labels_button.prop('checked', false);

            $('#NodeSizeSlider').change(function(){
                NodeSize(this.value, this.max, graphObject);
            });

            $('#SizeProperty').change(function(){
                ChangeNodeSizeOption(graphObject, this.value);
            });

            $('#NodeLabelSizeSlider').change(function(){
                LabelSize(this.value, graphObject, graphObject.nodeLabels, 'node');
            });

            $('#LinkLabelSizeSlider').change(function(){
                LabelSize(this.value, graphObject, graphObject.linkLabels, 'link');
            });

            $('#scaleLink').change(function(){
                scaleLink(this.value, graphObject);
            });

            $('#scaleNode').change(function(){
                scaleNodes(this.value, graphObject);
            });

            spring_length_slider_button.attr({
                "max" : graphObject.maxLinkValue,
            });

            spring_length_slider_button.change(function(){
                changeSpringLength(this.value, this.max, graphObject);
            });

            $('#DragSlider').change(function(){
                changeDragCoefficient(this.value, this.max, graphObject);
            });

            $('#SpringCoefSlider').change(function(){
                changeSpringCoefficient(this.value, this.max, graphObject);
            });

            $('#GravitySlider').change(function(){
                changeGravity(this.value, this.max, graphObject);
            });

            $('#ThetaSlider').change(function(){
                changeTheta(this.value, this.max, graphObject);
            });

            $('#MassSlider').change(function(){
                changeMass(this.value, this.max, graphObject);
            });

            $('#buttonChangeToOuter').click(function(){
                if(graphObject.withcenter){
                    changeColorToOuterRing(graphObject);
                    $('#outerColorLegendDiv').css({'display':'block'});
                    graphObject.withcenter = false;
                }
            });

            $('#buttonRemoveFromOuter').click(function(){
                removeColorFromOuterRing(graphObject);
            });


            $('#resetLayout').on('click', function(){

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


            add_node_labels_button.change(function(){
                if (this.checked){
                    if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){

                        const dialog_box = $('#dialog');

                        dialog_box.empty();
                        const toAppend = '<div style="width:100%;height:50%;text-align:center;"><p>Using this web browser, you might experience some performance loss when adding labels. Do you wish to continue?</p><br><button id="yesLabels" class="btn btn-primary">Yes</button><button id="noLabels" class="btn btn-danger">No</button></div>';

                        dialog_box.append(toAppend);
                        dialog_box.dialog();

                        $('#yesLabels').click(function(){
                            AddNodeLabels(graphObject);
                            $('#dialog').dialog('close');
                        });
                        $('#noLabels').click(function(){
                            $('#AddLinkLabels').prop('checked', false);
                            $('#dialog').dialog('close');

                        });
                    }
                    else {
                        AddNodeLabels(graphObject);
                    }
                }
                else{
                    $('.node-label').css('display','none');
                    graphObject.tovisualizeLabels = false;
                }
            });

            $('#AddLogScaleNodes').change(function(){
                if (this.checked){
                    graphObject.isLogScaleNodes = true;
                    changeLogScaleNodes(graphObject);
                }
                else{
                    graphObject.isLogScaleNodes = false;
                    changeLogScaleNodes(graphObject);
                }
            });

            $('#AddLogScale').change(function(){
                if (this.checked){
                    graphObject.isLogScale = true;
                    changeLogScale(graphObject);
                }
                else{
                    graphObject.isLogScale = false;
                    changeLogScale(graphObject);
                }
            });

            add_link_labels_button.change(function(){
                if (this.checked){
                    if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
                        const dialog_box =  $('#dialog');

                        dialog_box.empty();
                        const toAppend = '<div style="width:100%;height:50%;text-align:center;"><p>Using this web browser, you might experience some performance loss when adding labels. Do you wish to continue?</p><br><button id="yesLabels" class="btn btn-primary">Yes</button><button id="noLabels" class="btn btn-danger">No</button></div>';

                        dialog_box.append(toAppend);
                        dialog_box.dialog();

                        $('#yesLabels').click(function(){
                            AddLinkLabels(graphObject);
                            $('#dialog').dialog('close');
                        });
                        $('#noLabels').click(function(){
                            $('#AddLinkLabels').prop('checked', false);
                            $('#dialog').dialog('close');

                        });
                    }
                    else AddLinkLabels(graphObject);
                }
                else{
                    const div_select_label_type = $('#divselectLabelType');

                    if(graphObject.graphInput.data_type !== "newick"){
                        div_select_label_type.css({"display": "none"});
                    }

                    div_select_label_type.css({"display": "none"});
                    $('.link-label').css('display','none');
                    graphObject.tovisualizeLinkLabels = false;
                }
            });

            $('#labelType').change(function(){
                if(this.value === 'relative'){

                    const profileSize = graphObject.graphInput.nodes[0].profile.length;

                    graphObject.graphGL.forEachLink(function(link) {
                        graphObject.linkLabels[link.id].innerText = (parseFloat(graphObject.linkLabels[link.id + 'default']) / profileSize).toFixed(2);
                    });
                }
                else{
                    graphObject.graphGL.forEachLink(function(link) {
                        graphObject.linkLabels[link.id].innerText = parseInt(graphObject.linkLabels[link.id + 'default']);
                    });
                }
            });

            $('#labelTypeNewick').change(function(){
                if(this.value === 'bootstrap'){
                    graphObject.graphGL.forEachLink(function(link) {
                        graphObject.linkLabels[link.id].innerText = link.data.bootstrap;
                    });
                }
                else{
                    graphObject.graphGL.forEachLink(function(link) {
                        graphObject.linkLabels[link.id].innerText = link.data.value;
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


        operationsButtons: (graphObject) => {

            const dialog_box = $('#dialog');
            const exclusive_loci_input = $('#exclusiveLoci');
            const generate_public_link_button = $('#generatePublicLinkButton');

            if (graphObject.graphInput.isPublic === true){
                generate_public_link_button.html('Revoke Public Link');
            }

            $('#distanceButton').click(function(){
                let cont = true;
                let message = '';
                if (graphObject.selectedNodes.length < 2){
                    message = 'To compute distances, first you need to select more than one node.';
                    cont=false;
                }
                else if (graphObject.selectedNodes.length >= 500){
                    message = 'To much nodes selected. The maximum number is currently 500.';
                    cont=false;
                }

                if(!cont){
                    const toDialog = '<div style="text-align: center;"><label>'+message+'</label></div>';

                    dialog_box.empty();
                    dialog_box.append(toDialog);
                    dialog_box.dialog({
                        height: $(window).height() * 0.15,
                        width: $(window).width() * 0.2,
                        modal: true,
                        resizable: true,
                        dialogClass: 'no-close success-dialog'
                    });
                    return false;
                }

                if(graphObject.graphInput.data_type === 'newick') {
                    getNewickDistances(graphObject);
                }
                else {
                    checkLociDifferences(graphObject);
                }

            });

            $('#savePositionsButton').click(function(){
                saveTreePositions(graphObject);
            });

            const create_subset_button = $('#createSubset1');

            if(graphObject.graphInput.data_type[0] !== 'profile') {
                create_subset_button.css({"display":"none"});
            }

            create_subset_button.click(function(){

                graphObject.freezeSelection = true;

                const toDialog = '<div style="text-align: center;"><label>Subset information:</label></div>' +
                    '<label for="datasetNameSubset">Dataset Name</label>' +
                    '<input class="form-control input-sm" id="datasetNameSubset" type="text" placeholder="Select a name for the dataset" required/>'+
                    '<label for="dataset_description_Subset">Dataset Description</label>' +
                    '<input class="form-control input-sm" id="dataset_description_Subset" type="text" placeholder="Description"/>' +
                    '<br>'+
                    '<div id="profileAnalysisMethod">'+
                    '<label class="input-formats" for="sel_analysis_method">Analysis Method</label>'+
                    '<select id="sel_analysis_method">'+
                    '<option value="core">Core Analysis</option>'+
                    '<option value="pres-abs">Presence/Absence</option>'+
                    '</select></div><br>'+
                    '<div id="missingcheckboxsubset" style="text-align:left;height:5%;">'+
                    '<label class="checkbox-inline"><input type="checkbox" id="missingchecksubset"/>Has missings</label>'+
                    '<label class="checkbox-inline"><input class="input-sm" id="missingdelimitersubset" type="text" placeholder="Missings character" required style="display:none"/></label>'+
                    '</div><br>'+
                    '<div class="col-md-12" id="div_threshold" style="display:none;">'+
                    '<div class="col-md-6">'+
                    '<span id="span_threshold">Threshold (Absent Loci)<input id="missingthreshold" type="range" value="100" min="0" max="100" required/></span>'+
                    '</div><div>'+
                    '<input type="text" style="width:30%;" id="textInput" value="100" disabled></div></div>'+
                    '<div style="width:100%;text-align:center"><button id="okButtonsubset" class="btn btn-primary btn-md">OK</button></div><br><div id="errorSubset" style="width:100%;text-align:center;"></div>';

                dialog_box.empty();
                dialog_box.append(toDialog);
                dialog_box.dialog({
                    height: $(window).height() * 0.50,
                    width: $(window).width() * 0.50,
                    modal: true,
                    resizable: true,
                    dialogClass: 'no-close success-dialog'
                });

                $('#sel_analysis_method').change(function(){
                    if($(this).val() === 'core') {
                        $('#missingcheckboxsubset').css({"display":"block"});
                        $('#missingchecksubset').css({"display":"block"});
                        $('#missingdelimitersubset').css({"display":"none"});
                        $('#div_threshold').css({"display":"none"});
                        document.getElementById('missingchecksubset').checked = false;
                    }
                    else{
                        $('#missingcheckboxsubset').css({"display":"block"});
                        $('#missingchecksubset').css({"display":"none"});
                        $('#missingdelimitersubset').css({"display":"block"});
                        $('#div_threshold').css({"display":"block"});
                        document.getElementById('missingchecksubset').checked = true;
                    }
                });

                $('#missingthreshold').change(function(){
                    document.getElementById('textInput').value=this.value;
                });


                $('#missingchecksubset').click(function(){
                    if ($(this).is(':checked')){
                        $('#missingdelimitersubset').css({"display": "block"});
                    }
                    else{
                        $('#missingdelimitersubset').css({"display": "none"});
                    }

                });

                dialog_box.on('dialogclose', function() {
                    graphObject.freezeSelection = false;
                });

                $('#okButtonsubset').click(function(){

                    const error_subset = $('#errorSubset');

                    if(graphObject.selectedNodes.length === 0){
                        error_subset.empty();
                        error_subset.append('<label>First you need to select some nodes.</label>');
                        return false;
                    }

                    const datasetN = $('#datasetNameSubset').val();
                    const descriptionS = $('#dataset_description_Subset').val();
                    let missingsubset = true;
                    let missingCharsubset = '';
                    const analysis_method = $('#sel_analysis_method').val();
                    let missing_threshold = '0';

                    if(document.getElementById('missingchecksubset').checked){
                        missingsubset = true;
                        missingCharsubset = $('#missingdelimitersubset').val();
                        if (analysis_method === 'pres-abs'){
                            missing_threshold = $('#missingthreshold').val();
                        }
                    }

                    const nodeNames = selectedDataNames(graphObject);

                    createSubset(nodeNames, window.location.href.substr(window.location.href.lastIndexOf('/') + 1), datasetN, descriptionS, missingsubset, missingCharsubset, analysis_method, missing_threshold, (data) => {
                        if(!data.error){
                            dialog_box.dialog('close');
                            graphObject.freezeSelection = false;
                        }
                        else{
                            $('#createSubset1').trigger('click');
                            setTimeout( () => {
                                dialog_box.append('<br><div style="width:100%;text-align:center;"><label>'+data.error+'</label></div>');
                            }, 200);
                        }
                    });
                });
            });

            $('#exportgoeBURST').click(function(){
                exportgoeBURSTprofiles(graphObject);
            });

            $('#exportoriginal').click(function(){
                exportprofiles(graphObject);
            });

            $('#viewSequences').click(function(){
                createMSA(graphObject);
            });

            let showExclusiveInfo = true;

            if(graphObject.graphInput.nodes[0].profile.length > 2000 && graphObject.graphInput.nodes.length > 3000){
                exclusive_loci_input.css({'display': 'none'});
                showExclusiveInfo = false;
            }

            if(graphObject.graphInput.nodes.length > 3000){
                let toDialog = '<div style="text-align: center;"><label>Due to the large number of nodes, <b>NLV graph</b> option ';

                if(!showExclusiveInfo){
                    toDialog += 'and <b>Find Exclusive Loci</b> option are not available.';
                }
                else{
                    toDialog += 'is not available.';
                }

                toDialog += 'We are working to solve this problem.</label></div>';

                dialog_box.empty();
                dialog_box.append(toDialog);
                dialog_box.dialog({
                    height: $(window).height() * 0.20,
                    width: $(window).width() * 0.40,
                    modal: true,
                    resizable: true,
                    dialogClass: 'no-close success-dialog'
                });
            }



            exclusive_loci_input.click(function(){
                get_exclusive_loci(graphObject, () => {
                    if (graphObject.exclusive_loci.length === 0){
                        let toDialog = '';

                        if (graphObject.selectedNodes.length !== 0){
                            toDialog = '<div style="text-align: center;"><label>There are no unique profile positions related to the selected group.</label></div>';
                        }
                        else{
                            toDialog = '<div style="text-align: center;"><label>Select one or more nodes to find exclusive loci.</label></div>';
                        }
                        dialog_box.empty();
                        dialog_box.append(toDialog);
                        dialog_box.dialog({
                            height: $(window).height() * 0.20,
                            width: $(window).width() * 0.40,
                            modal: true,
                            resizable: true,
                            dialogClass: 'no-close success-dialog'
                        });
                    }
                    else write_exclusive_file(graphObject);
                });
            });

            $('#updateMetadata').click(function(){
                updateMetadata(graphObject);
            });

            $('#Choosecategories').click(function(){
                chooseCategories(graphObject, graphObject.linkMethod);
            });

            generate_public_link_button.click(function(){
                PublicLink(graphObject);
            });

            $('#getLinkButton').click(function(){
                getLink(graphObject);
            });

            $('#exportSelectedDataButton').click(function(){
                exportSelectedDataTree(graphObject);
            });

            $('#saveImageButton1').click(function(){

                const toDialog = '<div style="text-align: center;"><label>Only what is visible on the screen will appear on the pdf. Make sure to re-center the tree or adjust the positioning before printing.</label></div>' +
                    '<div id="buttonoptionsdiv" style="width:90%;position:absolute;bottom:2px;text-align:center;">' +
                    '<div style="width:20%;float:left;"><button id="cancelButtonPDF" class="btn btn-danger btn-md">Cancel</button></div>' +
                    '<div style="width:20%;float:right;"><button id="okButtonPDF" class="btn btn-primary btn-md">OK</button></div>' +
                    '</div>';

                dialog_box.empty();
                dialog_box.append(toDialog);
                dialog_box.dialog({
                    height: $(window).height() * 0.15,
                    width: $(window).width() * 0.2,
                    modal: true,
                    resizable: true,
                    dialogClass: 'no-close success-dialog'
                });

                $('#okButtonPDF').click(function(){
                    printDiv(graphObject);
                });

                $('#cancelButtonPDF').click(function(){
                    $('#dialog').dialog("close");
                });

            });

            const split_tree_slider = $("#SplitTreeSlider");
            const nlv_number = $("#NLVnumber");
            const nlv_collapse_number = $("#nlvcollapsenumber");

            split_tree_slider.attr({
                "max" : graphObject.maxLinkValue,
                "value" : graphObject.maxLinkValue
            });

            if(graphObject.graphInput.maxDistanceValue === -1){
                nlv_number.attr({
                    "value" : 0
                });
                nlv_collapse_number.attr({
                    "value" : 0
                });
            }
            else {
                nlv_number.attr({
                    "max" : graphObject.graphInput.maxDistanceValue,
                    "value" : 0
                });
                nlv_collapse_number.attr({
                    "max" : graphObject.graphInput.maxDistanceValue,
                    "value" : 0
                });
            }

            split_tree_slider.change(function(){
                splitTree(graphObject, this.value);
            });

            nlv_number.change(function(){
                NLVgraph(graphObject, this.value);
            });

            nlv_collapse_number.change(function(){
                NLVcollapse(graphObject, this.value);
            });

            if(!graphObject.graphInput.hasOwnProperty('distanceMatrix')){
                $('#NLVgraph').css({"display": "none"});
                $('#NLVcollapse').css({"display": "none"});
            }
        },

        searchButton: (graphObject) => {

            $('#searchForm').submit(function(e) {
                e.preventDefault();
                const nodeId = $('#nodeid').val();
                centerNode(nodeId, graphObject);
            });
        }
    }
};

const AddLinkLabels = (graphObject) => {

    $('#divselectLabelType').css({"display": "block"});
    $('.link-label').css('display','block');

    if(graphObject.graphInput.data_type !== "newick") {
        $('#labelType').css({"display": "block"});

        if(graphObject.graphInput.missingsInfo[0]){
            $('#withmissings').css({"display": "block"});
        }
        else{
            $('#withmissings').css({"display": "none"});
        }
        $('#labelTypeNewick').css({"display": "none"});
    }
    else{
        $('#labelType').css({"display": "none"});
        $('#labelTypeNewick').css({"display": "block"});
    }

    for (let i in graphObject.removedLinks){
        const labelStyle = graphObject.linkLabels[graphObject.removedLinks[i].id].style;
        labelStyle.display = "none";
    }
    graphObject.tovisualizeLinkLabels = true;

    if(graphObject.isLayoutPaused === true){
        graphObject.renderer.resume();
        setTimeout(function(){ graphObject.renderer.pause();}, 50);
    }
    else{
        graphObject.renderer.resume();
    }

};

const AddNodeLabels = (graphObject) => {
    $('.node-label').css('display','block');
    graphObject.tovisualizeLabels = true;
    if(graphObject.isLayoutPaused === true){
        graphObject.renderer.resume();
        setTimeout(function(){ graphObject.renderer.pause();}, 50);
    }
    else{
        graphObject.renderer.resume();
    }
};
