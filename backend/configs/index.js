const toInt = (val, fallback) => {
  const n = parseInt(val, 10);
  return Number.isNaN(n) ? fallback : n;
};

const app = {
  port: toInt(process.env.PORT, 3000),
  env: process.env.NODE_ENV || "development",
};

const jwt = {
  secret: process.env.JWT_SECRET,
  ttl: process.env.JWT_TTL || "1h",
};

const hashing = {
  saltRounds: toInt(process.env.BCRYPT_SALT_ROUNDS, 10),
};

const database = {
  // Placeholder values; update when wiring DB
  url: process.env.DATABASE_URL || "",
  dialect: process.env.DB_DIALECT || "postgres",
  dbName: process.env.DB_NAME || "postgres",
  dbUser: process.env.DB_USER || "postgres",
  dbPassword: process.env.DB_PASSWORD || "",
  dbHost: process.env.DB_HOST || "localhost",
  dbPort: toInt(process.env.DB_PORT, 5432),
  dbLogging: process.env.DB_LOGGING === "true",
};

const minio = {
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: toInt(process.env.MINIO_PORT, 9000),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  buckets: {
    hotelImages: process.env.MINIO_BUCKET_HOTEL_IMAGES || "hotel-images",
    roomImages: process.env.MINIO_BUCKET_ROOM_IMAGES || "room-images",
    userProfiles: process.env.MINIO_BUCKET_USER_PROFILES || "user-profiles",
    destinationImages:
      process.env.MINIO_BUCKET_DESTINATION_IMAGES || "destination-images",
    documents: process.env.MINIO_BUCKET_DOCUMENTS || "documents",
  },
};

const config = { app, database, jwt, hashing, minio };

module.exports = {
  PORT: app.port,
  NODE_ENV: app.env,
  app,
  database,
  jwt,
  hashing,
  minio,
  config,
};
