var express = require('express');
var cors = require('cors')
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var config = require('config');
var mongoose = require('mongoose');
var debug = require('debug')('app');
var index = require('./routes/index');
var catalog = require('./routes/catalog');  //Import routes for "catalog" area of site
var selection = require('./routes/selection');  //Import routes for "selection" area of site
var gridding = require('./routes/gridding');  //Import routes for "gridding" area of site
var compression = require('compression'); //All routs are compressed
var helmet = require('helmet'); //sets appropriate HTTP headers

var app = express();
app.use(compression()); //Compress all routes
app.use(helmet());

const ENV = config.util.getEnv('NODE_ENV');
//don't show the log when it is test
if(ENV !== 'test') {
  //use morgan to log at command line
  app.use(logger('dev'));
}

const mongoDB = config.db[ENV];
debug('mongodb: ' + mongoDB);
mongoose.Promise = global.Promise;

//connect mongoose to the mongo dbUrl
mongoose.connect(mongoDB, {useMongoClient: true},
    function (error) {
        if (error) {
            console.log(error);
    }
}).
catch(error => { console.log('mongoose connect error: ', error.message); });

app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', debug.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator()); // Add this after the bodyParser middlewares!

var originsWhitelist  = [
  'http://localhost:4200',      //this is my front-end url for development
];
var corsOptions = {
  origin: function(origin, callback){
        var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
  },
  credentials:true
}

//here is the magic
app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, './../dist'))); // Point static path to ng dist
app.use('/', index);
app.use('/catalog', catalog);
app.use('/selection', selection);
app.use('/gridding', gridding);

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
