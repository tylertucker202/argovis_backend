const express = require('express');
const cors = require('cors')
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const config = require('config');

const swaggerUI = require('swagger-ui-express')

const fs = require('fs');
const yaml = require('js-yaml');
const swaggerDocs = yaml.load(fs.readFileSync('./public/api-docs/swagger.yaml', {encoding: 'utf-8'}));
const mongoose = require('mongoose');
const debug = require('debug')('app');


const index = require('./routes/index');
const catalog = require('./routes/catalog');  //Import routes for "catalog" area of site
const selection = require('./routes/selection');  //Import routes for "selection" area of site
const gridding = require('./routes/gridding');  //Import routes for "selection" area of site
const griddedProducts = require('./routes/griddedProducts');  //Import routes for "griddedProduct" area of site
const covarGrid = require('./routes/covarGrid'); //Import used for gridding
const arShapes = require('./routes/arShapes');
const tcTraj = require('./routes/tc');

const compression = require('compression'); //All routes are compressed
const helmet = require('helmet'); //sets appropriate HTTP headers

const app = express();
app.use(compression()); //Compress all routes
app.use(helmet());

const ENV = config.util.getEnv('NODE_ENV');
console.log('env: ', ENV)
//don't show the log when it is test
if(ENV !== 'test') {
  //use morgan to log at command line
  app.use(logger('dev'));
}
const REMOTE_DB = process.env.REMOTE_DB
console.log('remote db bool:', REMOTE_DB)
let mongoDB = config.db[ENV];

console.log('mongoDB: ', mongoDB)
if (REMOTE_DB) { 
  mongoDB = config.db['REMOTE_DB']
  debug('mongodb: ' + mongoDB);
  }

mongoose.Promise = global.Promise;
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  keepAlive: 1,
  connectTimeoutMS: 30000
};

//connect mongoose to the mongo dbUrl
mongoose.connect(mongoDB, mongooseOptions)
.catch(error => { console.log('mongoose connect error: ', error.message); });

app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Get the default connection
let db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', debug.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator()); // Add this after the bodyParser middlewares!

const originsWhitelist  = [
  'http://localhost:4200',      //this is my front-end url for development
];
const corsOptions = {
  origin: function(origin, callback){
        const isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
  },
  credentials:true
}

// Set the MIME type explicitly
express.static.mime.define({'application/wasm': ['wasm']});

//here is the magic
app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, './../dist'))); // Point static path to ng dist
app.use(express.static('public'))
app.use('/', index);
app.use('/api-docs/', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use('/catalog', catalog);
app.use('/selection', selection);
app.use('/gridding', gridding);
app.use('/covarGrid', covarGrid);
app.use('/griddedProducts', griddedProducts);
app.use('/arShapes', arShapes);
app.use('/tc', tcTraj);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
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
