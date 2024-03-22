import * as SurveyAdministrationService from "../services/survey-administration-service"
import * as SurveyResultService from "../services/survey-result-service"
import * as SurveyAnswerService from "../services/survey-answer-service"

import { SurveyAdministrationStatus } from "../types/survey-administration-type"
import { SurveyResultStatus } from "../types/survey-result-type"
import { SurveyAnswerStatus } from "../types/survey-answer-type"
import WebSocket from "ws"

let wssInstance: WebSocket.Server | null = null

export const setWssForPendingSurveyAdmin = (wss: WebSocket.Server) => {
  wssInstance = wss
}

export const updateSurveyAdministrationsJob = async () => {
  const pendingSurveyAdministrations = await SurveyAdministrationService.getAllByStatusAndDate(
    SurveyAdministrationStatus.Pending,
    new Date()
  )

  for (const pendingSurveyAdministration of pendingSurveyAdministrations) {
    await SurveyAdministrationService.updateStatusById(
      pendingSurveyAdministration.id,
      SurveyAdministrationStatus.Ongoing
    )

    await SurveyResultService.updateStatusByAdministrationId(
      pendingSurveyAdministration.id,
      SurveyResultStatus.Ongoing
    )

    await SurveyAnswerService.updateStatusByAdministrationId(
      pendingSurveyAdministration.id,
      SurveyAnswerStatus.Open
    )

    await SurveyAdministrationService.sendSurveyEmailById(pendingSurveyAdministration.id)

    if (wssInstance !== null) {
      const message = JSON.stringify({
        event: "setSurveyAdministrationToOngoing",
        data: "setSurveyAdministrationToOngoing",
      })

      wssInstance.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message)
        }
      })
    }
  }

  const surveyAdministrationsToClose = await SurveyAdministrationService.getAllByStatusAndEndDate(
    SurveyAdministrationStatus.Ongoing,
    new Date()
  )

  for (const surveyAdministrationToClose of surveyAdministrationsToClose) {
    await SurveyAdministrationService.close(surveyAdministrationToClose.id)

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