import * as SurveyAdministrationService from "../services/survey-administration-service"
import * as SurveyResultService from "../services/survey-result-service"
import { SurveyAdministrationStatus } from "../types/survey-administration-type"
import { SurveyResultStatus } from "../types/survey-result-type"
import WebSocket from "ws"

let wssInstance: WebSocket.Server | null = null

export const setWssForProcessingSurveyAdmin = (wss: WebSocket.Server) => {
  wssInstance = wss
}

export const sendSurveyEmailJob = async () => {
  const surveyAdministrations = await SurveyAdministrationService.getAllByStatus(
    SurveyAdministrationStatus.Processing
  )
  for (const surveyAdministration of surveyAdministrations) {
    await SurveyAdministrationService.updateStatusById(
      surveyAdministration.id,
      SurveyAdministrationStatus.Ongoing
    )

    await SurveyResultService.updateStatusByAdministrationId(
      surveyAdministration.id,
      SurveyResultStatus.Ongoing
    )

    await SurveyAdministrationService.sendSurveyEmailById(surveyAdministration.id)

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
}
