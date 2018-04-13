
var http = require('http');
var compression = require('compression');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var RedisStore = require('connect-redis')(expressSession);
var passport = require('passport');
var config = require('./config');
var flash = require('connect-flash');
var CronJob = require('cron').CronJob;
var cronFunctions = require('./cronJobs/cronFunctions');
var users = require('./routes/users');

/*
*
* PHYLOViZ Online routes
*
*/

var upload = require('./routes/api/database/uploadPostgres');
var goeBURST = require('./routes/api/algorithms/goeBURST');
var apiHome = require('./routes/api/index');
var phylovizInput = require('./routes/api/utils/phyloviz_input');
var mailer = require('./routes/api/utils/mailer');
var phyloviztableData = require('./routes/api/utils/tableData');
var phylovizsubset = require('./routes/api/utils/subset');
var publicLink = require('./routes/api/utils/publicLink');
var postgres = require('./routes/api/database/postgres');
var firstPage = require('./routes/app/firstPage');
var index = require('./routes/app/index');
var main = require('./routes/app/main');

var app = express();

//Setup of the View engine - Using jade middleware
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Connect to redis
var redis = require('redis');
var client = redis.createClient();

client.on('connect', function() {
    console.log('connected');
});

//Parser of server requests and setup of cookie system
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: '100mb', extended: false}));
app.use(cookieParser());      //FOR PASSPORT
app.use(expressSession({ 
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  store: new RedisStore({host: '127.0.0.1', port: '6379'})
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.use(compression());

/*
*
* Define routes
*
 */

app.use('/', firstPage);
app.use('/index', index);
app.use('/users', users);
app.use('/main', main);
app.use('/api', apiHome);
app.use('/api/db/postgres/upload', upload);
app.use('/api/algorithms/goeBURST', goeBURST);
app.use('/api/utils/phylovizInput', phylovizInput);
app.use('/api/utils/tableData', phyloviztableData);
app.use('/api/utils/mailer', mailer);
app.use('/api/utils/publiclink', publicLink);
app.use('/api/utils/phylovizsubset', phylovizsubset);
app.use('/api/db/postgres', postgres);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


//Launch server
var server = http.createServer(app).listen(3000); //http listen and express app will use all the middlewere
server.timeout = 100000000000000;


/*
*
* Cron Jobs
*
* */
var cronJobs = cronFunctions();

var job = new CronJob('00 00 00 * * 1-7', function() {
        var connectionString = "pg://" + config.databaseUserString + "@localhost/"+ config.db;
        var timeInterval = '24 hours';
  cronJobs.deletePublic(connectionString, timeInterval);
  }, function () {
    /* This function is executed when the job stops */
  },
  true /* Start the job right now */
  //'Portugal/Lisboa' /* Time zone of this job. */
);


module.exports = app;