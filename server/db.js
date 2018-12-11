const logger = require('./modules/logger');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const dbURL = process.env.MONGODB_URI;

const connection = mongoose
  .connect(
    dbURL,
    { useNewUrlParser: true }
  )
  .then(() => {
    logger.info('Connected to MongoDB.');
  })
  .catch(err => {
    logger.error(`Failed to connect to MongoDB: ${err}`);
  });

module.exports = {
  connection
};
