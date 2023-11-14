import * as EvaluationAdministrationService from "../services/evaluation-administration-service"
import * as EvaluationResultService from "../services/evaluation-result-service"
import * as EvaluationService from "../services/evaluation-service"

import { EvaluationAdministrationStatus } from "../types/evaluation-administration-type"
import { EvaluationResultStatus } from "../types/evaluationResultType"
import { EvaluationStatus } from "../types/evaluationType"

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

    const evaluationResults = await EvaluationResultService.getAllByEvaluationAdministrationId(
      evaluationAdministration.id
    )

    for (const evaluationResult of evaluationResults) {
      await EvaluationResultService.updateStatusById(
        evaluationResult.id,
        EvaluationResultStatus.Ongoing
      )
    }

    const evaluations = await EvaluationService.getAllByAdministrationId(
      evaluationAdministration.id
    )

    for (const evaluation of evaluations) {
      await EvaluationService.updateStatusById(evaluation.id, EvaluationStatus.Open)
    }

    await EvaluationAdministrationService.sendEvaluationEmailById(evaluationAdministration.id)
  }
}
