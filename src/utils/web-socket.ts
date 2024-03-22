import WebSocket from "ws"
import logger from "./logger"
import { type Application } from "express"
import http from "http"
import { setWssForPendingEvalAdmin } from "../jobs/update-evaluation-administrations-job"
import { setWssForProcessingEvalAdmin } from "../jobs/send-evaluation-email-job"
import { setWssForPendingSurveyAdmin } from "../jobs/update-survey-administrations-job"
import { setWssForProcessingSurveyAdmin } from "../jobs/send-survey-email-job"

const webSocketServer = (app: Application) => {
  const server = http.createServer(app)
  const wss = new WebSocket.Server({ path: "/ws", server })

  wss.on("connection", (ws: WebSocket) => {
    logger.info("WebSocket connected")

    // Handle incoming messages
    ws.on("message", (message: string) => {
      logger.info(`Received: ${message}`)

      // Broadcast the message to all connected clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message.toString())
        }
      })
    })

    setWssForPendingEvalAdmin(wss)
    setWssForProcessingEvalAdmin(wss)
    setWssForPendingSurveyAdmin(wss)
    setWssForProcessingSurveyAdmin(wss)

    // Handle WebSocket closing
    ws.on("close", () => {
      logger.info("WebSocket disconnected")
    })
  })

  return server
}

export default webSocketServer
