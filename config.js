function makeid(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}



module.exports = {
	db : 'phyloviz',
	randomId : makeid,
	title : "PHYLOViZ Online",
	cipherUser: { algorithm: 'aes-256-ctr', pass: 'd6F3Efeq'},
	currentRoot: 'https://localhost:3000/'
}