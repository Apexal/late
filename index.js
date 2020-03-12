/**
 * This file starts the server on the HOST and PORT specified in .env file.
 */

// The `dotenv` package parses the KEY=VALUE pairs in .env and sets them on process.env
require('dotenv').config()

const app = require('./server')

const logger = require('./server/modules/logger')

// Grab server configuration from environment variables
const port = process.env.PORT
const host = process.env.HOST || '0.0.0.0'
const server = require('http').createServer(app.callback())
server.listen(port, host)

logger.info(
  `Backend API server now running on host ${host} on port ${port}`
)

// Pass the server to Socket.IO for realtime communication
require('./server/modules/socketio')(server)
