var fs=require('fs');
var CSVStream=require('../csv-stream');
var assert=require('assert');

describe('CSV Stream',function(){
	it('should support quoted strings',function(done){
		var csv=new CSVStream();
		var dataSent=false;
		csv.on('end',function(){
			assert.ok(dataSent);
			done();
		});
		csv.on('data',function(line){
			assert.deepEqual(line,['hello world','hello, world','hello\nworld']);
			assert.ok(!dataSent);
			dataSent=true;
		});
		fs.createReadStream(__dirname+'/quoted.csv').pipe(csv);
	});
});