const express = require("express");
const cookieParser = require('cookie-parser'); // Add this
const cors = require("cors");

const router = require("./routes/index");
// const { swaggerUIServe,swaggerUISetup } = require("kernels/api-docs");

const app = express();
app.disable("x-powered-by");
const corsOptions = {
  origin: "http://localhost:3000", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true  // using cookies
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(cookieParser()); // And this
app.use("/", router);

// app.use("/api-docs", swaggerUIServe, swaggerUISetup);

module.exports = app
