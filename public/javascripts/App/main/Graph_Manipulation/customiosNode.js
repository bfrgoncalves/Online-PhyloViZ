// Lets start from the easiest part - model object for node ui in webgl
function WebglCircle(size, baseColor, data, colors, rawData) {
        circleDataArray = assignQuadrant(getDataPercentage(data), colors);
        this.size = size;
        this.baseColor = baseColor;
        this.data = circleDataArray[0];
        this.colorIndexes = circleDataArray[1];
        this.rawData = circleDataArray[2];

}

function getDataPercentage(data) {
    var arrayData = [];
    var total = 0;

    $.each(data,function() {
        total += this;
    });

     for (i = 0; i<data.length; i++){
        var result = (data[i]/total) * 360;
        if (data[i] == 0) arrayData.push(data[i]);
        else arrayData.push(result);
     }

    return arrayData;
}

function assignQuadrant(dataInPercentage, colorIndexes){

    maxSize = dataInPercentage.length;
    newDataArray = [];
    newIndexArray = [];
    remaining = 0;
    totalAngles = 0;
    prevTotalAngles = 0;
    countData = 0;

    fourQuadrants = [];
    fourIndexes = [];

    if (dataInPercentage.length == 0){
        return [[0],[0]];
    }
    else{
    
        while(totalAngles +  dataInPercentage[countData] <= 90){
            totalAngles += dataInPercentage[countData];
            newDataArray.push(dataInPercentage[countData]);
            newIndexArray.push(colorIndexes[countData]);
            countData++;
        }
        remaining = 90 - totalAngles;
        if (remaining > 0){
            newDataArray.push(remaining);
            newIndexArray.push(colorIndexes[countData]);
            dataInPercentage[countData] = dataInPercentage[countData] - remaining;
            totalAngles += remaining;
        } 

        fourQuadrants.push(newDataArray);
        fourIndexes.push(newIndexArray);

        newIndexArray = [];
        newDataArray = [];

        while(totalAngles +  dataInPercentage[countData] <= 180){
            totalAngles += dataInPercentage[countData];
            newDataArray.push(dataInPercentage[countData]);
            newIndexArray.push(colorIndexes[countData]);
            countData++;
        }
        if(totalAngles > 0) remaining = 180 - totalAngles;
        else remaining = 90;
        if (remaining > 0){
            newDataArray.push(remaining);
            newIndexArray.push(colorIndexes[countData]);
            dataInPercentage[countData] = dataInPercentage[countData] - remaining;
            totalAngles += remaining;
        } 

        fourQuadrants.push(newDataArray);
        fourIndexes.push(newIndexArray);

        newIndexArray = [];
        newDataArray = [];

        while(totalAngles +  dataInPercentage[countData] <= 270){
            totalAngles += dataInPercentage[countData];
            newDataArray.push(dataInPercentage[countData]);
            newIndexArray.push(colorIndexes[countData]);
            countData++;
        }
        if(totalAngles > 0) remaining = 270 - totalAngles;
        else remaining = 90;
        if (remaining > 0){
            newDataArray.push(remaining);
            newIndexArray.push(colorIndexes[countData]);
            dataInPercentage[countData] = dataInPercentage[countData] - remaining;
            totalAngles += remaining;
        } 

        fourQuadrants.push(newDataArray);
        fourIndexes.push(newIndexArray);

        newIndexArray = [];
        newDataArray = [];

        while(totalAngles +  dataInPercentage[countData] <= 360){
            totalAngles += dataInPercentage[countData];
            newDataArray.push(dataInPercentage[countData]);
            newIndexArray.push(colorIndexes[countData]);
            countData++;
        }

        fourQuadrants.push(newDataArray);
        fourIndexes.push(newIndexArray);

        newIndexArray = [];
        newDataArray = [];

        return [fourQuadrants, fourIndexes];
    }

}

function buildCircleNodeShader() {

            Math.radians = function(degrees) {
              return degrees * Math.PI / 180;
            };

            // For each primitive we need 4 attributes: x, y, color and size.
            var ATTRIBUTES_PER_PRIMITIVE = 8,
                nodesFS = [
                'precision mediump float;',
                'varying float quadrant;',

                'varying vec4 color;',
                'varying float angle;',
                'varying float prevAngle;',
                'varying float totalAngles;',

                'void main(){',

                    'bool found = false;',
                    'float rad = 0.0;',
                    'int prevAngleNumber = 0;',
                    'float prevTotal = 0.0;',

                    'vec4 parts = vec4(22.5);',


                    'if (quadrant == 1.0 && gl_PointCoord.y < 0.5 && gl_PointCoord.x > 0.5){',
                            'rad = radians(angle);',
                            'if (totalAngles == 90.0 && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.x)) / (- 2.0 * (gl_PointCoord.y - 0.5))){',
                                'gl_FragColor = color;',
                                'found = true;',
                            '}',
                            'else if (tan(rad + prevAngle) >= (- 2.0 * ( 0.5 - gl_PointCoord.x)) / (- 2.0 * (gl_PointCoord.y - 0.5)) && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.x)) / (- 2.0 * (gl_PointCoord.y - 0.5)) ){',
                                    'gl_FragColor = color;',
                                    'found = true;',
                            '}',
                    '}',

                   'else if (quadrant == 2.0 && gl_PointCoord.y >= 0.5 && gl_PointCoord.x >= 0.5){',

                            'rad = radians(angle);',
                            'if (totalAngles == 180.0 && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.y)) / (- 2.0 * ( 0.5 - gl_PointCoord.x))){',
                                'gl_FragColor = color;',
                                'found = true;',
                            '}',
                            'else if (tan(rad + prevAngle) >= (- 2.0 * ( 0.5 - gl_PointCoord.y)) / (- 2.0 * ( 0.5 - gl_PointCoord.x)) && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.y)) / (- 2.0 * ( 0.5 - gl_PointCoord.x)) ){',
                                    'gl_FragColor = color;',
                                    'found = true;',
                            '}',
                    '}',

                    'else if (quadrant == 3.0 && gl_PointCoord.y >= 0.5 && gl_PointCoord.x <= 0.5){',

                            'rad = radians(angle);',
                            'if (totalAngles == 270.0 && tan(prevAngle) <= (- 2.0 * (gl_PointCoord.x - 0.5)) / (- 2.0 * ( 0.5 - gl_PointCoord.y))){',
                                'gl_FragColor = color;',
                                'found = true;',
                            '}',
                            'else if (tan((rad + prevAngle)) >= (- 2.0 * (gl_PointCoord.x - 0.5)) / (- 2.0 * ( 0.5 - gl_PointCoord.y)) && tan((prevAngle)) <= (- 2.0 * (gl_PointCoord.x - 0.5)) / (- 2.0 * ( 0.5 - gl_PointCoord.y)) ){',
                                    'gl_FragColor = color;',
                                    'found = true;',
                            '}',
                   '}',

                    'if (quadrant == 4.0 && gl_PointCoord.y <= 0.5 && gl_PointCoord.x <= 0.5){',
                            'rad = radians(angle);',
                            'if (angle != 0.0 && totalAngles == 360.0 && (tan(prevAngle) <= (gl_PointCoord.y - 0.5) / (gl_PointCoord.x - 0.5))){',
                                'gl_FragColor = color;',
                                'found = true;',
                            '}',
                            'else if ((tan(rad + prevAngle) >= (gl_PointCoord.y - 0.5) / (gl_PointCoord.x - 0.5)) && (tan(prevAngle) <= (gl_PointCoord.y - 0.5) / (gl_PointCoord.x - 0.5))){',
                                    'gl_FragColor = color;',
                                    'found = true;',
                            '}',

                    '}',

                    

                'if (found == false){',
                    'if ((gl_PointCoord.x - 0.5) * (gl_PointCoord.x - 0.5) + (gl_PointCoord.y - 0.5) * (gl_PointCoord.y - 0.5) < 0.25){',
                        'gl_FragColor = vec4(0);',
                    '}',
                    'else{',
                        'gl_FragColor = vec4(0);',
                    '}',
                '}',
                 'else if ((gl_PointCoord.x - 0.5) * (gl_PointCoord.x - 0.5) + (gl_PointCoord.y - 0.5) * (gl_PointCoord.y - 0.5) > 0.25){',
                    ' gl_FragColor = vec4(0);',
                 '}',
                    
                '}'].join('\n');

                nodesVS = [
                'attribute vec2 a_vertexPos;',
                // Pack clor and size into vector. First elemnt is color, second - size.
                // Since it's floating point we can only use 24 bit to pack colors...
                // thus alpha channel is dropped, and is always assumed to be 1.
                'attribute float a_quadrant;',
                'attribute vec3 a_anglesAndColor;',
                'attribute float a_totalAngles;',
                'attribute float a_size;',

                'uniform vec2 u_screenSize;',
                'uniform mat4 u_transform;',

                'varying vec4 color;',
                'varying float angle;',
                'varying float prevAngle;',
                'varying float totalAngles;',

                'varying float quadrant;',

                'vec4 unpackColor(float c){',
                    '   vec4 colorToUse;',
                     '   colorToUse.b = mod(c, 256.0); c = floor(c/256.0);',
                     '   colorToUse.g = mod(c, 256.0); c = floor(c/256.0);',
                     '   colorToUse.r = mod(c, 256.0); c = floor(c/256.0); colorToUse /= 255.0;',
                     '   colorToUse.a = 1.0;',
                     
                     '  return colorToUse;',
                 '}',

                'void main(void) {',
                '   gl_Position = u_transform * vec4(a_vertexPos/u_screenSize, 0, 1);',
                '   gl_PointSize = a_size * u_transform[0][0];',
                
                '   angle = a_anglesAndColor[0];',
                '   color = unpackColor(a_anglesAndColor[1]);',
                '   prevAngle = a_anglesAndColor[2];',
                '   totalAngles = a_totalAngles;',
                //'   color4 = unpackColor(a_fourthColor);',
                 //'   angle = a_angle;',
                 //'   prevAngle = radians(a_customAttributes[3]);',
                '   quadrant = a_quadrant;',
                '}'].join('\n');

            var program,
                gl,
                buffer,
                locations,
                utils,
                // allNodes1 = [];
                // allNodes2 = [];
                // allNodes3 = [];
                // allNodes4 = [];
                isfirst = true, 
                allNodes1 = [],
                allNodes2 = [],
                allNodes3 = [],
                allNodes4 = [],
                nodes1 = new Float32Array(7),
                nodes2 = new Float32Array(7),
                nodes3 = new Float32Array(7),
                nodes4 = new Float32Array(7),
                nodesCount = 0,
                canvasWidth, canvasHeight, transform,
                isCanvasDirty;

            return {
                /**
                 * Called by webgl renderer to load the shader into gl context.
                 */
                load : function (glContext) {
                    gl = glContext;
                    webglUtils = Viva.Graph.webgl(glContext);

                    program = webglUtils.createProgram(nodesVS, nodesFS);
                    gl.useProgram(program);
                    locations = webglUtils.getLocations(program, ['a_vertexPos', 'a_quadrant', 'a_anglesAndColor', 'a_totalAngles', 'a_size', 'u_screenSize', 'u_transform']);

                    gl.enableVertexAttribArray(locations.vertexPos);
                    gl.enableVertexAttribArray(locations.quadrant);
                    gl.enableVertexAttribArray(locations.anglesAndColor);
                    gl.enableVertexAttribArray(locations.totalAngles);
                    gl.enableVertexAttribArray(locations.size);



                    buffer = gl.createBuffer();
                },

                /**
                 * Called by webgl renderer to update node position in the buffer array
                 *
                 * @param nodeUI - data model for the rendered node (WebGLCircle in this case)
                 * @param pos - {x, y} coordinates of the node.
                 */
                position : function (nodeUI, pos) {
                    var idx = nodeUI.id;
                    //var prevAngles = [0, 25];
                    var currentTotal = 0;
                    var prevAngles = 0.0;

                    allNodes1[idx] = [];
                    allNodes2[idx] = [];
                    allNodes3[idx] = [];
                    allNodes4[idx] = [];

                    // var numberOfAngles = nodeUI.data[0].length;
                    // var angleToUse = nodeUI.data[0];

                    // var colors = nodeUI.colorIndexes[0];

                    //console.log(nodeUI.data.length);

                    for (x=0; x < nodeUI.data.length;x++){

                        var numberOfAngles = nodeUI.data[x].length;
                        var angleToUse = nodeUI.data[x];

                        var colors = nodeUI.colorIndexes[x];

                        for (i = 0; i < numberOfAngles; i++){
                            var interNode = new Float32Array(8);
                            
                            currentTotal += angleToUse[i];

                            if (i==0) prevAngles = 0;
                            else prevAngles += angleToUse[i-1];
                            
                            interNode[0] = pos.x;
                            interNode[1] = -pos.y;
                            interNode[2] = x+1; //quadrant
                            interNode[3] = angleToUse[i]; //angle
                            interNode[4] = colors[i]; //color
                            interNode[5] = Math.radians(prevAngles); //prevAngle
                            interNode[6] = currentTotal; //total Angles
                            interNode[7] = nodeUI.size; //total Angles

                            //for (j=0;j<nodes1.length;j++) interNode[j] = nodes1[j];
                            if (x == 0) allNodes1[idx].push(interNode);
                            else if (x == 1) allNodes2[idx].push(interNode);
                            else if (x == 2) allNodes3[idx].push(interNode);
                            else if (x == 3) allNodes4[idx].push(interNode);

                            // allNodes1[idx].push(interNode);

                        }

                    }

                    // var numberOfAngles = nodeUI.data[1].length;
                    // var angleToUse = nodeUI.data[1];

                    // var colors = nodeUI.colorIndexes[1];

                    // for (i = 0; i < numberOfAngles; i++){
                    //     var interNode = new Float32Array(7);
                        
                    //     currentTotal += angleToUse[i];

                    //     if (i==0) prevAngles = 0;
                    //     else prevAngles += angleToUse[i-1];
                        
                    //     nodes2[0] = pos.x;
                    //     nodes2[1] = -pos.y;
                    //     nodes2[2] = 2; //quadrant
                    //     nodes2[3] = angleToUse[i]; //angle
                    //     nodes2[4] = colors[i]; //color
                    //     nodes2[5] = Math.radians(prevAngles); //prevAngle
                    //     nodes2[6] = currentTotal; //total Angles

                    //     for (j=0;j<nodes2.length;j++) interNode[j] = nodes2[j];

                    //     allNodes2[idx].push(interNode);

                    // }

                    // var numberOfAngles = nodeUI.data[2].length;
                    // var angleToUse = nodeUI.data[2];

                    // var colors = nodeUI.colorIndexes[2];

                    // for (i = 0; i < numberOfAngles; i++){
                    //     var interNode = new Float32Array(7);
                        
                    //     currentTotal += angleToUse[i];

                    //     if (i==0) prevAngles = 0;
                    //     else prevAngles += angleToUse[i-1];
                        
                    //     nodes3[0] = pos.x;
                    //     nodes3[1] = -pos.y;
                    //     nodes3[2] = 3; //quadrant
                    //     nodes3[3] = angleToUse[i]; //angle
                    //     nodes3[4] = colors[i]; //color
                    //     nodes3[5] = Math.radians(prevAngles); //prevAngle
                    //     nodes3[6] = currentTotal; //total Angles

                    //     for (j=0;j<nodes3.length;j++) interNode[j] = nodes3[j];

                    //     allNodes3[idx].push(interNode);

                    // }

                    // var numberOfAngles = nodeUI.data[3].length;
                    // var angleToUse = nodeUI.data[3];

                    // var colors = nodeUI.colorIndexes[3];

                    // for (i = 0; i < numberOfAngles; i++){
                    //     var interNode = new Float32Array(7);
                        
                    //     currentTotal += angleToUse[i];

                    //     if (i==0) prevAngles = 0;
                    //     else prevAngles += angleToUse[i-1];
                        
                    //     nodes4[0] = pos.x;
                    //     nodes4[1] = -pos.y;
                    //     nodes4[2] = 4; //quadrant
                    //     nodes4[3] = angleToUse[i]; //angle
                    //     nodes4[4] = colors[i]; //color
                    //     nodes4[5] = Math.radians(prevAngles); //prevAngle
                    //     nodes4[6] = currentTotal; //total Angles

                    //     for (j=0;j<nodes1.length;j++) interNode[j] = nodes4[j];

                    //     allNodes4[idx].push(interNode);

                    // }
                },

                /**
                 * Request from webgl renderer to actually draw our stuff into the
                 * gl context. This is the core of our shader.
                 */
                render : function() {
                    gl.useProgram(program);
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

                    gl.vertexAttribPointer(locations.vertexPos, 2, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 0);
                    gl.vertexAttribPointer(locations.quadrant, 1, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 2*4);
                    gl.vertexAttribPointer(locations.anglesAndColor, 3, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 3*4);
                    gl.vertexAttribPointer(locations.totalAngles, 1, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 6*4);
                    gl.vertexAttribPointer(locations.size, 1, gl.FLOAT, false, (ATTRIBUTES_PER_PRIMITIVE)* Float32Array.BYTES_PER_ELEMENT, 7*4);

                    if (isCanvasDirty) {
                        isCanvasDirty = false;
                        gl.uniformMatrix4fv(locations.transform, false, transform);
                        gl.uniform2f(locations.screenSize, canvasWidth, canvasHeight);
                        //gl.uniform1f(locations.size, 24.0);
                    }

                    for (i=0; i<allNodes1.length;i++){

                        for(j=0;j<allNodes1[i].length;j++){
                            
                            gl.bufferData(gl.ARRAY_BUFFER, allNodes1[i][j], gl.DYNAMIC_DRAW);
                            gl.drawArrays(gl.POINTS, 0, 1);
                        }
                    }

                    for (i=0; i<allNodes2.length;i++){

                        for(j=0;j<allNodes2[i].length;j++){
                            
                            gl.bufferData(gl.ARRAY_BUFFER, allNodes2[i][j], gl.DYNAMIC_DRAW);
                            gl.drawArrays(gl.POINTS, 0, 1);
                        }
                    }
                    
                    for (i=0; i<allNodes3.length;i++){

                        for(j=0;j<allNodes3[i].length;j++){
                            
                            gl.bufferData(gl.ARRAY_BUFFER, allNodes3[i][j], gl.DYNAMIC_DRAW);
                            gl.drawArrays(gl.POINTS, 0, 1);
                        }
                    }

                    for (i=0; i<allNodes4.length;i++){

                        for(j=0;j<allNodes4[i].length;j++){
                            
                            gl.bufferData(gl.ARRAY_BUFFER, allNodes4[i][j], gl.DYNAMIC_DRAW);
                            gl.drawArrays(gl.POINTS, 0, 1);
                        }
                    }
                },

                /**
                 * Called by webgl renderer when user scales/pans the canvas with nodes.
                 */
                updateTransform : function (newTransform) {
                    transform = newTransform;
                    isCanvasDirty = true;
                },

                /**
                 * Called by webgl renderer when user resizes the canvas with nodes.
                 */
                updateSize : function (newCanvasWidth, newCanvasHeight) {
                    canvasWidth = newCanvasWidth;
                    canvasHeight = newCanvasHeight;
                    isCanvasDirty = true;
                },

                /**
                 * Called by webgl renderer to notify us that the new node was created in the graph
                 */
                createNode : function (node) {
                    nodesCount += 1;
                    allNodes1 = new Array(nodesCount);
                    allNodes2 = new Array(nodesCount);
                    allNodes3 = new Array(nodesCount);
                    allNodes4 = new Array(nodesCount);
                },

                /**
                 * Called by webgl renderer to notify us that the node was removed from the graph
                 */
                removeNode : function (node) {
                    if (nodesCount > 0) { nodesCount -=1; }

                    if (node.id < nodesCount && nodesCount > 0) {
                        // we do not really delete anything from the buffer.
                        // Instead we swap deleted node with the "last" node in the
                        // buffer and decrease marker of the "last" node. Gives nice O(1)
                        // performance, but make code slightly harder than it could be:
                        webglUtils.copyArrayPart(nodes1, node.id*ATTRIBUTES_PER_PRIMITIVE, nodesCount*ATTRIBUTES_PER_PRIMITIVE, ATTRIBUTES_PER_PRIMITIVE);

                    }
                },

                /**
                 * This method is called by webgl renderer when it changes parts of its
                 * buffers. We don't use it here, but it's needed by API (see the comment
                 * in the removeNode() method)
                 */
                replaceProperties : function(replacedNode, newNode) {},
            };
        }