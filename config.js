function makeid(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var port = 3000;

module.exports = {
	db : 'phyloviz',
	databaseUserString: 'phylovizonline:phylo2015',
	randomId : makeid,
	title : "PHYLOViZ Online",
	cipherUser: { algorithm: 'aes-256-ctr', pass: 'd6F3Efeq'},
	currentRoot: 'http://localhost:'+String(port) + '/',
	certPath: 'my.crt',
	keyPath: 'my.key',
	port: port
}