var express = require('express');
var router = express.Router();
var passport = require('passport');
var passportLocal = require('passport-local');

var pg = require("pg");
var connectionString = "postgres://localhost/phyloviz";

passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  
  query = "SELECT username FROM datasets.users WHERE id =$1;";

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


passport.use(new passportLocal.Strategy(function(username, password, done){
	
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
	        if(result.rows.length == 0) done(null, false, {message: "Register before login"});
	        else{
		        userID = result.rows[0].id;
	        	query = "SELECT pass FROM datasets.users WHERE id =$1;";
	        	client.query(query, [userID], function(err, result) {
			        if(err) {
			          return console.error('error running query', err);
			        }
			        pass = result.rows[0].pass;
			        client.end();
			        if (password == pass){
					    done(null, { id: userID, name: username });
					  } else{
					    done(null, false, {message: "Invalid password"});
					  }

			    });
			}
	        
      	});
    });

}));

router.get('/login', function(req, res){
	res.render('login', { message: req.flash('error') });
});


router.get('/register', function(req, res){
  res.render('register', { message: req.flash('userError') });
});

router.post('/register', function(req, res, next){
	
	query = "INSERT INTO datasets.users(username, pass) VALUES('" + req.body.username +"', '"+req.body.password+"');";

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


router.post('/login', passport.authenticate('local', { 
	successRedirect: '/',
    failureRedirect: '/users/login' ,
    failureFlash: true
}));

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