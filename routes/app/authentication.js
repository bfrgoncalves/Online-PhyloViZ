var express = require('express');
var router = express.Router();
var passport = require('passport');
var passportLocal = require('passport-local');

var config = require('../../config.js');

var pg = require("pg");
var connectionString = "postgres://" + config.databaseUserString + "@localhost/"+ config.db;


passport.use(new passportLocal.Strategy(function(username, password, callback){
	
	query = "SELECT id FROM datasets.users WHERE username =$1;";

	var client = new pg.Client(connectionString);
    client.connect(function(err) {
      if(err) {
        return console.error('could not connect to postgres', err);
      }
      client.query(query, [username], function(err, result) {
	        if(err) {
	          return console.error('error running query', err);
	        }
	        userID = result.rows[0].id;

	        if (userID != undefined){
	        	query = "SELECT pass FROM datasets.users WHERE username =$1;";
	        	client.query(query, [username], function(err, result) {
			        if(err) {
			          return console.error('error running query', err);
			        }
			        pass = result.rows[0].pass;
			        client.end();
			        if (password == pass){
					    callback(null, { id: userID, name: username });
					  } else{
					    callback(null,null);
					  }

			    });
	        }
      	});
    });

}));

router.get('/login', function(req, res){
  res.render('login');
});


router.get('/register', function(req, res){
  res.render('register');
});

router.post('/register', function(req, res, next){
	
	query = "INSERT INTO datasets.users(username, pass) VALUES(" + req.body.username +", "+req.body.password+");";

	var client = new pg.Client(connectionString);
    client.connect(function(err) {
      if(err) {
        return console.error('could not connect to postgres', err);
      }
      client.query(query, function(err, result) {
        if(err) {
          return console.error('error running query', err);
        }
        client.end();

        passport.authenticate('local')(req, res, function () {
            req.session.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });
      });
    });
});


router.post('/login', passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

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