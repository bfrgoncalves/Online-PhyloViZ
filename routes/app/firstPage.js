var express = require('express');
var router = express.Router();

var config = require('../../config.js');

router.get('*',function(req,res){ 
    res.redirect(config.currentRoot.substring(0, config.currentRoot.length - 1) + req.url)
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/index');
});

module.exports = router;