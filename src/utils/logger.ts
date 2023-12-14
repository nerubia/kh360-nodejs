import winston from "winston"
import path from "path"

const rootDir = path.resolve(__dirname, "../..")

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

const logColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  debug: "blue",
}

const logger = winston.createLogger({
  levels: logLevels,
  format: winston.format.combine(winston.format.timestamp(), winston.format.simple()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`)
      ),
    }),
    new winston.transports.File({
      filename: path.join(rootDir, "app.log"),
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  ],
})

winston.addColors(logColors)

export default logger
