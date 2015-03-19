var Node_Link = require('../models/workout').Node_Link;

module.exports = function(req,res){
	Node_Link.find({}, function(err,docs){
		if (!err){
			res.json(200,{data: docs});
		}
		else{
			res.json(500, {message:err});
		}
	});
}