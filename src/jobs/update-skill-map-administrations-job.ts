import * as SkillMapAdministrationService from "../services/skill-map-administration-service"
import * as SkillMapResultService from "../services/skill-map-result-service"
import * as SkillMapRatingService from "../services/skill-map-rating-service"

import { SkillMapAdministrationStatus } from "../types/skill-map-administration-type"
import { SkillMapResultStatus } from "../types/skill-map-result-type"
import { SkillMapRatingStatus } from "../types/skill-map-rating-type"
import WebSocket from "ws"

let wssInstance: WebSocket.Server | null = null

export const setWssForPendingSkillMapAdmin = (wss: WebSocket.Server) => {
  wssInstance = wss
}

export const updateSkillMapAdministrationsJob = async () => {
  const pendingSkillMapAdministrations = await SkillMapAdministrationService.getAllByStatusAndDate(
    SkillMapAdministrationStatus.Pending,
    new Date()
  )

  for (const pendingSkillMapAdministration of pendingSkillMapAdministrations) {
    await SkillMapAdministrationService.updateStatusById(
      pendingSkillMapAdministration.id,
      SkillMapAdministrationStatus.Ongoing
    )

    await SkillMapResultService.updateStatusByAdministrationId(
      pendingSkillMapAdministration.id,
      SkillMapResultStatus.Ongoing
    )

    await SkillMapRatingService.updateStatusByAdministrationId(
      pendingSkillMapAdministration.id,
      SkillMapRatingStatus.Open
    )

    await SkillMapAdministrationService.sendSkillMapEmailById(pendingSkillMapAdministration.id)

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

  const skillMapAdministrationsToClose =
    await SkillMapAdministrationService.getAllByStatusAndEndDate(
      SkillMapAdministrationStatus.Ongoing,
      new Date()
    )

  for (const skillMapAdministrationToClose of skillMapAdministrationsToClose) {
    await SkillMapAdministrationService.close(skillMapAdministrationToClose.id)

    if (wssInstance !== null) {
      const message = JSON.stringify({
        event: "closeSkillMapAdministration",
        data: "closeSkillMapAdministration",
      })

      wssInstance.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message)
        }
      })
    }
  }
}
