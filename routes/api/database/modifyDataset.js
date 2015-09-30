var express = require('express'); 
var router = express.Router();

router.post('/', function(req, res, next){
	//console.log(req.body.Positions, req.body.datasetName);
	var datasetModel = require('../../../models/datasets');
	var query = {name: req.body.datasetName};
	datasetModel.update(query, {positions : req.body.Positions}, function(){
		res.send(true);
	})
});

module.exports = router;