var fs=require('fs');
var CSVStream=require('../csv-stream');
var assert=require('assert');

describe('CSV Stream',function(){
	it('should support multiple lines',function(done){
		var csv=new CSVStream({headers:true});
		var headersSent=false;
		var dataSent=false;
		var count=0;
		csv.on('end',function(){
			assert.ok(headersSent);
			assert.ok(dataSent);
			assert.equal(count,3);
			done();
		});
		csv.on('headers',function(headers){
			assert.deepEqual(headers,['col1','col2','col3','col4']);
			assert.ok(!headersSent);
			headersSent=true;
		});
		csv.on('data',function(line){
			switch(count){
			case 0:
				assert.deepEqual(line,{'col1':1,'col2':2,'col3':3,'col4':4});
				break;
			case 1:
				assert.deepEqual(line,{'col1':5,'col2':6,'col3':7,'col4':8});
				break;
			case 2:
				assert.deepEqual(line,{'col1':9,'col2':10,'col3':11,'col4':12});
				break;
			}
			count++;
			dataSent=true;
		});
		fs.createReadStream(__dirname+'/multiline.csv').pipe(csv);
	});
});