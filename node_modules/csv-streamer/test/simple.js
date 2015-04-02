var fs=require('fs');
var CSVStream=require('../csv-stream');
var assert=require('assert');

describe('CSV Stream',function(){
	it('should read simple files',function(done){
		var csv=new CSVStream();
		var dataSent=false;
		csv.on('end',function(){
			assert.ok(dataSent);
			done();
		});
		csv.on('data',function(line){
			assert.deepEqual(line,[1,2,3,4]);
			assert.ok(!dataSent);
			dataSent=true;
		});
		fs.createReadStream(__dirname+'/simple.csv').pipe(csv);
	});
});