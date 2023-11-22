import { type Prisma } from "@prisma/client"
import { format } from "date-fns"
import * as EvaluationAdministrationRepository from "../repositories/evaluation-administration-repository"
import * as EvaluationResultRepository from "../repositories/evaluation-result-repository"
import * as EvaluationResultDetailsRepository from "../repositories/evaluation-result-detail-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"
import * as ExternalUserRepository from "../repositories/external-user-repository"
import * as UserRepository from "../repositories/user-repository"
import * as EvaluationResultDetailService from "../services/evaluation-result-detail-service"
import * as EvaluationResultService from "../services/evaluation-result-service"
import {
  EvaluationAdministrationStatus,
  type EvaluationAdministration,
} from "../types/evaluation-administration-type"
import { sendMultipleMail } from "../utils/sendgrid"
import CustomError from "../utils/custom-error"
import { EvaluationResultStatus } from "../types/evaluation-result-type"
import { EvaluationStatus } from "../types/evaluation-type"
import { Decimal } from "@prisma/client/runtime/library"

export const getAllByStatusAndDate = async (status: string, date: Date) => {
  return await EvaluationAdministrationRepository.getAllByStatusAndDate(status, date)
}

export const getAllByStatus = async (status: string) => {
  return await EvaluationAdministrationRepository.getAllByStatus(status)
}

export const getAllByFilters = async (
  skip: number,
  take: number,
  where: Prisma.evaluation_administrationsWhereInput
) => {
  return await EvaluationAdministrationRepository.getAllByFilters(skip, take, where)
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

export const countAllByFilters = async (where: Prisma.evaluation_administrationsWhereInput) => {
  return await EvaluationAdministrationRepository.countAllByFilters(where)
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

    const evaluations = await EvaluationRepository.getAllDistinctByFilters(
      {
        evaluation_administration_id: evaluationAdministration.id,
        for_evaluation: true,
      },
      ["evaluator_id"]
    )

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

export const cancel = async (id: number) => {
  const evaluationAdministration = await EvaluationAdministrationRepository.getById(id)

  if (evaluationAdministration === null) {
    throw new CustomError("Id not found", 400)
  }

  if (
    evaluationAdministration.status !== EvaluationAdministrationStatus.Pending &&
    evaluationAdministration.status !== EvaluationAdministrationStatus.Ongoing
  ) {
    throw new CustomError("Only pending and ongoing statuses are allowed.", 403)
  }

  await EvaluationAdministrationRepository.updateStatusById(
    evaluationAdministration.id,
    EvaluationAdministrationStatus.Cancelled
  )

  await EvaluationResultRepository.updateStatusByAdministrationId(
    evaluationAdministration.id,
    EvaluationResultStatus.Cancelled
  )

  await EvaluationRepository.updateStatusByAdministrationId(
    evaluationAdministration.id,
    EvaluationStatus.Cancelled
  )
}

export const close = async (id: number) => {
  const evaluationAdministration = await EvaluationAdministrationRepository.getById(id)

  if (evaluationAdministration === null) {
    throw new CustomError("Id not found", 400)
  }

  if (evaluationAdministration.status !== EvaluationAdministrationStatus.Ongoing) {
    throw new CustomError("Only ongoing status is allowed.", 403)
  }

  await EvaluationRepository.updateStatusByAdministrationId(
    evaluationAdministration.id,
    EvaluationStatus.Expired
  )

  const evaluationResults = await EvaluationResultRepository.getAllByEvaluationAdministrationId(
    evaluationAdministration.id
  )

  for (const evaluationResult of evaluationResults) {
    await EvaluationResultDetailService.calculateScore(evaluationResult.id)
    await EvaluationResultService.calculateScore(evaluationResult.id)
  }

  await EvaluationAdministrationRepository.updateStatusById(
    evaluationAdministration.id,
    EvaluationAdministrationStatus.Closed
  )
}

export const addExternalEvaluators = async (
  id: number,
  evaluation_template_id: number,
  evaluation_result_id: number,
  evaluee_id: number,
  external_user_ids: string[]
) => {
  const evaluationAdministration = await EvaluationAdministrationRepository.getById(id)

  if (evaluationAdministration === null) {
    throw new CustomError("Id not found", 400)
  }

  const evaluationTemplate = await EvaluationTemplateRepository.getById(evaluation_template_id)

  if (evaluationTemplate === null) {
    throw new CustomError("Id not found", 400)
  }

  const evaluationResult = await EvaluationResultRepository.getById(evaluation_result_id)

  if (evaluationResult === null) {
    throw new CustomError("Id not found", 400)
  }

  const evaluee = await UserRepository.getById(evaluee_id)

  if (evaluee === null) {
    throw new CustomError("Id not found", 400)
  }

  const currentDate = new Date()

  for (const externalId of external_user_ids) {
    const externalUser = await ExternalUserRepository.getById(parseInt(externalId))
    if (externalUser !== null) {
      await EvaluationRepository.create({
        evaluation_template_id: evaluationTemplate.id,
        evaluation_administration_id: evaluationAdministration.id,
        evaluation_result_id: evaluationResult.id,
        evaluee_id: evaluee.id,
        project_id: null,
        for_evaluation: true,
        eval_start_date: evaluationAdministration.eval_period_start_date,
        eval_end_date: evaluationAdministration.eval_period_end_date,
        percent_involvement: new Decimal(100),
        status: EvaluationStatus.Excluded,
        submission_method: null,
        is_external: true,
        external_evaluator_id: externalUser.id,
        created_at: currentDate,
        updated_at: currentDate,
      })

      await EvaluationResultDetailsRepository.create({
        evaluation_administration_id: evaluationAdministration.id,
        user_id: evaluee.id,
        evaluation_result_id: evaluationResult.id,
        evaluation_template_id: evaluationTemplate.id,
        weight: evaluationTemplate.rate,
        created_at: currentDate,
        updated_at: currentDate,
      })
    }
  }
}
