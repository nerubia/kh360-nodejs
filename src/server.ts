import "dotenv/config"
import app from "./app"
import "./utils/scheduler"
import logger from "./utils/logger"
import webSocketServer from "./utils/web-socket"
import { connectRedis } from "./utils/redis"

const PORT = process.env.PORT ?? 5000

/**
 * WebSocket
 */
const server = webSocketServer(app)

void connectRedis()

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

process.on("SIGINT", () => {
  handleShutdownSignal("SIGINT")
})

process.on("SIGTERM", () => {
  handleShutdownSignal("SIGTERM")
})

const handleShutdownSignal = (signal: string) => {
  logger.info(`Received ${signal}. Closing server...`)
  server.close(() => {
    logger.info("Server closed gracefully.")
    process.exit(0)
  })
}
