const fs = require('fs');
const path = require('path');

const logger = require('../server/logger');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const dbURL = process.env.MONGODB_URI;

let models = {};

const connection = mongoose.connect(
  dbURL,
  { useNewUrlParser: true }
);

fs.readdirSync(__dirname + '/schemas')
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    var schema = require(path.join(__dirname + '/schemas/', file));
    models[schema.name] = mongoose.model(schema.name, schema.schema);
  });
logger.info('Loaded database schemas.');

module.exports = {
  connection,
  models
};
