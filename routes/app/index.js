var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.query.input) res.render('indexApp', { title: 'PHYLOViZ Online' });
  else res.render('indexAppWithoutInput', { title: 'PHYLOViZ Online' });
});

module.exports = router;
