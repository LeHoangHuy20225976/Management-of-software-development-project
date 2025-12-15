require("dotenv").config();
require("rootpath")(__dirname);
const http = require("http");
const app = require("./app");
const config = require("./configs/index");
const { sequelize, testConnection, connectDB } = require("./configs/database");
const { initializeBuckets } = require("./configs/minio");

const port = config.PORT || 3000;

const server = http.createServer(app);

// Initialize services
const initializeServices = async () => {
  try {
    // Initialize MinIO buckets
    await initializeBuckets();
    console.log("✅ MinIO initialized successfully");
  } catch (error) {
    console.error("⚠️ MinIO initialization failed:", error.message);
    console.log("Server will continue without MinIO");
  }
};

// connectDB();
initializeServices();

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});
