const app = require('./server');

const port = process.env.PORT || 3000;
app.listen(port);

console.log(
  `Server running on port ${port}\nGo to http://localhost:${port} to view.`
);
