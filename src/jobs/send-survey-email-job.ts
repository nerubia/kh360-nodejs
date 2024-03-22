import * as SurveyAdministrationService from "../services/survey-administration-service"
import { SurveyAdministrationStatus } from "../types/survey-administration-type"
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
