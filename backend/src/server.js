require('dotenv').config();
require('rootpath')(__dirname);
const http = require('http');
const app = require('./app');
const config = require('./configs/index');

const port = config.PORT || 3000;

const server = http.createServer(app);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});
