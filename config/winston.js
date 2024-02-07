const appRoot = require("app-root-path");
const winston = require("winston");
const expressWinston = require("express-winston");
require("winston-daily-rotate-file");

// define the custom settings for each transport (file, console)
const options = {
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      winston.format.json(),
      winston.format.prettyPrint()
    ),
  },
};

const transport = new winston.transports.DailyRotateFile({
  filename: `${appRoot}/logs/application-%DATE%.log`,
  datePattern: "YYYY-MM-DD-HH",
  maxSize: "20m",
  maxFiles: "14d",
  handleExceptions: true,
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.json()
  ),
});

const transports = [transport];

if (process.env.ENV === "development") {
  transports.push(new winston.transports.Console(options.console));
}

const expressLogger = expressWinston.logger({
  transports,
  exitOnError: false,
});

const logger = winston.createLogger({
  transports,
  exitOnError: false,
});

expressWinston.requestWhitelist.push("body");
/// create a stream object with a 'write' function that will be used by `morgan`
expressLogger.stream = {
  write(message) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    expressLogger.info(message);
  },
};

module.exports = { expressLogger, logger };
