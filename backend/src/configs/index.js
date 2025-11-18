const toInt = (val, fallback) => {
  const n = parseInt(val, 10);
  return Number.isNaN(n) ? fallback : n;
};

const app = {
  port: toInt(process.env.PORT, 3000),
  env: process.env.NODE_ENV || "development",
};

const jwt = {
  secret: process.env.JWT_SECRET || "change-me-in-.env",
  ttl: process.env.JWT_TTL || "1h",
};

const hashing = {
  saltRounds: toInt(process.env.BCRYPT_SALT_ROUNDS, 10),
};

const database = {
  // Placeholder values; update when wiring DB
  url: process.env.DATABASE_URL || "",
  dialect: process.env.DB_DIALECT || "postgres",
};

const config = { app, database, jwt, hashing };

module.exports = {
  PORT: app.port,
  NODE_ENV: app.env,
  app,
  database,
  jwt,
  hashing,
  config,
};
