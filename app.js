var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var busboy = require('connect-busboy');
var restful = require('node-restful')
var mongoose = require('mongoose');
var fs = require('fs');

var parseGoe = require('goeBURSTparser');

var users = require('./routes/users');
var upload = require('./routes/api/database/upload');
var goeBURST = require('./routes/api/algorithms/goeBURST');
var apiHome = require('./routes/api/index');
var mongoSearch = require('./routes/api/database/mongo');
var phylovizInput = require('./routes/api/utils/phyloviz_input');
var phyloviztableData = require('./routes/api/utils/tableData');

var routes = require('./routes/app/index');
var main = require('./routes/app/main');

var done = false;

// var inputData = require('./routes/inputData');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/main', main);
app.use('/api', apiHome);
app.use('/api/db/upload', upload);
app.use('/api/algorithms/goeBURST', goeBURST);
app.use('/api/utils/phylovizInput', phylovizInput);
app.use('/api/utils/tableData', phyloviztableData);
app.use('/api/db', mongoSearch);
// app.use('/inputData',inputData);

//load all files in models dir
// fs.readdirSync(__dirname + '/models').forEach(function(filename){
//   if(~filename.indexOf('.js')) require(__dirname + '/models/' + filename);
// })

mongoose.connect('mongodb://localhost/phyloviz');


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


app.listen(3000, function(){
  console.log('Server Running');
});


module.exports = app;