/**
 * This file sets up the connection to the MongoDB database through the Mongoose package.
 * The authentication for the database is taken from the .env file.
 *
 * All of the schemas are setup in their respective folders under ./api
 **/
const logger = require('./modules/logger')

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const dbURL = process.env.MONGODB_URI // This better be set...

const connection = mongoose
  .connect(
    dbURL,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    logger.info('Connected to MongoDB.')
  })
  .catch(err => {
    logger.error(`Failed to connect to MongoDB: ${err}`)
    process.exit(1)
  })

module.exports = {
  connection
}
