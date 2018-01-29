// Next comes the hard part - implementation of API for custom shader
// program, used by webgl renderer:
function buildSimpleCircleNodeShader() {
    // For each primitive we need 4 attributes: x, y, color and size.
    var ATTRIBUTES_PER_PRIMITIVE = 4,
        nodesFS = [

        '#ifdef GL_OES_standard_derivatives',
        '#extension GL_OES_standard_derivatives : enable',
        '#endif',

        'precision highp float;',
        'varying vec4 color;',

        'void main(void) {',

            'float r = 0.5, delta = 0.0, alpha = 1.0;',

            'vec2 cxy = 2.0 * gl_PointCoord - 1.0;',
            'r = dot(cxy, cxy);',

            '#ifdef GL_OES_standard_derivatives',
                'delta = fwidth(r);',
                'alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);',
            '#endif',

            '   if ((gl_PointCoord.x - 0.5) * (gl_PointCoord.x - 0.5) + (gl_PointCoord.y - 0.5) * (gl_PointCoord.y - 0.5) < 0.25) {',
            '     gl_FragColor = color * alpha;',
            '   } else {',
            '     gl_FragColor = vec4(0);',
            '   }',
        '}'].join('\n'),
        nodesVS = [
        'attribute vec2 a_vertexPos;',
        // Pack clor and size into vector. First elemnt is color, second - size.
        // Since it's floating point we can only use 24 bit to pack colors...
        // thus alpha channel is dropped, and is always assumed to be 1.
        'attribute vec2 a_customAttributes;',
        'uniform vec2 u_screenSize;',
        'uniform mat4 u_transform;',
        'varying vec4 color;',
        'void main(void) {',
        '   gl_Position = u_transform * vec4(a_vertexPos/u_screenSize, 0, 1);',
        '   gl_PointSize = a_customAttributes[1] * u_transform[0][0];',
        '   float c = a_customAttributes[0];',
        '   color.b = mod(c, 256.0); c = floor(c/256.0);',
        '   color.g = mod(c, 256.0); c = floor(c/256.0);',
        '   color.r = mod(c, 256.0); c = floor(c/256.0); color /= 255.0;',
        '   color.a = 1.0;',
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
        load : function (glContext, Nodescount) {

            console.log(Nodescount);
            if (Nodescount){
                nodesCount = Nodescount;
                for (i = 0; i<Nodescount;i++){
                    nodes = webglUtils.extendArray(nodes, nodesCount, ATTRIBUTES_PER_PRIMITIVE); //increase buffer for outer ring
                    nodesCount += 2;
                }
            }
            
            isCanvasDirty = true;
            gl = glContext;
            gl.getExtension("OES_standard_derivatives");
            //gl.enable(gl.DEPTH_TEST);

            webglUtils = Viva.Graph.webgl(glContext);
            program = webglUtils.createProgram(nodesVS, nodesFS);
            gl.useProgram(program);
            locations = webglUtils.getLocations(program, ['a_vertexPos', 'a_customAttributes', 'u_screenSize', 'u_transform']);
            gl.disableVertexAttribArray(locations.vertexPos);
            gl.disableVertexAttribArray(locations.customAttributes);
            gl.enableVertexAttribArray(locations.vertexPos);
            gl.enableVertexAttribArray(locations.customAttributes);
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

            console.log(nodeUI);
            if(nodeUI.hasOwnProperty('outerdata')){

                nodes[idx * ATTRIBUTES_PER_PRIMITIVE*2] = pos.x;
                nodes[idx * ATTRIBUTES_PER_PRIMITIVE*2 + 1] = -pos.y;
                try{
                    nodes[idx * ATTRIBUTES_PER_PRIMITIVE*2 + 2] = nodeUI.outercolorIndexes[0];
                }
                catch(err){
                    nodes[idx * ATTRIBUTES_PER_PRIMITIVE*2 + 2] = 0xa5a7b5;
                }
                nodes[idx * ATTRIBUTES_PER_PRIMITIVE*2 + 3] = nodeUI.size + 10;

            }

            nodes[idx * ATTRIBUTES_PER_PRIMITIVE*2 + 4] = pos.x;
            nodes[idx * ATTRIBUTES_PER_PRIMITIVE*2 + 5] = -pos.y;
            nodes[idx * ATTRIBUTES_PER_PRIMITIVE*2 + 6] = nodeUI.colorIndexes[0];
            nodes[idx * ATTRIBUTES_PER_PRIMITIVE*2 + 7] = nodeUI.size;
        },
        /**
         * Request from webgl renderer to actually draw our stuff into the
         * gl context. This is the core of our shader.
         */
        render : function() {
            //console.log('AQUI');
            gl.useProgram(program);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            //console.log(nodes);
            gl.bufferData(gl.ARRAY_BUFFER, nodes, gl.DYNAMIC_DRAW);
            if (isCanvasDirty) {
                isCanvasDirty = false;
                gl.uniformMatrix4fv(locations.transform, false, transform);
                gl.uniform2f(locations.screenSize, canvasWidth, canvasHeight);
            }
            gl.vertexAttribPointer(locations.vertexPos, 2, gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, 0);
            gl.vertexAttribPointer(locations.customAttributes, 2, gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, 2 * 4);
            gl.drawArrays(gl.POINTS, 0, nodesCount);

            //gl.deleteBuffer(buffer);
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
            nodesCount += 2;
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