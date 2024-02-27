import * as EvaluationAdministrationService from "../services/evaluation-administration-service"
import * as EvaluationResultService from "../services/evaluation-result-service"
import * as EvaluationService from "../services/evaluation-service"

import { EvaluationAdministrationStatus } from "../types/evaluation-administration-type"
import { EvaluationResultStatus } from "../types/evaluation-result-type"
import { EvaluationStatus } from "../types/evaluation-type"
import WebSocket from "ws"

let wssInstance: WebSocket.Server | null = null

export const setWssForPendingEvalAdmin = (wss: WebSocket.Server) => {
  wssInstance = wss
}

export const updateEvaluationAdministrationsJob = async () => {
  const evaluationAdministrations = await EvaluationAdministrationService.getAllByStatusAndDate(
    EvaluationAdministrationStatus.Pending,
    new Date()
  )

  for (const evaluationAdministration of evaluationAdministrations) {
    await EvaluationAdministrationService.updateStatusById(
      evaluationAdministration.id,
      EvaluationAdministrationStatus.Ongoing
    )

    await EvaluationResultService.updateStatusByAdministrationId(
      evaluationAdministration.id,
      EvaluationResultStatus.Ongoing
    )

    await EvaluationService.updateStatusByAdministrationId(
      evaluationAdministration.id,
      EvaluationStatus.Open
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
