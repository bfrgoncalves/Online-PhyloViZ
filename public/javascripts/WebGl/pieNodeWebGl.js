
function WebglCircle(size, color, data) {
            this.size = size;
            this.color = color;
            this.data = [];
            var total = 0;
            
            $.each(data,function() {
                 total += this;
             });

             for (i = 0; i<data.length; i++){
                 this.data.push((data[i]/total) * 360);

             }
}


function buildCircleNodeShader() {
            // For each primitive we need 4 attributes: x, y, color and size.
            var ATTRIBUTES_PER_PRIMITIVE = 4,


            nodesVS = [
                'attribute vec2 a_vertexPos;',
                // Pack clor and size into vector. First elemnt is color, second - size.
                // Since it's floating point we can only use 24 bit to pack colors...
                // thus alpha channel is dropped, and is always assumed to be 1.
                'attribute vec2 a_customAttributes;',
                //'attribute vec3 a_dados;',
                'uniform vec2 u_screenSize;',
                'uniform mat4 u_transform;',
                'varying vec4 color;',

                'void main(void) {',
                '   gl_Position = u_transform * vec4(a_vertexPos/u_screenSize, 0, 1);',
                '   gl_PointSize = a_customAttributes[1] * u_transform[0][0];',
                    'color = vec4(0, 0, 1, 1);',
                '}'].join('\n'),

                nodesFS = [
                'precision mediump float;',
                'varying vec4 color;',

                'precision mediump float;',
				//'varying vec2 vTexCoord;', //get the passing value from the vertex shader
				
                'void main(){',

					'vec4 angles = vec4(110.0, 110.0, 110.0, 30.0);',
					'float prevAngle = radians(0.0);',
					'float radQuad = radians(90.0);',
					'float totalAngles = 0.0;',

					'bool found = false;',
					'bool hasRest = false;',
					'float rad = 0.0;',
					'float AngleToUse = 0.0;',
					'float rest;',

					'if (gl_PointCoord.y < 0.5 && gl_PointCoord.x < 0.5){',
						'for (int i = 0; i<4;i++){',
							'totalAngles = totalAngles + angles[i];',
							'if (totalAngles > 90.0){',
								'rest = totalAngles - 90.0;',
								'AngleToUse = angles[i] - rest;',
								'hasRest = true;',
							'}',
							'else{',
								'AngleToUse = angles[i];',
							'}',
							'rad = radians(AngleToUse);',
							'if ((tan(rad + prevAngle) >= (gl_PointCoord.y - 0.5) / (gl_PointCoord.x - 0.5)) && (tan(prevAngle) <= (gl_PointCoord.y - 0.5) / (gl_PointCoord.x - 0.5))){',
								'float color = float(i) * 0.3;',
                                'gl_FragColor = vec4(color, 0, 0, 1);',
                                'found = true;',
							'}',
							'prevAngle = prevAngle + rad;',
							'if (totalAngles > 90.0){',
								'break;',
							'}',
						'}',

					'}',

					 'else if (gl_PointCoord.y <= 0.5 && gl_PointCoord.x >= 0.5){',
					 	'for (int i = 0; i<4;i++){',
					 		'totalAngles = totalAngles + angles[i];',
					 		'if (totalAngles >= 90.0){',
					 			'if (totalAngles - angles[i] < 90.0){',
					 				'AngleToUse = totalAngles - 90.0;',
					 			'}',
					 			  'else if (totalAngles > 180.0){',
					 			  	'rest = totalAngles - 180.0;',
					 			  	'AngleToUse = angles[i] - rest;',
					 			  	'hasRest = true;',
					 			  '}',
					 			  'else{',
					 			  	'AngleToUse = angles[i];',
					 			  '}',

					 			  'rad = radians(AngleToUse);',
					 		   	 'if (tan(rad + prevAngle) >= (- 2.0 * ( 0.5 - gl_PointCoord.x)) / (- 2.0 * (gl_PointCoord.y - 0.5)) && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.x)) / (- 2.0 * (gl_PointCoord.y - 0.5)) ){',
                                        'float color = float(i) * 0.3;',
                                         'gl_FragColor = vec4(color, 0, 0, 1);',
                                         'found = true;',
                                        
                                     '}',
					 		 	 'prevAngle = prevAngle + rad;',
					 		 	 'if (totalAngles > 180.0){',
					 				'break;',
					 			 '}',

					 		'} ',
					 	'}',
					 '}',

					   'else if (gl_PointCoord.y > 0.5 && gl_PointCoord.x > 0.5){',
					    	'for (int i = 0; i<4;i++){',
					    		'totalAngles = totalAngles + angles[i];',
					    		'if (totalAngles >= 180.0){',
					    			'if (totalAngles - angles[i] < 180.0){',
					    				'AngleToUse = totalAngles - 180.0;',
					    			'}',
					    			'else if (totalAngles > 270.0){',
					 	 			'rest = totalAngles - 270.0;',
					 	 			'AngleToUse = angles[i] - rest;',
					 	 			'hasRest = true;',
					 	 		'}',
					    			'else{',
					    				'AngleToUse = angles[i];',
					    			'}',

					    			'rad = radians(AngleToUse);',
					    		 	'if (tan(rad + prevAngle) >= (- 2.0 * ( 0.5 - gl_PointCoord.y)) / (- 2.0 * ( 0.5 - gl_PointCoord.x)) && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.y)) / (- 2.0 * ( 0.5 - gl_PointCoord.x)) ){',
					   				'float color = float(i) * 0.3;',
                                     'gl_FragColor = vec4(color, 0, 0, 1);',
                                     'found = true;',
					  					
					   			'}',
					    		 	 'prevAngle = prevAngle + rad;',
					    		 	 'if (totalAngles > 270.0){',
					 	 			'break;',
					 	 		 '}',

					  		'} ',
					    	'}',
					    '}',

					    'else if (gl_PointCoord.y > 0.5 && gl_PointCoord.x < 0.5){',
					   	'for (int i = 0; i<4;i++){',
					   		'totalAngles = totalAngles + angles[i];',
					   		'if (totalAngles >= 270.0){',
					   			'if (totalAngles - angles[i] < 270.0){',
					   				'AngleToUse = totalAngles - 270.0;',
					   			'}',
					   			'else{',
					   				'AngleToUse = angles[i];',
					   			'}',

					   			'rad = radians(AngleToUse);',
					   		 	 'if (tan((rad + prevAngle)) >= (- 2.0 * (gl_PointCoord.x - 0.5)) / (- 2.0 * ( 0.5 - gl_PointCoord.y)) && tan((prevAngle)) <= (- 2.0 * (gl_PointCoord.x - 0.5)) / (- 2.0 * ( 0.5 - gl_PointCoord.y)) ){',
					   		 	 	'float color = float(i) * 0.3;',
                                     'gl_FragColor = vec4(color, 0, 0, 1);',
                                     'found = true;',
					  
					   		 	 '}',
					   		 	 'prevAngle = prevAngle + rad;',
					   		 	 'if (totalAngles > 360.0){',
					   				'break;',
					   			 '}',

					   		'} ',
					   	'}',
					   '}',

					

				'if (found == false){',
					'if ((gl_PointCoord.x - 0.5) * (gl_PointCoord.x - 0.5) + (gl_PointCoord.y - 0.5) * (gl_PointCoord.y - 0.5) < 0.25){',
						'gl_FragColor = vec4(0, 0, 1, 1);',
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
                    webglUtils = Viva.Graph.webgl(glContext);
                    program = webglUtils.createProgram(nodesVS, nodesFS);
                    gl.useProgram(program);
                    locations = webglUtils.getLocations(program, ['a_vertexPos', 'a_customAttributes','u_screenSize', 'u_transform']);
                    console.log(locations);

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
                    nodes[idx * ATTRIBUTES_PER_PRIMITIVE] = pos.x;
                    nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 1] = pos.y;
                    nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 2] = nodeUI.color;
                    nodes[idx * ATTRIBUTES_PER_PRIMITIVE + 3] = nodeUI.size;
                },

                /**
                 * Request from webgl renderer to actually draw our stuff into the
                 * gl context. This is the core of our shader.
                 */
                render : function() {
                    gl.useProgram(program);
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, nodes, gl.DYNAMIC_DRAW);

                    if (isCanvasDirty) {
                        isCanvasDirty = false;
                        gl.uniformMatrix4fv(locations.transform, false, transform);
                        gl.uniform2f(locations.screenSize, canvasWidth, canvasHeight);
                    }



                    //Since you are using GL_FLOAT as type, which has a size of 4 bytes, the offset is only allowed to be a multiple of 4.
                    gl.vertexAttribPointer(locations.vertexPos, 2, gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, 0);
                    gl.vertexAttribPointer(locations.customAttributes, 2, gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, 2 * 4);
                    //gl.vertexAttribPointer(locations.dados, 2, gl.FLOAT, false, ATTRIBUTES_PER_PRIMITIVE * Float32Array.BYTES_PER_ELEMENT, 4 * 4);

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