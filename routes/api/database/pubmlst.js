var express = require('express'); 
var router = express.Router(); 
var util = require("util"); 
var fs = require("fs");

var httpProxy = require('http-proxy');

apiForwardingUrl = 'http://rest.pubmlst.org/';

var apiProxy = httpProxy.createProxyServer({
	changeOrigin: true,
	target: apiForwardingUrl
});

apiProxy.on('proxyRes', function(proxyRes, req, res){
	console.log(JSON.stringify(proxyRes.headers, true, 2));
});


router.get("/*", function(req, res) {
	//var apiForwardingUrl = req.query.forwardLink;
	var arrayOfparts = JSON.parse(req.query.forwardLink);
	//console.log(arrayOfparts);

	linkToUse = apiForwardingUrl;
	console.log(linkToUse);

	for(i in arrayOfparts){
		linkToUse += String(arrayOfparts[i]);
		if(i != arrayOfparts.length - 1) linkToUse += '/';
	}
	console.log(linkToUse);
    apiProxy.web(req, res);
});




module.exports = router;