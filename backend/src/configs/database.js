const { Sequelize } = require("sequelize");
require("dotenv").config();
import { database } from "index";

const sequelize = new Sequelize(
  database.dbName,
  database.dbUser,
  database.dbPassword,
  {
    host: database.dbHost,
    port: database.dbPort,
    dialect: "postgres",
    logging: database.dbLogging ? console.log : false,
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

module.exports = {
  sequelize,
  Sequelize,
  testConnection,
  connectDB,
};
