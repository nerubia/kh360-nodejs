import "dotenv/config"
import app from "./app"
import "./utils/scheduler"
import logger from "./utils/logger"
import webSocketServer from "./utils/web-socket"

const PORT = process.env.PORT ?? 5000

/**
 * WebSocket
 */
const server = webSocketServer(app)

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})
