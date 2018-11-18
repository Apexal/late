const app = require('./server');

const logger = require('./server/logger');

// Grab server configuration from environment variables
const port = process.env.API_SERVER_PORT;
const host = process.env.HOST;
app.listen(port, host);

logger.info(
  `Server running on host ${host} on port ${port}\nGo to http://localhost:${port} to view.`
);
