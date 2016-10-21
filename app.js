var fs = require('fs');
//var https = require('https');

var http = require('http');

var cluster = require('cluster');
var os = require('os');

//var session = require('express-session');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var RedisStore = require('connect-redis')(expressSession);
// var busboy = require('connect-busboy');
var restful = require('node-restful')

var passport = require('passport');

var config = require('./config');

var parseGoe = require('goeBURSTparser');
var flash = require('connect-flash');

var CronJob = require('cron').CronJob;
var cronFunctions = require('./cronJobs/cronFunctions');

var users = require('./routes/users');

var Queue = require('bull');

var queue = Queue("goeBURST queue", 6379, '127.0.0.1');

queue.clean(10000, 'failed');

var upload = require('./routes/api/database/uploadPostgres');
var updateDataset = require('./routes/api/database/modifyDataset');
var goeBURST = require('./routes/api/algorithms/goeBURST');
var apiHome = require('./routes/api/index');
var mongoSearch = require('./routes/api/database/mongo');
var phylovizInput = require('./routes/api/utils/phyloviz_input');
var mailer = require('./routes/api/utils/mailer');
var phyloviztableData = require('./routes/api/utils/tableData');
var phylovizsubset = require('./routes/api/utils/subset');
var publicLink = require('./routes/api/utils/publicLink');
//var pubmlst = require('./routes/api/database/pubmlst');

var postgres = require('./routes/api/database/postgres');

//var testAuthentication = require('./routes/app/testAuthentication');

var firstPage = require('./routes/app/firstPage');
var index = require('./routes/app/index');
var main = require('./routes/app/main');

var done = false;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Redis
var redis = require('redis');
var client = redis.createClient();

client.on('connect', function() {
    console.log('connected');
});

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: '8mb', extended: false}));
app.use(cookieParser());      //FOR PASSPORT
app.use(expressSession({ 
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  store: new RedisStore({host: '127.0.0.1', port: '6379'})
}));
app.use(passport.initialize());
app.use(passport.session());

//app.use('/api', passport.authenticate('basic', {session: false}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());


app.use('/', firstPage);
app.use('/index', index);
app.use('/users', users);
app.use('/main', main);
app.use('/api', apiHome);
app.use('/api/db/postgres/upload', upload);
app.use('/api/db/datasets/update', updateDataset);
app.use('/api/algorithms/goeBURST', goeBURST);
app.use('/api/utils/phylovizInput', phylovizInput);
app.use('/api/utils/tableData', phyloviztableData);
app.use('/api/utils/mailer', mailer);
app.use('/api/utils/publiclink', publicLink);
app.use('/api/db', mongoSearch);
app.use('/api/utils/phylovizsubset', phylovizsubset);
//app.use('/api/pubmlst', pubmlst);

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


if (cluster.isMaster) {
    for (var i = 0; i < 2; i++) {
        cluster.fork();
    }
} else {
  console.log('Worker server');
  var server = http.createServer(app).listen(3000); //http listen and express app will use all the middlewere
  server.timeout = 100000000000;
}

/*
var server = http.createServer(app); //http listen and express app will use all the middlewere
server.timeout = 100000000000;
server.listen(config.port, function(){  //https server is listening
  console.log('Server Running');
});
*/


// CODE to generate certificate
// openssl req -x509 -nodes -days 365 -newkey rsa:1024 -out my.crt -keyout my.key

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