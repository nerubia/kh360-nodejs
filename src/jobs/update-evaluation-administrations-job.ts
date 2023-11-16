import * as EvaluationAdministrationService from "../services/evaluation-administration-service"
import * as EvaluationResultService from "../services/evaluation-result-service"
import * as EvaluationService from "../services/evaluation-service"

import { EvaluationAdministrationStatus } from "../types/evaluation-administration-type"
import { EvaluationResultStatus } from "../types/evaluationResultType"
import { EvaluationStatus } from "../types/evaluation-type"

export const updateEvaluationAdministrationsJob = async () => {
  const evaluationAdministrations = await EvaluationAdministrationService.getAllByStatus(
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
  }
}
