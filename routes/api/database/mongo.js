var express = require('express'); 
var router = express.Router();

var datasets = require('../../../models/datasets');

datasets.methods(['get', 'put']);

datasets.register(router, '/datasets');

module.exports = router;
