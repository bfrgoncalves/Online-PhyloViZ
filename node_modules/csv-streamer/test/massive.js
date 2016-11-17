var fs=require('fs');
var CSVStream=require('../csv-stream');
var assert=require('assert');

//from here : http://stackoverflow.com/questions/3885817/how-to-check-if-a-number-is-float-or-integer
function isFloat(n){
  return n===+n && n!==(n|0);
}

describe('CSV Stream',function(){
	it('should support massive streams',function(done){
		this.timeout(10000);
		var csv=new CSVStream({headers:true});

		var numColumns=20;
		var numRows=100000;
		var columns=[];
		for(var c=0;c<numColumns;c++)columns.push('col'+c);

		var headersSent=false;
		var dataSent=false;
		csv.on('end',function(){
			assert.ok(headersSent);
			assert.ok(dataSent);
			done();
		});
		csv.on('headers',function(headers){
			for(var c=0;c<numColumns;c++){
				assert.equal(headers[c],columns[c]);
			}
			assert.ok(!headersSent);
			headersSent=true;
		});
		csv.on('data',function(line){
			for(var c=0;c<numColumns;c++){
//				console.log(line[columns[c]]);
				
				assert.ok(line[columns[c]].match(/^abc(\d|\d\.|\.\d)+$/) != null);
			}
			dataSent=true;
		});
		
		csv.write(columns.join(',')+'\n');
		for(var i=0;i<numRows;i++){
			var line=[];
			for(var j=0;j<numColumns;j++){
				line.push('abc'+(1.0+Math.random()));
			}
			csv.write(line.join(',')+'\n');
		}
		csv.end();
		
	});
});
