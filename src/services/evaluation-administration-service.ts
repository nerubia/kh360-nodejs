import { format } from "date-fns"
import * as EvaluationAdministrationRepository from "../repositories/evaluation-administration-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as UserRepository from "../repositories/user-repository"
import { sendMultipleMail } from "../utils/sendgrid"
import { type EvaluationAdministration } from "../types/evaluation-administration-type"

export const getAllByStatus = async (status: string, date: Date) => {
  return await EvaluationAdministrationRepository.getAllByStatus(status, date)
}

export const getById = async (id: number) => {
  return await EvaluationAdministrationRepository.getById(id)
}

export const create = async (data: EvaluationAdministration) => {
  return await EvaluationAdministrationRepository.create(data)
}

export const updateStatusById = async (id: number, status: string) => {
  await EvaluationAdministrationRepository.updateStatusById(id, status)
}

export const sendEvaluationEmailById = async (id: number) => {
  const evaluationAdministration = await EvaluationAdministrationRepository.getById(id)

  if (evaluationAdministration !== null) {
    const emailContent = evaluationAdministration.email_content ?? ""

    const scheduleEndDate = format(
      evaluationAdministration.eval_schedule_end_date ?? new Date(),
      "EEEE, MMMM d, yyyy"
    )

    const link = `${process.env.APP_URL}/evaluation-administrations/${evaluationAdministration.id}/evaluations/all`

    const replacements: Record<string, string> = {
      evaluation_name: evaluationAdministration.name ?? "",
      eval_schedule_end_date: scheduleEndDate,
      link: `<a href="${link}">${link}</a>`,
    }

    if (
      evaluationAdministration.eval_period_start_date !== null &&
      evaluationAdministration.eval_period_end_date !== null
    ) {
      const periodStartDate = format(
        evaluationAdministration.eval_period_start_date,
        "MMMM d, yyyy"
      )
      const periodEndDate = format(evaluationAdministration.eval_period_end_date, "MMMM d, yyyy")
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

    const evaluations = await EvaluationRepository.getAllByFilters({
      evaluation_administration_id: evaluationAdministration.id,
      for_evaluation: true,
    })

    const to: string[] = []

    for (const evaluation of evaluations) {
      const evaluator = await UserRepository.getById(evaluation.evaluator_id ?? 0)
      if (evaluator !== null) {
        to.push(evaluator.email)
      }
    }

    await sendMultipleMail(to, evaluationAdministration.email_subject ?? "", modifiedContent)
  }
}
