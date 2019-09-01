/**
 * This file starts the server on the HOST and PORT specified in .env file.
 */

require('dotenv').config()

const app = require('./server')

const logger = require('./server/modules/logger')

// Grab server configuration from environment variables
const port = process.env.PORT
const host = process.env.HOST || '0.0.0.0'
const server = require('http').createServer(app.callback())
server.listen(port, host)

logger.info(
  `API server running on host ${host} on port ${port}\nGo to http://localhost:${port} to view.`
)

require('./server/modules/socketio')(server)
