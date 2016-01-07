var express = require('express'); 
var router = express.Router(); 
var util = require("util");
var nodemailer = require('nodemailer');
var crypto = require('crypto');

var config = require('../../../config.js');

var pg = require("pg");
var connectionString = "postgres://" + config.databaseUserString + "@localhost/"+ config.db;

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: config.email,
        pass: config.spe
    }
});

router.post('/sendpass', function(req, res, next){

    verifyEmail(req.body.username, req.body.email, function(err, userObject){
        if (err){
            req.flash('usermessage', "Username don't match the email");
            res.redirect("/users/forgotpass");
            return null;
        }
        changePassword(userObject, function(err, mailObject){
            if (err){
                req.flash('usermessage', "Error occurried when changing password");
                res.redirect("/users/forgotpass");
                return null;
            }
            mailObject.message = "Hi " + mailObject.username +",\n\nYour new password for " + config.title + " is: " + mailObject.pass + "\n\n" +
                                "Best regards,\n\n" + config.title + " Team"
            sendMail(mailObject, function(err, mailOptions){
                if (err){
                    req.flash('usermessage', "Error sending e-mail");
                    res.redirect("/");
                    return null;
                }
                req.flash('usermessage', "An e-mail as been sent to your account with the new password");
                res.redirect("/users/forgotpass");
                //res.send(true);
            });
        });


    })

        
});

function verifyEmail(username, email, callback){

    query = "SELECT email, salt FROM datasets.users WHERE username =$1;";

    var client = new pg.Client(connectionString);

    client.connect(function(err) {
        if(err) {
            return console.error('could not connect to postgres', err);
        }
        client.query(query, [username], function(err, result) {
            if(err) {
              return console.error('error running query', err);
            }
            if (result.rows.length == 0) callback(true, null);
            else{
                realEmail = result.rows[0].email;
                salt = result.rows[0].salt;
                client.end();
                if (email == realEmail){
                    callback(null, {username: username, email: realEmail, salt: salt});
                }
                else callback(true, null);
            }
        });
    });
}

function changePassword(userObject, callback){

    query = "UPDATE datasets.users SET pass=$1 WHERE username=$2;";

    var client = new pg.Client(connectionString);

    client.connect(function(err) {
        if(err) {
            return console.error('could not connect to postgres', err);
        }

        var newPass = config.randomId(8);

        var passHash = crypto.createHash('sha256').update(newPass).digest('hex');

        crypto.pbkdf2(passHash, salt, 7000, 256, 
             function (err, hash) {
                  hash = new Buffer(hash).toString('hex');

                  client.query(query, [hash, userObject.username], function(err, result) {
                        if(err) {
                          return console.error('error running query', err);
                        }
                        client.end();
                        userObject.pass = newPass;
                        callback(null, userObject);
                    });
                  
              }
          );

    });
}

function sendMail(mailInfo, callback){

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: config.title + ' <phylovizonline@gmail.com>', // sender address
        to: mailInfo.email, // list of receivers
        subject: 'Phyloviz - new password', // Subject line
        text: mailInfo.message, // plaintext body
        //html: '<b>Hello world ✔</b>' // html body
    };
    
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
        callback(null, mailOptions);

    });

}



module.exports = router; 
