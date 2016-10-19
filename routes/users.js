var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var passport = require('passport');
var passportLocal = require('passport-local');
//var passportHttp = require('passport-http');

var config = require('../config.js');

var app = express();

var pg = require("pg");
var connectionString = "postgres://" + config.databaseUserString + "@localhost/" + config.db;


passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  
  query = "SELECT username FROM datasets.users WHERE user_id =$1;";

    var client = new pg.Client(connectionString);

  	client.connect(function(err) {
		if(err) {
			return console.error('could not connect to postgres', err);
		}
			client.query(query, [String(id)], function(err, result) {
				if(err) {
				  return console.error('error running query', err);
				}
				username = result.rows[0].username;
				client.end();
				done(null, {id: id, name: username});
			});
	});
});


passport.use(new passportLocal.Strategy(verifyCredentials));


function verifyCredentials(username, password, done){
  
  query = "SELECT user_id FROM datasets.users WHERE username =$1;";

  var client = new pg.Client(connectionString);
    client.connect(function(err) {
      if(err) {
        return console.error('could not connect to postgres', err);
      }
      client.query(query, [username], function(err, result) {
          if(err) {
            return console.error('error running query', err);
          }
          if(result.rows.length == 0) done(null, false, {message: "Register before login"});
          else{
            userID = result.rows[0].user_id;
            query = "SELECT pass, salt FROM datasets.users WHERE user_id =$1;";
            client.query(query, [userID], function(err, result) {
              if(err) {
                return console.error('error running query', err);
              }

              pass = result.rows[0].pass;
              salt = result.rows[0].salt;

              client.end();
              crypto.pbkdf2(password, salt, 7000, 256, 
                 function (err, hash) {
                      hash = new Buffer(hash).toString('hex');
                      if (hash == pass){
                      done(null, { id: userID, name: username });
                    } else{
                      done(null, false, {message: "Invalid password"});
                    }
                  }
              );

          });
      }
          
        });
    });
}

router.get('/login', function(req, res){
	res.render('login', { message: req.flash('error') , title: config.title});
});


router.get('/register', function(req, res){
  res.render('register', { message: req.flash('userError') , title: config.title});
});

router.get('/forgotpass', function(req, res){
  res.render('forgottenPass', { message: req.flash('usermessage') , title: config.title });
});

router.post('/register', function(req, res, next){


  if (!req.body.username || !req.body.password) {  
    req.flash('userError', 'Username and password both required');
    res.redirect('/users/register');
    return null;
  }

  query = "SELECT user_id FROM datasets.users WHERE email='" + req.body.email + "';";

  var client = new pg.Client(connectionString);

  client.connect(function(err) {
      if(err) {
        return console.error('could not connect to postgres', err);
      }
      client.query(query, function(err, result) {
        if(err) {
          return console.error('error running query', err);
        }
        if (result.rows.length > 0) {
          req.flash('userError', 'Email already in use');
          res.redirect('/users/register');
          return null;
        }
        else addUser();
        client.end();
      });
  });

  function addUser(){

    crypto.randomBytes(128, function (err, salt) {
      if (err) { throw err; }
      if (req.body.encrypt){
        pass = crypto.createHash('sha256').update(req.body.password).digest('hex');
      }
      else pass = req.body.password;
      salt = new Buffer(salt).toString('hex');
      crypto.pbkdf2(pass, salt, 7000, 256, 
        function (err, hash) {
          hash= new Buffer(hash).toString('hex');
          if (err) { throw err; }
          //console.log(config.cipherUser.algorithm);
          var cipher = crypto.createCipher(config.cipherUser.algorithm, config.cipherUser.pass);
          var user_id = cipher.update(req.body.username,'utf8','hex');

          query = "INSERT INTO datasets.users(username, user_id, salt, pass, email) VALUES('" + req.body.username +"', '"+user_id+"', '"+salt+"', '"+hash+"', '"+req.body.email+"');";

          var client = new pg.Client(connectionString);
            client.connect(function(err) {
              if(err) {
                return console.error('could not connect to postgres', err);
              }
              client.query(query, function(err, result) {
                if(err) {
                  client.end();
                  req.flash('userError', "Username "+req.body.username+" already exists");
                  res.redirect('/users/register');
                  return null;
                }
                client.end();

                if (req.body.encrypt){
                  return res.send('Success!');
                }
                else{

                  passport.authenticate('local')(req, res, function (err) {
                      req.session.save(function (err) {
                          if (err) {
                              return next(err);
                          }
                          res.redirect('/');
                      });
                  });

                }
              });
            });

        });
    });

  }
	
});

router.post('/login', passport.authenticate('local', { 
  successRedirect: '/',
    failureRedirect: '/users/login' ,
    failureFlash: true
}));




router.post('/api/login', function(req, res){

  var shasum = crypto.createHash('sha256');

  var newPass = shasum.update(req.body.password);
  var d = shasum.digest('hex');

  req.body.password = d;

  passport.authenticate('local')(req, res, function (err) {
    console.log(req);
    res.send(req.user);
  });

});


router.get('/logout', function(req, res, next) {
    req.logout();
    req.session.save(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

module.exports = router;