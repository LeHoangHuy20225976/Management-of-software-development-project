require("dotenv").config();
const { Sequelize } = require('sequelize');

// Get database config
const getDatabaseConfig = () => {
  const env = process.env.DATABASE_ENV || 'development';

  const configs = {
    development: {
      username: process.env.DATABASE_USERNAME || "postgres",
      password: process.env.DATABASE_PASSWORD || "",
      database: process.env.DATABASE_NAME || "hotel_dev_db",
      host: process.env.DATABASE_HOST || "localhost",
      port: process.env.DATABASE_PORT || 5432,
      dialect: "postgres",
      dialectOptions: {
        bigNumberStrings: true,
        socketPath: process.env.DATABASE_SOCKET || "",
      },
    },
    test: {
      username: process.env.DATABASE_TEST_USERNAME,
      password: process.env.DATABASE_TEST_PASSWORD,
      database: process.env.DATABASE_TEST_NAME,
      host: process.env.DATABASE_TEST_HOST || "127.0.0.1",
      port: process.env.DATABASE_TEST_PORT || 5432,
      dialect: "postgres",
      dialectOptions: {
        bigNumberStrings: true,
        socketPath: process.env.DATABASE_TEST_SOCKET || "",
        charset: "utf8mb4"
      },
    },
    production: {
      username: process.env.PROD_DB_USERNAME,
      password: process.env.PROD_DB_PASSWORD,
      database: process.env.PROD_DB_NAME,
      host: process.env.PROD_DB_HOSTNAME,
      port: process.env.PROD_DB_PORT,
      dialect: "postgres",
      dialectOptions: {
        bigNumberStrings: true,
      },
    },
  };

  return configs[env];
};

// Create Sequelize instance
const config = getDatabaseConfig();
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
};

// Connect to database and sync models
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Import models to sync
    const db = require('../models');
    await db.sequelize.sync({ alter: false }); // Use alter: true in development to auto-update schema
    console.log('✅ Database synchronized successfully.');

    return true;
  } catch (error) {
    console.error('❌ Database connection/sync failed:', error);
    // Don't exit process, let server continue without database
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  connectDB,
  environment: process.env.DATABASE_ENV || "development",
  development: {
    username: process.env.DATABASE_USERNAME || "postgres",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "hotel_dev_db",
    host: process.env.DATABASE_HOST || "localhost",
    port: process.env.DATABASE_PORT || 5432,
    dialect: "postgres",
    dialectOptions: {
      bigNumberStrings: true,
      socketPath: process.env.DATABASE_SOCKET || "",
    },
  },
  test: {
    username: process.env.DATABASE_TEST_USERNAME,
    password: process.env.DATABASE_TEST_PASSWORD,
    database: process.env.DATABASE_TEST_NAME,
    host: process.env.DATABASE_TEST_HOST || "127.0.0.1",
    port: process.env.DATABASE_TEST_PORT || 5432,
    dialect: "postgres",
    dialectOptions: {
      bigNumberStrings: true,
      socketPath: process.env.DATABASE_TEST_SOCKET || "",
      charset: "utf8mb4"
    },
  },
  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    port: process.env.PROD_DB_PORT,
    dialect: "postgres",
    dialectOptions: {
      bigNumberStrings: true,
    },
  },
};
