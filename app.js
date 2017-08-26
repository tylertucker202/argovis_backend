var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator')
var config = require('config');
var mongoose = require('mongoose');

var index = require('./routes/index');
var catalog = require('./routes/catalog');  //Import routes for "catalog" area of site
var selection = require('./routes/selection');  //Import routes for "catalog" area of site

var app = express();
const ENV = config.util.getEnv('NODE_ENV');
console.log('NODE_ENV: ' + ENV);
//don't show the log when it is test
if(ENV !== 'test') {
  //use morgan to log at command line
  app.use(logger('dev'));
}

const mongoDB = config.db[ENV];
console.log('mongodb: ' + mongoDB);
// connect mongoose to the mongo dbUrl
mongoose.connect(mongoDB, function (error) {
  if (error) {
      console.log(error);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/catalog', catalog);
app.use('/selection', selection);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
