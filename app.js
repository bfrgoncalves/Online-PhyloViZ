'use strict'

const fs = require('fs');
const http = require('http');
const cluster = require('cluster');
const os = require('os');
const compression = require('compression')
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const RedisStore = require('connect-redis')(expressSession);
const restful = require('node-restful')
const passport = require('passport');
const config = require('./config');
const flash = require('connect-flash');
const CronJob = require('cron').CronJob;
const cronFunctions = require('./cronJobs/cronFunctions');
const users = require('./routes/users');

/*
*
* PHYLOViZ Online routes
*
*/

const upload = require('./routes/api/database/uploadPostgres');
const goeBURST = require('./routes/api/algorithms/goeBURST');
const apiHome = require('./routes/api/index');
const phylovizInput = require('./routes/api/utils/phyloviz_input');
const mailer = require('./routes/api/utils/mailer');
const phyloviztableData = require('./routes/api/utils/tableData');
const phylovizsubset = require('./routes/api/utils/subset');
const publicLink = require('./routes/api/utils/publicLink');
const postgres = require('./routes/api/database/postgres');
const firstPage = require('./routes/app/firstPage');
const index = require('./routes/app/index');
const main = require('./routes/app/main');

const app = express();

//Setup of the View engine - Using jade middleware
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Connect to redis
const redis = require('redis');
const client = redis.createClient();

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
const server = http.createServer(app).listen(3000); //http listen and express app will use all the middlewere
server.timeout = 100000000000000;


/*
*
* Cron Jobs
*
* */
const cronJobs = cronFunctions();

const job = new CronJob('00 00 00 * * 1-7', function() {
  const connectionString = "pg://" + config.databaseUserString + "@localhost/"+ config.db;
  const timeInterval = '24 hours';
  cronJobs.deletePublic(connectionString, timeInterval);
  }, function () {
    /* This function is executed when the job stops */
  },
  true /* Start the job right now */
  //'Portugal/Lisboa' /* Time zone of this job. */
);


module.exports = app;