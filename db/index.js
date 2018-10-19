const fs = require('fs');
const path = require('path');
const config = require('config');

const logger = require('../server/logger');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const dbURL = `mongodb://${config.get('mongo.user')}:${config.get(
  'mongo.password'
)}@${config.get('mongo.host')}:${config.get('mongo.port')}/${config.get(
  'mongo.db'
)}`;

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
