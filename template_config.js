function makeid(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var port = 'port(integer)';

module.exports = {
	db : 'databaseName',
	databaseUserString: 'username:password',
	randomId : makeid,
	title : "PHYLOViZ Online",
	email: 'phylovizonline@gmail.com',
	spe: 'phyloviz_online',
	cipherUser: { algorithm: 'aes-256-ctr', pass: 'passwordCipher'},
	currentRoot: 'https://localhost:'+String(port) + '/',
	//certPath: 'certificatePath',
	//keyPath: 'keyPath',
	port: port
}