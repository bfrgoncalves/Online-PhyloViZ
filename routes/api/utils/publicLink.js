var express = require('express'); 
var router = express.Router(); 
var util = require("util");
var crypto = require('crypto');

var config = require('../../../config.js');


router.get('/', function(req, res, next){

	if (req.isAuthenticated()){

		publicLink = req.query.dataset_id;

		//var cipher = crypto.createCipher(config.cipherUser.algorithm, config.cipherUser.pass);
	    //publicLink = config.final_root + '/main/dataset/share/'+ cipher.update(publicLink,'utf8','hex');
	    publicLink = config.final_root + '/main/dataset/share/'+ req.query.dataset_id;

	    res.send({url: publicLink});

	}
	else res.send("Login first");
        
});

module.exports = router;