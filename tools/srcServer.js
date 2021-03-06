import express from 'express';
import bodyParser from 'body-parser';
import webpack from 'webpack';
import uriUtil from 'mongodb-uri';
import path from 'path';
import config from '../webpack.config.dev';
import morgan from 'morgan';
import open from 'open';
import mongoose from 'mongoose';
import routes from '../src/routes/routes';

let app = express();
/* eslint-disable no-console */
let router = express.Router(); // this isn't used here - delete - Harold

mongoose.Promise = global.Promise;

let mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost/swapple';
let mongooseUri = uriUtil.formatMongoose(mongodbUri);
let options = {
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};
mongoose.connect(mongooseUri, options);

// change these to import
let Swapple = require('../models/itemSchema');
let NewUser = require('../models/userSchema');

const port = process.env.PORT || 3000;
const compiler = webpack(config);
const PROD = process.env.NODE_ENV === 'production';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

if (PROD) {
  app.use('/', express.static('dist'));
} else {
  // When not in production, enable hot reloading
  const compiler = webpack(config);
  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
  }));
  app.use(require('webpack-hot-middleware')(compiler));
}

app.use('/', routes);

app.get('/', function(req, res) {
  res.sendFile(path.join( __dirname, '../public/index.html'));
});

app.listen(port, function(err) {
  if (err) {
    console.log(err);
  } else if (!PROD) {
    console.log(('Starting app in dev mode, listening on port ' + port).green);
    open(`http://localhost:${port}`);
  } else {
    console.log('Starting app in production mode, listening on port ' + port);
  }
});
