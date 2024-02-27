import * as EvaluationAdministrationService from "../services/evaluation-administration-service"
import { EvaluationAdministrationStatus } from "../types/evaluation-administration-type"
import WebSocket from "ws"

let wssInstance: WebSocket.Server | null = null

export const setWssForProcessingEvalAdmin = (wss: WebSocket.Server) => {
  wssInstance = wss
}

export const sendEvaluationEmailJob = async () => {
  const evaluationAdministrations = await EvaluationAdministrationService.getAllByStatus(
    EvaluationAdministrationStatus.Processing
  )
  for (const evaluationAdministration of evaluationAdministrations) {
    await EvaluationAdministrationService.updateStatusById(
      evaluationAdministration.id,
      EvaluationAdministrationStatus.Ongoing
    )

    await EvaluationAdministrationService.sendEvaluationEmailById(evaluationAdministration.id)

    if (wssInstance !== null) {
      const message = JSON.stringify({
        event: "setEvaluationAdministrationToOngoing",
        data: "setEvaluationAdministrationToOngoing",
      })

      wssInstance.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message)
        }
      })
    }
  }
}
