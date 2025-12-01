const express = require("express");
const router = require("./routes/index");
// const { swaggerUIServe,swaggerUISetup } = require("kernels/api-docs");

const app = express();
app.disable("x-powered-by");

app.use(express.json());
app.use("/", router);

// app.use("/api-docs", swaggerUIServe, swaggerUISetup);

module.exports = app
