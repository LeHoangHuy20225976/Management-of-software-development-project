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

// Initialize services asynchronously
const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('⚠️ Database connection failed, server will continue without database');
  }

  try {
    await initializeServices();
  } catch (error) {
    console.error('⚠️ Services initialization failed, server will continue');
  }

  server.listen(port, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${port}`);
  });
};

startServer();
