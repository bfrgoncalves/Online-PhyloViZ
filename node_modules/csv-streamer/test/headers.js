var fs=require('fs');
var CSVStream=require('../csv-stream');
var assert=require('assert');

describe('CSV Stream',function(){
	it('should support headers',function(done){
		var csv=new CSVStream({headers:true});
		var headersSent=false;
		var dataSent=false;
		csv.on('end',function(){
			assert.ok(headersSent);
			assert.ok(dataSent);
			done();
		});
		csv.on('headers',function(headers){
			assert.deepEqual(headers,['col1','col2','col3','col4']);
			assert.ok(!headersSent);
			headersSent=true;
		});
		csv.on('data',function(line){
			assert.deepEqual(line,{'col1':1,'col2':2,'col3':3,'col4':4});
			assert.ok(!dataSent);
			dataSent=true;
		});
		fs.createReadStream(__dirname+'/headers.csv').pipe(csv);
	});
});