const appRoot = require("app-root-path");
const Winston = require("winston");
const expressWinston = require("express-winston");
require("winston-daily-rotate-file");

// define the custom settings for each transport (file, console)
const options = {
  file: {
    level: "info",
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

const transport = new Winston.transports.DailyRotateFile({
  filename: `${appRoot}/logs/application-%DATE%.log`,
  datePattern: "YYYY-MM-DD-HH",
  maxSize: "20m",
  maxFiles: "14d",
  level: "info",
  handleExceptions: true,
});

const transports = [transport];

if (process.env.ENV === "development") {
  transports.push(new Winston.transports.Console(options.console));
}

const logger = expressWinston.logger({
  transports,
  exitOnError: false,
});

expressWinston.requestWhitelist.push("body");
/// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write(message) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

module.exports = logger;
