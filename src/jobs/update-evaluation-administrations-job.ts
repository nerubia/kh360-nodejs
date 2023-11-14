import { format } from "date-fns"

import * as EvaluationAdministrationService from "../services/evaluation-administration-service"
import * as EvaluationResultService from "../services/evaluation-result-service"
import * as EvaluationService from "../services/evaluation-service"
import * as UserService from "../services/user-service"

import { EvaluationAdministrationStatus } from "../types/evaluationAdministrationType"
import { EvaluationResultStatus } from "../types/evaluationResultType"
import { EvaluationStatus } from "../types/evaluationType"
import { sendMail } from "../utils/sendgrid"

export const updateEvaluationAdministrationsJob = async () => {
  const evaluationAdministrations =
    await EvaluationAdministrationService.getAllByStatus(
      EvaluationAdministrationStatus.Pending,
      new Date()
    )

  for (const evaluationAdministration of evaluationAdministrations) {
    await EvaluationAdministrationService.updateStatusById(
      evaluationAdministration.id,
      EvaluationAdministrationStatus.Ongoing
    )

    const evaluationResults =
      await EvaluationResultService.getAllByEvaluationAdministrationId(
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
      await EvaluationService.updateStatusById(
        evaluation.id,
        EvaluationStatus.Open
      )

      const evaluator = await UserService.getById(evaluation.evaluator_id ?? 0)

      if (evaluator !== null) {
        const emailContent = evaluationAdministration.email_content ?? ""

        const replacements: Record<string, string> = {
          evaluation_name: evaluationAdministration.name ?? "",
          eval_schedule_end_date:
            evaluationAdministration.eval_schedule_end_date?.toString() ?? "",
          link: `<a href="http://localhost:3000/evaluation-administrations/${evaluationAdministration.id}">http://localhost:3000/evaluation-administrations/${evaluationAdministration.id}</a>`,
        }

        if (
          evaluationAdministration.eval_period_start_date !== null &&
          evaluationAdministration.eval_period_end_date !== null
        ) {
          const periodStartDate = format(
            evaluationAdministration.eval_period_start_date,
            "MMMM d, yyyy"
          )
          const periodEndDate = format(
            evaluationAdministration.eval_period_end_date,
            "MMMM d, yyyy"
          )
          Object.assign(replacements, {
            evaluation_period: `${periodStartDate} to ${periodEndDate}`,
          })
        }

        let modifiedContent: string = emailContent.replace(
          /{{(.*?)}}/g,
          (match: string, p1: string) => {
            return replacements[p1] ?? match
          }
        )

        modifiedContent = modifiedContent.replace(/(?:\r\n|\r|\n)/g, "<br>")

        await sendMail(
          evaluator.email,
          evaluationAdministration.email_subject ?? "",
          modifiedContent
        )
      }
    }
  }
}
