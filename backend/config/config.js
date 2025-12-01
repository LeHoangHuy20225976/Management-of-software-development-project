require('dotenv').config();

module.exports = {
  "development": {
    "username": process.env.DATABASE_USERNAME || "postgres",
    "password": process.env.DATABASE_PASSWORD || "",
    "database": process.env.DATABASE_NAME || "hotel_dev_db",
    "host": process.env.DATABASE_HOST || "127.0.0.1",
    "port": process.env.DATABASE_PORT || 5432,
    "dialect": "postgres",
    "logging": process.env.DB_LOGGING === 'true' ? console.log : false
  },
  "test": {
    "username": process.env.DATABASE_USERNAME,
    "password": process.env.DATABASE_PASSWORD,
    "database": process.env.DATABASE_NAME_TEST || "database_test",
    "host": process.env.DATABASE_HOST || "127.0.0.1",
    "port": process.env.DATABASE_PORT || 5432,
    "dialect": "postgres"
  },
  "production": {
    "username": process.env.DATABASE_USERNAME,
    "password": process.env.DATABASE_PASSWORD,
    "database": process.env.DATABASE_NAME_PROD || process.env.DATABASE_NAME,
    "host": process.env.DATABASE_HOST || "127.0.0.1",
    "port": process.env.DATABASE_PORT || 5432,
    "dialect": "postgres"
  }
};
