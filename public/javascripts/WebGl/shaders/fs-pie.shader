precision mediump float;
varying vec4 color;

precision mediump float;
//varying vec2 vTexCoord; //get the passing value from the vertex shader

void main() {

	vec4 angles = vec4(110.0, 110.0, 110.0, 30.0);
	float prevAngle = radians(0.0);
	float radQuad = radians(90.0);
	float totalAngles = 0.0;

	bool found = false;
	bool hasRest = false;
	float rad = 0.0;
	float AngleToUse = 0.0;
	float rest;

	if (gl_PointCoord.y < 0.5 && gl_PointCoord.x < 0.5){
		for (int i = 0; i<4;i++){
			totalAngles = totalAngles + angles[i];
			if (totalAngles > 90.0){
				rest = totalAngles - 90.0;
				AngleToUse = angles[i] - rest;
			}
			else{
				AngleToUse = angles[i];
			}
			rad = radians(AngleToUse);
			if ((tan(rad + prevAngle) >= (gl_PointCoord.y - 0.5) / (gl_PointCoord.x - 0.5)) && (tan(prevAngle) <= (gl_PointCoord.y - 0.5) / (gl_PointCoord.x - 0.5))){
				float color = float(i) * 0.3;
                gl_FragColor = vec4(color, 0, 0, 1);
                found = true;
			}
			prevAngle = prevAngle + rad;
			if (totalAngles > 90.0){
				break;
			}
		}

	}

	 else if (gl_PointCoord.y <= 0.5 && gl_PointCoord.x >= 0.5){
	 	for (int i = 0; i<4;i++){
	 		totalAngles = totalAngles + angles[i];
	 		if (totalAngles >= 90.0){
	 			if (totalAngles - angles[i] < 90.0){
	 				AngleToUse = totalAngles - 90.0;
	 			}
	 			  else if (totalAngles > 180.0){
	 			  	rest = totalAngles - 180.0;
	 			  	AngleToUse = angles[i] - rest;
	 			  }
	 			  else{
	 			  	AngleToUse = angles[i];
	 			  }

	 			  rad = radians(AngleToUse);
	 		   	 if (tan(rad + prevAngle) >= (- 2.0 * ( 0.5 - gl_PointCoord.x)) / (- 2.0 * (gl_PointCoord.y - 0.5)) && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.x)) / (- 2.0 * (gl_PointCoord.y - 0.5)) ){
                        float color = float(i) * 0.3;
                         gl_FragColor = vec4(color, 0, 0, 1);
                         found = true;
                        
                 }
	 		 	 prevAngle = prevAngle + rad;
	 		 	 if (totalAngles > 180.0){
	 				break;
	 			 }

	 		} 
	 	}
	 }

	   else if (gl_PointCoord.y > 0.5 && gl_PointCoord.x > 0.5){
	    	for (int i = 0; i<4;i++){
	    		totalAngles = totalAngles + angles[i];
	    		if (totalAngles >= 180.0){
	    			if (totalAngles - angles[i] < 180.0){
	    				AngleToUse = totalAngles - 180.0;
	    			}
	    			else if (totalAngles > 270.0){
	 	 			rest = totalAngles - 270.0;
	 	 			AngleToUse = angles[i] - rest;
	 	 		}
	    			else{
	    				AngleToUse = angles[i];
	    			}

	    			rad = radians(AngleToUse);
	    		 	if (tan(rad + prevAngle) >= (- 2.0 * ( 0.5 - gl_PointCoord.y)) / (- 2.0 * ( 0.5 - gl_PointCoord.x)) && tan(prevAngle) <= (- 2.0 * ( 0.5 - gl_PointCoord.y)) / (- 2.0 * ( 0.5 - gl_PointCoord.x)) ){
	   				float color = float(i) * 0.3;
                     gl_FragColor = vec4(color, 0, 0, 1);
                     found = true;
	  					
	   			}
	    		 	 prevAngle = prevAngle + rad;
	    		 	 if (totalAngles > 270.0){
	 	 			break;
	 	 		 }

	  		} 
	    	}
	    }

	    else if (gl_PointCoord.y > 0.5 && gl_PointCoord.x < 0.5){
	   	for (int i = 0; i<4;i++){
	   		totalAngles = totalAngles + angles[i];
	   		if (totalAngles >= 270.0){
	   			if (totalAngles - angles[i] < 270.0){
	   				AngleToUse = totalAngles - 270.0;
	   			}
	   			else{
	   				AngleToUse = angles[i];
	   			}

	   			rad = radians(AngleToUse);
	   		 	 if (tan((rad + prevAngle)) >= (- 2.0 * (gl_PointCoord.x - 0.5)) / (- 2.0 * ( 0.5 - gl_PointCoord.y)) && tan((prevAngle)) <= (- 2.0 * (gl_PointCoord.x - 0.5)) / (- 2.0 * ( 0.5 - gl_PointCoord.y)) ){
	   		 	 	float color = float(i) * 0.3;
                     gl_FragColor = vec4(color, 0, 0, 1);
                     found = true;
	  
	   		 	 }
	   		 	 prevAngle = prevAngle + rad;
	   		 	 if (totalAngles > 360.0){
	   				break;
	   			 }

	   		} 
	   	}
	   }

	

	if (found == false){
		if ((gl_PointCoord.x - 0.5) * (gl_PointCoord.x - 0.5) + (gl_PointCoord.y - 0.5) * (gl_PointCoord.y - 0.5) < 0.25){
			gl_FragColor = vec4(0, 0, 1, 1);
		}
	}
	else if ((gl_PointCoord.x - 0.5) * (gl_PointCoord.x - 0.5) + (gl_PointCoord.y - 0.5) * (gl_PointCoord.y - 0.5) > 0.25){
	    gl_FragColor = vec4(0);
	}
	
}