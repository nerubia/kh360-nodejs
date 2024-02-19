import * as EvaluationAdministrationService from "../services/evaluation-administration-service"
import { EvaluationAdministrationStatus } from "../types/evaluation-administration-type"

export const sendEvaluationEmailJob = async () => {
  const evaluationAdministrations = await EvaluationAdministrationService.getAllByStatus(
    EvaluationAdministrationStatus.Processing
  )
  for (const evaluationAdministration of evaluationAdministrations) {
    await EvaluationAdministrationService.updateStatusById(
      evaluationAdministration.id,
      EvaluationAdministrationStatus.Ongoing
    )

    // await EvaluationAdministrationService.sendEvaluationEmailById(evaluationAdministration.id)
  }
}
