var express = require('express'); 
var router = express.Router();
var config = require('../../../config.js');


router.get('/', function(req, res, next){

	if (req.isAuthenticated()){

		publicLink = req.query.dataset_id;

	    publicLink = config.final_root + '/main/dataset/share/'+ req.query.dataset_id;

	    res.send({url: publicLink});

	}
	else res.send("Login first");
        
});

module.exports = router;