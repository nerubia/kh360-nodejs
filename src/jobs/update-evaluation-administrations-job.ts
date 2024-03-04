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
  const pendingEvaluationAdministrations =
    await EvaluationAdministrationService.getAllByStatusAndDate(
      EvaluationAdministrationStatus.Pending,
      new Date()
    )

  for (const pendingEvaluationAdministration of pendingEvaluationAdministrations) {
    await EvaluationAdministrationService.updateStatusById(
      pendingEvaluationAdministration.id,
      EvaluationAdministrationStatus.Ongoing
    )

    await EvaluationResultService.updateStatusByAdministrationId(
      pendingEvaluationAdministration.id,
      EvaluationResultStatus.Ongoing
    )

    await EvaluationService.updateStatusByAdministrationId(
      pendingEvaluationAdministration.id,
      EvaluationStatus.Open
    )

    await EvaluationAdministrationService.sendEvaluationEmailById(
      pendingEvaluationAdministration.id
    )

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

  const evaluationAdministrationsToClose =
    await EvaluationAdministrationService.getAllByStatusAndEndDate(
      EvaluationAdministrationStatus.Ongoing,
      new Date()
    )

  for (const evaluationAdministrationToClose of evaluationAdministrationsToClose) {
    await EvaluationAdministrationService.close(evaluationAdministrationToClose.id)

    if (wssInstance !== null) {
      const message = JSON.stringify({
        event: "closeEvaluationAdministration",
        data: "closeEvaluationAdministration",
      })

      wssInstance.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message)
        }
      })
    }
  }
}
