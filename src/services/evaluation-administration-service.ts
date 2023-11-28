import { type Prisma } from "@prisma/client"
import { format } from "date-fns"
import bcrypt from "bcrypt"
import * as EmailTemplateRepository from "../repositories/email-template-repository"
import * as EvaluationAdministrationRepository from "../repositories/evaluation-administration-repository"
import * as EvaluationResultRepository from "../repositories/evaluation-result-repository"
import * as EvaluationResultDetailsRepository from "../repositories/evaluation-result-detail-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"
import * as ExternalUserRepository from "../repositories/external-user-repository"
import * as UserRepository from "../repositories/user-repository"
import * as EvaluationResultDetailService from "../services/evaluation-result-detail-service"
import * as EvaluationResultService from "../services/evaluation-result-service"
import * as ExternalUserService from "../services/external-user-service"
import {
  EvaluationAdministrationStatus,
  type EvaluationAdministration,
} from "../types/evaluation-administration-type"
import { sendMail } from "../utils/sendgrid"
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

    const replacements: Record<string, string> = {
      evaluation_name: evaluationAdministration.name ?? "",
      eval_schedule_end_date: scheduleEndDate,
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

    const internalEvaluations = await EvaluationRepository.getAllDistinctByFilters(
      {
        evaluation_administration_id: evaluationAdministration.id,
        for_evaluation: true,
      },
      ["evaluator_id"]
    )

    for (const evaluation of internalEvaluations) {
      let modifiedContent: string = emailContent.replace(
        /{{(.*?)}}/g,
        (match: string, p1: string) => {
          return replacements[p1] ?? match
        }
      )
      modifiedContent = modifiedContent.replace(/(?:\r\n|\r|\n)/g, "<br>")
      const evaluator = await UserRepository.getById(evaluation.evaluator_id ?? 0)
      modifiedContent = modifiedContent.replace(
        "{{link}}",
        `${process.env.APP_URL}/evaluation-administrations/${evaluationAdministration.id}/evaluations/all`
      )
      modifiedContent = modifiedContent.replace("{{passcode}}", "")
      if (evaluator !== null) {
        await sendMail(
          evaluator.email,
          evaluationAdministration.email_subject ?? "",
          modifiedContent
        )
      }
    }

    const externalEvaluations = await EvaluationRepository.getAllDistinctByFilters(
      {
        evaluation_administration_id: evaluationAdministration.id,
        for_evaluation: true,
      },
      ["external_evaluator_id"]
    )

    for (const evaluation of externalEvaluations) {
      let modifiedContent: string = emailContent.replace(
        /{{(.*?)}}/g,
        (match: string, p1: string) => {
          return replacements[p1] ?? match
        }
      )
      modifiedContent = modifiedContent.replace(/(?:\r\n|\r|\n)/g, "<br>")
      const evaluator = await ExternalUserRepository.getById(evaluation.external_evaluator_id ?? 0)
      modifiedContent = modifiedContent.replace(
        "{{link}}",
        `${process.env.APP_URL}/external-evaluations/${evaluationAdministration.id}/evaluations/all?token=${evaluator?.access_token}`
      )

      if (evaluator !== null) {
        const code = await ExternalUserService.generateCode()
        const encryptedCode = await bcrypt.hash(code, 12)

        await ExternalUserRepository.updateCodeById(evaluator.id, encryptedCode)

        modifiedContent = modifiedContent.replace(
          "{{passcode}}",
          `The password to access the evaluation form is <b>${code}</b>`
        )
        await sendMail(
          evaluator.email,
          evaluationAdministration.email_subject ?? "",
          modifiedContent
        )
      }
    }
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

  await EvaluationRepository.deleteByAdministrationIdAndStatus(
    evaluationAdministration.id,
    EvaluationStatus.Excluded
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

  await EvaluationRepository.deleteByAdministrationIdAndStatus(
    evaluationAdministration.id,
    EvaluationStatus.Excluded
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

export const sendReminder = async (id: number) => {
  const evaluationAdministration = await EvaluationAdministrationRepository.getById(id)

  if (evaluationAdministration === null) {
    throw new CustomError("Id not found", 400)
  }

  const emailTemplate = await EmailTemplateRepository.getByTemplateType(
    "Performance Evaluation Reminder"
  )

  if (emailTemplate === null) {
    throw new CustomError("Template not found", 400)
  }

  const scheduleEndDate = format(
    evaluationAdministration.eval_schedule_end_date ?? new Date(),
    "EEEE, MMMM d, yyyy"
  )

  const internalEvaluations = await EvaluationRepository.getAllDistinctByFilters(
    {
      evaluation_administration_id: evaluationAdministration.id,
      for_evaluation: true,
      status: {
        in: [EvaluationStatus.Open, EvaluationStatus.Ongoing],
      },
    },
    ["evaluator_id"]
  )

  for (const evaluation of internalEvaluations) {
    const evaluator = await UserRepository.getById(evaluation.evaluator_id ?? 0)
    if (evaluator !== null) {
      const evaluations = await EvaluationRepository.getAllByFilters({
        evaluation_administration_id: evaluationAdministration.id,
        evaluator_id: evaluator.id,
        for_evaluation: true,
        status: {
          in: [EvaluationStatus.Open, EvaluationStatus.Ongoing],
        },
      })

      const evalueeList = []

      for (const e of evaluations) {
        const evaluee = await UserRepository.getById(e.evaluee_id ?? 0)
        if (evaluee !== null) {
          evalueeList.push(`- ${evaluee.last_name}, ${evaluee.first_name}`)
        }
      }

      let modifiedContent = emailTemplate.content ?? ""

      modifiedContent = modifiedContent.replace(
        "{{evaluator_first_name}}",
        `${evaluator.first_name}`
      )

      modifiedContent = modifiedContent.replace("{{evaluee_list}}", evalueeList.join("\n"))

      modifiedContent = modifiedContent.replace(/(?:\r\n|\r|\n)/g, "<br>")

      modifiedContent = modifiedContent.replace("{{evaluation_end_date}}", scheduleEndDate)

      await sendMail(evaluator.email, emailTemplate.subject ?? "", modifiedContent)
    }
  }

  const externalEvaluations = await EvaluationRepository.getAllDistinctByFilters(
    {
      evaluation_administration_id: evaluationAdministration.id,
      for_evaluation: true,
      status: {
        in: [EvaluationStatus.Open, EvaluationStatus.Ongoing],
      },
    },
    ["external_evaluator_id"]
  )

  for (const evaluation of externalEvaluations) {
    const evaluator = await ExternalUserRepository.getById(evaluation.external_evaluator_id ?? 0)
    if (evaluator !== null) {
      const evaluations = await EvaluationRepository.getAllByFilters({
        evaluation_administration_id: evaluationAdministration.id,
        for_evaluation: true,
        status: {
          in: [EvaluationStatus.Open, EvaluationStatus.Ongoing],
        },
        external_evaluator_id: evaluator.id,
      })

      const evalueeList = []

      for (const e of evaluations) {
        const evaluee = await UserRepository.getById(e.evaluee_id ?? 0)
        if (evaluee !== null) {
          evalueeList.push(`- ${evaluee.last_name}, ${evaluee.first_name}`)
        }
      }

      let modifiedContent = emailTemplate.content ?? ""

      modifiedContent = modifiedContent.replace(
        "{{evaluator_first_name}}",
        `${evaluator.first_name}`
      )

      modifiedContent = modifiedContent.replace("{{evaluee_list}}", evalueeList.join("\n"))

      modifiedContent = modifiedContent.replace(/(?:\r\n|\r|\n)/g, "<br>")

      modifiedContent = modifiedContent.replace("{{evaluation_end_date}}", scheduleEndDate)

      await sendMail(evaluator.email, emailTemplate.subject ?? "", modifiedContent)
    }
  }
}

export const getEvaluators = async (id: number) => {
  const evaluationAdministration = await EvaluationAdministrationRepository.getById(id)

  if (evaluationAdministration === null) {
    throw new CustomError("Id not found", 400)
  }

  const evaluators = []

  const internalEvaluations = await EvaluationRepository.getAllDistinctByFilters(
    {
      evaluation_administration_id: evaluationAdministration.id,
      for_evaluation: true,
    },
    ["evaluator_id"]
  )

  for (const evaluation of internalEvaluations) {
    const evaluator = await UserRepository.getById(evaluation.evaluator_id ?? 0)

    if (evaluator !== null) {
      const totalSubmitted = await EvaluationRepository.countAllByFilters({
        for_evaluation: true,
        evaluation_administration_id: evaluationAdministration.id,
        status: EvaluationStatus.Submitted,
        evaluator_id: evaluator.id,
      })

      const totalEvaluations = await EvaluationRepository.countAllByFilters({
        evaluation_administration_id: evaluationAdministration.id,
        for_evaluation: true,
        evaluator_id: evaluator.id,
      })

      evaluators.push({
        ...evaluator,
        totalSubmitted,
        totalEvaluations,
      })
    }
  }

  const externalEvaluations = await EvaluationRepository.getAllDistinctByFilters(
    {
      evaluation_administration_id: evaluationAdministration.id,
      for_evaluation: true,
    },
    ["external_evaluator_id"]
  )

  for (const evaluation of externalEvaluations) {
    const evaluator = await ExternalUserRepository.getById(evaluation.external_evaluator_id ?? 0)

    if (evaluator !== null) {
      const totalSubmitted = await EvaluationRepository.countAllByFilters({
        for_evaluation: true,
        evaluation_administration_id: evaluationAdministration.id,
        status: EvaluationStatus.Submitted,
        external_evaluator_id: evaluator.id,
      })

      const totalEvaluations = await EvaluationRepository.countAllByFilters({
        evaluation_administration_id: evaluationAdministration.id,
        for_evaluation: true,
        external_evaluator_id: evaluator.id,
      })

      evaluators.push({
        ...evaluator,
        totalSubmitted,
        totalEvaluations,
      })
    }
  }

  return evaluators
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
    const existingEvaluationCount = await EvaluationRepository.countAllByFilters({
      evaluation_administration_id: evaluationAdministration.id,
      evaluation_result_id: evaluationResult.id,
      evaluation_template_id: evaluationTemplate.id,
      external_evaluator_id: externalUser?.id,
    })
    if (externalUser !== null && existingEvaluationCount === 0) {
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
        status: EvaluationStatus.Draft,
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
