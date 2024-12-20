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
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf((info) => {
      const message =
        typeof info.message === "object" ? JSON.stringify(info.message, null, 2) : info.message
      return `${info.timestamp} [${info.level}]: ${message}`
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf((info) => {
          const message =
            typeof info.message === "object" ? JSON.stringify(info.message, null, 2) : info.message
          return `${info.timestamp} [${info.level}]: ${message}`
        })
      ),
    }),
    new winston.transports.File({
      filename: path.join(rootDir, "app.log"),
      format: winston.format.combine(winston.format.uncolorize(), winston.format.json()),
    }),
  ],
})

winston.addColors(logColors)

export default logger
