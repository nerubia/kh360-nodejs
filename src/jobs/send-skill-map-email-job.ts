import * as SkillMapAdministrationService from "../services/skill-map-administration-service"
import * as SkillMapResultService from "../services/skill-map-result-service"
import { SkillMapAdministrationStatus } from "../types/skill-map-administration-type"
import { SkillMapResultStatus } from "../types/skill-map-result-type"
import WebSocket from "ws"

let wssInstance: WebSocket.Server | null = null

export const setWssForProcessingSkillMapAdmin = (wss: WebSocket.Server) => {
  wssInstance = wss
}

export const sendSkillMapEmailJob = async () => {
  const skillMapAdministrations = await SkillMapAdministrationService.getAllByStatus(
    SkillMapAdministrationStatus.Processing
  )
  for (const skillMapAdministration of skillMapAdministrations) {
    await SkillMapAdministrationService.updateStatusById(
      skillMapAdministration.id,
      SkillMapAdministrationStatus.Ongoing
    )

    await SkillMapResultService.updateStatusByAdministrationId(
      skillMapAdministration.id,
      SkillMapResultStatus.Ongoing
    )

    await SkillMapAdministrationService.sendSkillMapEmailById(skillMapAdministration.id)

    if (wssInstance !== null) {
      const message = JSON.stringify({
        event: "setSkillMapAdministrationToOngoing",
        data: "setSkillMapAdministrationToOngoing",
      })

      wssInstance.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message)
        }
      })
    }
  }
}
