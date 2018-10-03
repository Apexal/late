const app = require('./server');
const config = require('config');

const port = config.get('server.port');
const host = config.get('server.host');
app.listen(port, host);

console.log(
  `Server running on host ${host} on port ${port}\nGo to http://localhost:${port} to view.`
);
