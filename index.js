//load env
require("dotenv").config();
//express
const express = require("express");
//loggers
const expressWinston = require("express-winston");
const winston = require("./config/winston");
//error handlers
const { notFoundHandler, errorHanlder } = require("./config/errorHandlers");
const createError = require("http-errors");
//cors and fs
const cors = require("cors");
const fs = require("fs");

const http = require("http");
//securing
const helmet = require("helmet");
const check = require("vkui-sign-checker");

const app = express();

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(
  express.urlencoded({ limit: "1mb", parameterLimit: 500, extended: true })
);
app.use(cors());
app.use(winston);
app.disable("x-powered-by");

//check sign
app.use(function (req, res, next) {
  const x_sign_header = req.headers[`x-sign-header`].slice(1);

  check(x_sign_header, process.env.VK_SECURE_MODULI)
    .then((params) => {
      req.body = { params, ...req.body };
      next();
    })
    .catch(() => {
      check(x_sign_header, process.env.VK_SECURE_SCHEDULE)
        .then((params) => {
          req.body = { params, ...req.body };
          next();
        })
        .catch(() => {
          next(createError(401));
        });
    });
});

//modules
const manage = require("./routes/manage");
const schedule = require("./routes/schedule");
const teachers = require("./routes/teachers");
const ol = require("./routes/ol");

app.use([manage, schedule, teachers, ol]);

//error handlers
app.use(notFoundHandler);
app.use(errorHanlder);

// const options = {
//   key: fs.readFileSync("/etc/letsencrypt/live/ipagar.ddns.net/privkey.pem"),
//   cert: fs.readFileSync("/etc/letsencrypt/live/ipagar.ddns.net/fullchain.pem"),
// };
http.createServer(app).listen(process.env.PORT);
