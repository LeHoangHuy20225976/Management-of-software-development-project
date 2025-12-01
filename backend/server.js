require("dotenv").config();
require("rootpath")(__dirname);
const http = require("http");
const app = require("./app");
const config = require("./configs/index");
const { sequelize, testConnection, connectDB } = require("./configs/database");

const port = config.PORT || 3000;

const server = http.createServer(app);

// connectDB();

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});
