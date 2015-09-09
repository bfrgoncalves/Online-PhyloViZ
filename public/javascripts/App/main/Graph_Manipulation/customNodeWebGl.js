
function WebglCircle(size, color, data, colorIndexes, rawData) {
            this.size = size;
            this.color = color;
            this.data = getDataPercentage(data);
            this.rawData = rawData;
            this.colorIndexes = colorIndexes;

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
    //console.log(maxSize);
    //console.log(dataInPercentage);
    //console.log(colorIndexes);


    maxSize = dataInPercentage.length;
    newDataArray = [];
    newIndexArray = [];
    remaining = 0;
    totalAngles = 0;
    prevTotalAngles = 0;
    countData = 0;

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

        while(totalAngles +  dataInPercentage[countData] <= 360){
            totalAngles += dataInPercentage[countData];
            newDataArray.push(dataInPercentage[countData]);
            newIndexArray.push(colorIndexes[countData]);
            countData++;
        }

        return [newDataArray, newIndexArray];
    }

}




function buildCircleNodeShader(angleNumbers, totalTypes) {
            // For each primitive we need 4 attributes: x, y, color and size.
            var ATTRIBUTES_PER_PRIMITIVE = 4 + (angleNumbers * 2), //angle numbers + color Indexes
                                                                   //totalTypes are passed directly to the fragment shader


            numberOfAngles = angleNumbers,
            attributesToVertex = '',
            anglesToArray = '',
            remainingAngles = numberOfAngles,
            countvec4 = 0,
            currentIndexA = 0,
            currentIndexC = 0,
            elementsPerVec = [];

            var first = true;

            //console.log(ATTRIBUTES_PER_PRIMITIVE);

            var firstTime = 0;

            while(remainingAngles / 2 >= 1 || remainingAngles > 0){

                countvec4 += 1;

                var vecIndexes = 0;
                var attrTag = '';

                if (remainingAngles >= 2){
                    attrTag = 'vec4';
                    vecIndexes = 4;
                    elementsPerVec.push(vecIndexes);
                } 
                else if(remainingAngles == 1){
                    attrTag = 'vec2';
                    vecIndexes = 2;
                    elementsPerVec.push(vecIndexes);
                }
                // else{
                //     attrTag += String(remainingAngles);
                //     vecIndexes = remainingAngles;
                // } 

                attributesToVertex += 'attribute '+ attrTag +' a_anglesAndColors' + String(countvec4) + ';\n';
                //attributesToVertex += 'attribute '+ attrTag +' a_colorIndex' + String(countvec4) + ';\n';

                var isAngle = true;

                for (i = 1; i <= vecIndexes; i++){
                    
                    if (vecIndexes == 1){
                        anglesToArray += '  angles[' + String(currentIndexA) + '] = a_anglesAndColors' + String(countvec4) + ';\n';
                        anglesToArray += '  colorIndex[' + String(currentIndexC) + '] = a_colorIndex' + String(countvec4) + ';\n';
                    }
                    else{
                        if (isAngle){
                            anglesToArray += 'angles[' + String(currentIndexA) + '] = a_anglesAndColors' + String(countvec4) + '[' + String(i-1) + '];\n';
                            currentIndexA += 1;
                            isAngle = false;
                        } 
                        else{
                            anglesToArray += 'colorIndex[' + String(currentIndexC) + '] = a_anglesAndColors' + String(countvec4) + '[' + String(i-1) + '];\n';
                            currentIndexC += 1;
                            isAngle = true;
                        }
                    }
                }

                remainingAngles = remainingAngles - 2;
                
            }

            console.log(countvec4);



            attributesToVertex += 'const int numberOfAngles = ' +  String(numberOfAngles) + ';\n';


            // for (i = 0; i<numberOfAngles; i++){

            //     anglesToArray += '  angles[' + String(i) + '] = a_angle' + String(i+1) + ';\n';
            //     anglesToArray += '  colorIndex[' + String(i) + '] = a_colorIndex' + String(i+1) + ';\n';
            // }


            var nodesVS = [
                'precision mediump float;',
                'attribute vec2 a_vertexPos;',
                // Pack clor and size into vector. First elemnt is color, second - size.
                // Since it's floating point we can only use 24 bit to pack colors...
                // thus alpha channel is dropped, and is always assumed to be 1.
                'attribute vec2 a_customAttributes;',
                attributesToVertex,
                'uniform vec2 u_screenSize;',
                'uniform mat4 u_transform;',
                'varying float angles['+String(numberOfAngles)+'];',
                'varying float colorIndex['+String(numberOfAngles)+'];',

                'void main(void) {',
                '   gl_Position = u_transform * vec4(a_vertexPos/u_screenSize, 0, 1);',
                '   gl_PointSize = a_customAttributes[1] * u_transform[0][0];',
                    anglesToArray,
                '}'].join('\n'),

                nodesFS = [
                'precision mediump float;',
                'const int numberOfAngles = ' + String(numberOfAngles) + ';',
                'varying float angles[numberOfAngles];',
                'varying float colorIndex[numberOfAngles];',

                'vec4 currentColor = vec4(1,0,0,1);',
                //'varying vec2 vTexCoord;', //get the passing value from the vertex shader

                'vec4 getColor(float col){',
                    'vec4 colorToUse;',

                    'float c = col;',
                 '   colorToUse.b = mod(c, 256.0); c = floor(c/256.0);',
                 '   colorToUse.g = mod(c, 256.0); c = floor(c/256.0);',
                 '   colorToUse.r = mod(c, 256.0); c = floor(c/256.0); colorToUse /= 255.0;',
                 '   colorToUse.a = 1.0;',

                 'return colorToUse;',

                '}',
                
                'void main(){',

                    'float prevAngle = radians(0.0);',
                    'float radQuad = radians(90.0);',
                    'float totalAngles = 0.0;',

                    'bool found = false;',
                    'bool hasRest = false;',
                    'float rad = 0.0;',
                    'float AngleToUse = 0.0;',
                    'float rest;',
                    'int prevAngleNumber = 0;',
                    'float prevTotal = 0.0;',

                    'if (gl_PointCoord.y <= 0.5 && gl_PointCoord.x <= 0.5){',

                        'prevAngle = radians(0.0);',

                        'for(int i = 0; i<numberOfAngles;i++){',
                            'totalAngles = totalAngles + angles[i];',
                            'if (totalAngles <= 90.0){',
                                'AngleToUse = angles[i];',
                            '}',
                            'else{',
                                'continue;',
                            '}',
                            'rad = radians(AngleToUse);',
                            'if (totalAngles == 90.0 && (tan(prevAngle) <= (gl_PointCoord.y - 0.5) / (gl_PointCoord.x - 0.5))){',
                                'float ind = float(colorIndex[i]);',
                                'vec4 colorToUse = getColor(ind);',
                                'gl_FragColor = colorToUse;',
                                'found = true;',
                            '}',
                            'else if ((tan(rad + prevAngle) >= (gl_PointCoord.y - 0.5) / (gl_PointCoord.x - 0.5)) && (tan(prevAngle) <= (gl_PointCoord.y - 0.5) / (gl_PointCoord.x - 0.5))){',
                                    'float ind = float(colorIndex[i]);',
                                    'vec4 colorToUse = getColor(ind);',
                                    'gl_FragColor = colorToUse;',
                                    'found = true;',
                            '}',
                            'prevAngle = prevAngle + rad;',
                        '}',

                    '}',

                    'else if (gl_PointCoord.y < 0.5 && gl_PointCoord.x > 0.5){',

                        'prevAngle = radians(0.0);',

                        'for(int i = 0; i<numberOfAngles;i++){',
                            'totalAngles = totalAngles + angles[i];',
                            'if (totalAngles > 90.0 && totalAngles <= 180.0){',
                                'AngleToUse = angles[i];',
                            '}',
                            'else{',
                                'continue;',
                            '}',
                            'rad = radians(AngleToUse);',
                            'if (totalAngles == 180.0 && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.x)) / (- 2.0 * (gl_PointCoord.y - 0.5))){',
                                'float ind = float(colorIndex[i]);',
                                'vec4 colorToUse = getColor(ind);',
                                'gl_FragColor = colorToUse;',
                                'found = true;',
                            '}',
                            'else if (tan(rad + prevAngle) >= (- 2.0 * ( 0.5 - gl_PointCoord.x)) / (- 2.0 * (gl_PointCoord.y - 0.5)) && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.x)) / (- 2.0 * (gl_PointCoord.y - 0.5)) ){',
                                    'float ind = float(colorIndex[i]);',
                                    'vec4 colorToUse = getColor(ind);',
                                    'gl_FragColor = colorToUse;',
                                    'found = true;',
                            '}',
                            'prevAngle = prevAngle + rad;',
                        '}',
                    '}',

                   'else if (gl_PointCoord.y >= 0.5 && gl_PointCoord.x >= 0.5){',

                        'prevAngle = radians(0.0);',

                        'for(int i = 0; i<numberOfAngles;i++){',
                            'totalAngles = totalAngles + angles[i];',
                            'if (totalAngles > 180.0 && totalAngles <= 270.0){',
                                'AngleToUse = angles[i];',
                            '}',
                            'else {',
                                'continue;',
                            '}',
                            'rad = radians(AngleToUse);',
                            'if (totalAngles == 270.0 && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.y)) / (- 2.0 * ( 0.5 - gl_PointCoord.x))){',
                                'float ind = float(colorIndex[i]);',
                                'vec4 colorToUse = getColor(ind);',
                                'gl_FragColor = colorToUse;',
                                'found = true;',
                            '}',
                            'else if (tan(rad + prevAngle) >= (- 2.0 * ( 0.5 - gl_PointCoord.y)) / (- 2.0 * ( 0.5 - gl_PointCoord.x)) && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.y)) / (- 2.0 * ( 0.5 - gl_PointCoord.x)) ){',
                                    'float ind = float(colorIndex[i]);',
                                    'vec4 colorToUse = getColor(ind);',
                                    'gl_FragColor = colorToUse;',
                                    'found = true;',
                            '}',
                            'prevAngle = prevAngle + rad;',
                        '}',
                    '}',

                    'else if (gl_PointCoord.y >= 0.5 && gl_PointCoord.x <= 0.5){',

                        'prevAngle = radians(0.0);',

                        'for(int i = 0; i<numberOfAngles;i++){',

                            'totalAngles = totalAngles + angles[i];',
                            'if (totalAngles > 270.0 && totalAngles <= 360.0){',
                                'AngleToUse = angles[i];',
                            '}',
                            'else{',
                                'continue;',
                            '}',
                            'rad = radians(AngleToUse);',
                            'if (AngleToUse != 0.0 && totalAngles == 360.0 && tan(prevAngle) <= (- 2.0 * (gl_PointCoord.x - 0.5)) / (- 2.0 * ( 0.5 - gl_PointCoord.y))){',
                                'float ind = float(colorIndex[i]);',
                                'vec4 colorToUse = getColor(ind);',
                                'gl_FragColor = colorToUse;',
                                'found = true;',
                            '}',
                            'else if(AngleToUse == 0.0){',
                                'found = true;',
                                'continue;',
                            '}',
                            'else if (tan((rad + prevAngle)) >= (- 2.0 * (gl_PointCoord.x - 0.5)) / (- 2.0 * ( 0.5 - gl_PointCoord.y)) && tan((prevAngle)) <= (- 2.0 * (gl_PointCoord.x - 0.5)) / (- 2.0 * ( 0.5 - gl_PointCoord.y)) ){',
                                    'float ind = float(colorIndex[i]);',
                                    'vec4 colorToUse = getColor(ind);',
                                    'gl_FragColor = colorToUse;',
                                    'found = true;',
                            '}',
                            'prevAngle = prevAngle + rad;',
                        '}',
                   '}',

                    

                'if (found == false){',
                    'if ((gl_PointCoord.x - 0.5) * (gl_PointCoord.x - 0.5) + (gl_PointCoord.y - 0.5) * (gl_PointCoord.y - 0.5) < 0.25){',
                        'gl_FragColor = vec4(0, 0, 1, 1);',
                    '}',
                    'else{',
                        'gl_FragColor = vec4(0);',
                    '}',
                '}',
                 'else if ((gl_PointCoord.x - 0.5) * (gl_PointCoord.x - 0.5) + (gl_PointCoord.y - 0.5) * (gl_PointCoord.y - 0.5) > 0.25){',
                    ' gl_FragColor = vec4(0);',
                 '}',
                    
                '}'].join('\n');
                

            var program,
                gl,
                buffer,
                locations,
                utils,
                nodes = new Float32Array(64),
                nodesCount = 0,
                canvasWidth, canvasHeight, transform,
                isCanvasDirty;


            return {
                /**
                 * Called by webgl renderer to load the shader into gl context.
                 */
                load : function (glContext) {
                    
                    gl = glContext;

                    //if (prevNodeProgram != null) gl.deleteProgram(prevNodeProgram);

                    webglUtils = Viva.Graph.webgl(glContext);
                    program = webglUtils.createProgram(nodesVS, nodesFS);
                    //prevNodeProgram = program;

                    locations = webglUtils.getLocations(program, ['a_vertexPos', 'a_customAttributes', 'u_screenSize', 'u_transform']);

                    gl.enableVertexAttribArray(locations.vertexPos);
                    gl.enableVertexAttribArray(locations.customAttributes);

                    var prevNodeIndex = 0;

                    for (o = 1; o<= countvec4; o++){
                         gl.enableVertexAttribArray(locations.customAttributes + o);
                         // gl.enableVertexAttribArray(locations.customAttributes + i + 1 + prevNodeIndex);
                         // prevNodeIndex += 1;
                    }



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
                    //console.log(nodeUI.data);
                    var prevNodeIndex = 0;

                    nodes[idx * ATTRIBUTES_PER_PRIMITIVE] = pos.x;
                    nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 1] = pos.y;
                    nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 2] = nodeUI.color;
                    nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 3] = nodeUI.size;
                    var countTimes = 0;

                    for (x = 1; x<= numberOfAngles; x++){
                        nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 3 + x + prevNodeIndex] = nodeUI.data[x-1];
                        nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 3 + x + 1 + prevNodeIndex] = nodeUI.colorIndexes[x-1];
                        prevNodeIndex += 1;
                    }
                    //console.log(nodeUI.colorIndexes);
                    // if(firstTime<1) console.log(nodes);
                    //  firstTime += 1;


                },

                /**
                 * Request from webgl renderer to actually draw our stuff into the
                 * gl context. This is the core of our shader.
                 */
                render : function() {
                    gl.useProgram(program);
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, nodes, gl.DYNAMIC_DRAW);

                    if (first){
                        console.log(nodes);
                        first = false;
                    }

                    if (isCanvasDirty) {
                        isCanvasDirty = false;
                        gl.uniformMatrix4fv(locations.transform, false, transform);
                        gl.uniform2f(locations.screenSize, canvasWidth, canvasHeight);
                    }



                    //Since you are using GL_FLOAT as type, which has a size of 4 bytes, the offset is only allowed to be a multiple of 4.
                    gl.vertexAttribPointer(locations.vertexPos, 2, gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, 0);
                    gl.vertexAttribPointer(locations.customAttributes, 2, gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, 2 * 4);

                    var prevNodeIndex = 0;


                    for (i = 1; i<= countvec4; i++){
                         gl.vertexAttribPointer(locations.customAttributes + i, elementsPerVec[i-1], gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, (4 + prevNodeIndex) * 4);
                         //gl.vertexAttribPointer(locations.customAttributes + i + 1 + prevNodeIndex, 1, gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, (4+i-1 + 1 + prevNodeIndex) * 4);
                         prevNodeIndex += elementsPerVec[i-1];
                     }
                    
                    //gl.vertexAttribPointer(locations.dados, 3, gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, 5 * 4);
                    gl.finish();
                    gl.drawArrays(gl.POINTS, 0, nodesCount);
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
                    nodes = webglUtils.extendArray(nodes, nodesCount, ATTRIBUTES_PER_PRIMITIVE);
                    nodesCount += 1;
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
                        webglUtils.copyArrayPart(nodes, node.id*ATTRIBUTES_PER_PRIMITIVE, nodesCount*ATTRIBUTES_PER_PRIMITIVE, ATTRIBUTES_PER_PRIMITIVE);
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