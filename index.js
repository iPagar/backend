//load env
require("dotenv").config();
//express
const express = require("express");
//loggers
const morgan = require("morgan");
const winston = require("./config/winston");
//error handlers
const { notFoundHandler, errorHanlder } = require("./config/errorHandlers");
//cors and fs
const cors = require("cors");
const fs = require("fs");
//postgresql
const db = require("./queries");
const https = require("https");
//securing
const helmet = require("helmet");
const { checkSign } = require("./signChecker");

const app = express();
const logger = morgan("combined", { stream: winston.stream });

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(
	express.urlencoded({ limit: "1mb", parameterLimit: 500, extended: true })
);
app.use(cors());
app.use(logger);
app.disable("x-powered-by");

const options = {
	key: fs.readFileSync("domain-key.pem"),
	cert: fs.readFileSync("domain-crt.pem")
};

//check sign
app.use(checkSign);

//modules
const manage = require("./routes/manage");

app.use("/", manage);

//error handlers
app.use(notFoundHandler);
app.use(errorHanlder);

https.createServer(options, app).listen(process.env.port);
