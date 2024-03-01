import { type Prisma } from "@prisma/client"
import { format } from "date-fns"
import bcrypt from "bcrypt"
import * as EmailLogRepository from "../repositories/email-log-repository"
import * as EmailTemplateRepository from "../repositories/email-template-repository"
import * as EvaluationAdministrationRepository from "../repositories/evaluation-administration-repository"
import * as EvaluationRatingRepository from "../repositories/evaluation-rating-repository"
import * as EvaluationResultRepository from "../repositories/evaluation-result-repository"
import * as EvaluationResultDetailsRepository from "../repositories/evaluation-result-detail-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"
import * as EvaluationTemplateContentsRepository from "../repositories/evaluation-template-content-repository"
import * as ExternalUserRepository from "../repositories/external-user-repository"
import * as ProjectMemberRepository from "../repositories/project-member-repository"
import * as ProjectRepository from "../repositories/project-repository"
import * as UserRepository from "../repositories/user-repository"
import * as EvaluationResultDetailService from "../services/evaluation-result-detail-service"
import * as EvaluationResultService from "../services/evaluation-result-service"
import * as EvaluationService from "../services/evaluation-service"
import * as ExternalUserService from "../services/external-user-service"
import {
  EvaluationAdministrationStatus,
  type EvaluationAdministration,
} from "../types/evaluation-administration-type"
import { sendMail } from "../utils/sendgrid"
import CustomError from "../utils/custom-error"
import { EvaluationResultStatus } from "../types/evaluation-result-type"
import { EvaluationStatus } from "../types/evaluation-type"
import { type Decimal } from "@prisma/client/runtime/library"
import { EmailLogType, type EmailLog } from "../types/email-log-type"

export const getAllByStatusAndDate = async (status: string, date: Date) => {
  return await EvaluationAdministrationRepository.getAllByStatusAndDate(status, date)
}

export const getAllByStatus = async (status: string) => {
  return await EvaluationAdministrationRepository.getAllByStatus(status)
}

export const getAllByFilters = async (name: string, status: string, page: string) => {
  const itemsPerPage = 10
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where = {
    name: {
      contains: name,
    },
  }

  if (status !== undefined && status !== "all") {
    const statuses = status.split(",")
    Object.assign(where, {
      status: {
        in: statuses,
      },
    })
  }

  const evaluationAdministrations = await EvaluationAdministrationRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const finalEvaluationAdministrations = await Promise.all(
    evaluationAdministrations.map(async (evaluationAdministration) => {
      const evaluees_count = await EvaluationResultRepository.countByAdministrationId(
        evaluationAdministration.id
      )

      return {
        ...evaluationAdministration,
        evaluees_count,
      }
    })
  )

  const totalItems = await EvaluationAdministrationRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: finalEvaluationAdministrations,
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
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
        `<a href='${process.env.APP_URL}/evaluation-administrations/${evaluationAdministration.id}/evaluations/all'>link</a>`
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
        `<a href='${process.env.APP_URL}/external-evaluations/${evaluationAdministration.id}/evaluations/all?token=${evaluator?.access_token}'>link</a>`
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

export const generateUpdate = async (id: number) => {
  const evaluationAdministration = await EvaluationAdministrationRepository.getById(id)

  if (evaluationAdministration !== null) {
    if (evaluationAdministration === null) {
      throw new CustomError("Invalid id.", 400)
    }

    const evaluations = await EvaluationRepository.getAllByFilters({
      evaluation_administration_id: id,
      for_evaluation: true,
    })

    const evaluationResults = await EvaluationResultRepository.getAllByFilters({
      evaluation_administration_id: evaluationAdministration.id,
    })

    if (evaluations?.length === 0) {
      throw new CustomError("Add atleast 1 evaluator.", 400)
    }

    const currentDate = new Date()

    const evaluationRatings: Array<{
      evaluation_administration_id: number
      evaluation_id: number
      evaluation_template_id: number | null
      evaluation_template_content_id: number
      percentage: Decimal | null
      created_at: Date
      updated_at: Date
    }> = []

    if (evaluationResults !== null) {
      for (const evaluationResult of evaluationResults) {
        const evaluations = await EvaluationRepository.getAllByFilters({
          evaluation_result_id: evaluationResult.id,
          for_evaluation: true,
          status: EvaluationStatus.Draft,
        })

        for (const evaluation of evaluations) {
          const existingEvaluationRatings = await EvaluationRatingRepository.getAllByFilters({
            evaluation_id: evaluation.id,
          })

          if (existingEvaluationRatings.length === 0) {
            const evaluationTemplateContents =
              await EvaluationTemplateContentsRepository.getAllByFilters({
                evaluation_template_id: evaluation.evaluation_template_id,
                is_active: true,
              })

            for (const evaluationTemplateContent of evaluationTemplateContents) {
              evaluationRatings.push({
                evaluation_administration_id: evaluationAdministration.id,
                evaluation_id: evaluation.id,
                evaluation_template_id: evaluation.evaluation_template_id,
                evaluation_template_content_id: evaluationTemplateContent.id,
                percentage: evaluationTemplateContent.rate,
                created_at: currentDate,
                updated_at: currentDate,
              })
            }
          }
        }
      }
    }

    await EvaluationRatingRepository.createMany(evaluationRatings)

    const emailTemplate = await EmailTemplateRepository.getByTemplateType("Create New Evaluation")

    const emailContent = emailTemplate?.content ?? ""

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
        status: EvaluationStatus.Draft,
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
        `<a href='${process.env.APP_URL}/evaluation-administrations/${evaluationAdministration.id}/evaluations/all'>link</a>`
      )
      modifiedContent = modifiedContent.replace("{{passcode}}", "")
      if (evaluator !== null) {
        await sendMail(evaluator.email, emailTemplate?.subject ?? "", modifiedContent)
      }
      await EvaluationRepository.updateById(evaluation.id, {
        status:
          evaluationAdministration.eval_schedule_start_date != null &&
          evaluationAdministration.eval_schedule_start_date > currentDate
            ? EvaluationStatus.Pending
            : EvaluationStatus.Open,
        updated_at: currentDate,
      })
    }

    const externalEvaluations = await EvaluationRepository.getAllDistinctByFilters(
      {
        evaluation_administration_id: evaluationAdministration.id,
        status: EvaluationStatus.Draft,
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
        `<a href='${process.env.APP_URL}/external-evaluations/${evaluationAdministration.id}/evaluations/all?token=${evaluator?.access_token}'>link</a>`
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
      await EvaluationRepository.updateById(evaluation.id, {
        status:
          evaluationAdministration.eval_schedule_start_date != null &&
          evaluationAdministration.eval_schedule_start_date > currentDate
            ? EvaluationStatus.Pending
            : EvaluationStatus.Open,
        updated_at: currentDate,
      })
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

  const evaluations = await EvaluationRepository.getAllByFilters({
    evaluation_administration_id: evaluationAdministration.id,
    status: {
      in: [
        EvaluationStatus.Pending,
        EvaluationStatus.Open,
        EvaluationStatus.Ongoing,
        EvaluationStatus.ForRemoval,
      ],
    },
  })

  for (const evaluation of evaluations) {
    await EvaluationRepository.updateById(evaluation.id, {
      zscore: 0,
      status: EvaluationStatus.Expired,
    })
  }

  await EvaluationRepository.deleteByAdministrationIdAndStatus(
    evaluationAdministration.id,
    EvaluationStatus.Excluded
  )

  const evaluationResults = await EvaluationResultRepository.getAllByEvaluationAdministrationId(
    evaluationAdministration.id
  )

  for (const evaluationResult of evaluationResults) {
    await EvaluationResultDetailService.calculateScore(evaluationResult.id)
    await EvaluationResultDetailService.calculateScoreRating(evaluationResult.id)
    await EvaluationResultService.calculateScore(evaluationResult.id)
    await EvaluationResultService.calculateScoreRating(evaluationResult.id)
  }

  await EvaluationService.calculateZscore(evaluationAdministration.id)

  for (const evaluationResult of evaluationResults) {
    await EvaluationResultDetailService.calculateZscore(evaluationResult.id)
    await EvaluationResultService.calculateZScore(evaluationResult.id)
  }

  await EvaluationAdministrationRepository.updateStatusById(
    evaluationAdministration.id,
    EvaluationAdministrationStatus.Closed
  )
}

export const publish = async (id: number) => {
  const evaluationAdministration = await EvaluationAdministrationRepository.getById(id)

  if (evaluationAdministration === null) {
    throw new CustomError("Id not found", 400)
  }

  if (evaluationAdministration.status !== EvaluationAdministrationStatus.Closed) {
    throw new CustomError("Only close status is allowed.", 403)
  }

  const emailTemplate = await EmailTemplateRepository.getByTemplateType(
    "Publish Evaluation Results"
  )

  if (emailTemplate === null) {
    throw new CustomError("Email template not found", 400)
  }

  const evaluationResults = await EvaluationResultRepository.getAllByEvaluationAdministrationId(
    evaluationAdministration.id
  )

  for (const evaluationResult of evaluationResults) {
    const evaluee = await UserRepository.getById(evaluationResult.user_id ?? 0)
    if (evaluee !== null) {
      let modifiedContent = emailTemplate.content ?? ""
      modifiedContent = modifiedContent.replace("{{evaluee_first_name}}", `${evaluee.first_name}`)
      modifiedContent = modifiedContent.replace(
        "{{link}}",
        `<a href='${process.env.APP_URL}/my-evaluations/${evaluationResult.id}'>link</a>`
      )
      modifiedContent = modifiedContent.replace(/(?:\r\n|\r|\n)/g, "<br>")
      await sendMail(evaluee.email, emailTemplate.subject ?? "", modifiedContent)
    }
  }

  await EvaluationAdministrationRepository.updateStatusById(
    evaluationAdministration.id,
    EvaluationAdministrationStatus.Published
  )
}

export const reopen = async (id: number) => {
  const evaluationAdministration = await EvaluationAdministrationRepository.getById(id)

  if (evaluationAdministration === null) {
    throw new CustomError("Id not found", 400)
  }

  if (
    evaluationAdministration.status !== EvaluationAdministrationStatus.Closed &&
    evaluationAdministration.status !== EvaluationAdministrationStatus.Published
  ) {
    throw new CustomError("Only closed and published statuses are allowed.", 400)
  }

  const evaluations = await EvaluationRepository.getAllByFilters({
    evaluation_administration_id: evaluationAdministration.id,
  })

  for (const evaluation of evaluations) {
    const evaluationRatings = await EvaluationRatingRepository.aggregateSumByEvaluationId(
      evaluation.id,
      {
        score: true,
      }
    )

    const data = {
      zscore: 0,
      weighted_zscore: 0,
    }

    if (evaluation.status === EvaluationStatus.Expired) {
      Object.assign(data, {
        status:
          Number(evaluationRatings._sum.score) > 0
            ? EvaluationStatus.Ongoing
            : EvaluationStatus.Open,
      })
    }

    await EvaluationRepository.updateById(evaluation.id, data)
  }

  await EvaluationResultDetailsRepository.updateByAdministrationId(evaluationAdministration.id, {
    score_ratings_id: null,
    zscore: 0,
    weighted_zscore: 0,
    banding: "",
  })

  await EvaluationResultRepository.updateByAdministrationId(evaluationAdministration.id, {
    score_ratings_id: null,
    zscore: 0,
    banding: "",
    status: EvaluationResultStatus.Ongoing,
  })

  await EvaluationAdministrationRepository.updateStatusById(
    evaluationAdministration.id,
    EvaluationAdministrationStatus.Ongoing
  )
}

export const sendReminderByEvaluator = async (
  id: number,
  user_id: number,
  is_external: boolean
) => {
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

  const filter = {
    evaluation_administration_id: evaluationAdministration.id,
    for_evaluation: true,
    status: {
      in: [EvaluationStatus.Open, EvaluationStatus.Ongoing],
    },
    ...(is_external ? { external_evaluator_id: user_id } : { evaluator_id: user_id }),
  }

  const evaluation = await EvaluationRepository.getByFilters(filter)

  const evaluator =
    evaluation?.is_external === true
      ? await ExternalUserRepository.getById(evaluation.external_evaluator_id ?? 0)
      : await UserRepository.getById(evaluation?.evaluator_id ?? 0)
  if (evaluator !== null) {
    const evaluations = await EvaluationRepository.getAllByFilters(filter)

    const evalueeList = []

    const newEvaluations = await Promise.all(
      evaluations.map(async (evaluation) => {
        const evaluee = await UserRepository.getById(evaluation.evaluee_id ?? 0)
        const project = await ProjectRepository.getById(evaluation.project_id ?? 0)
        return {
          ...evaluation,
          evaluee,
          project,
        }
      })
    )

    newEvaluations.sort((a, b) => {
      const lastNameComparison = (a.evaluee?.last_name ?? "").localeCompare(
        b.evaluee?.last_name ?? ""
      )
      if (lastNameComparison !== 0) {
        return lastNameComparison
      }
      const firstNameComparison = (a.evaluee?.first_name ?? "").localeCompare(
        b.evaluee?.first_name ?? ""
      )
      if (firstNameComparison !== 0) {
        return firstNameComparison
      }
      const projectComparison = (a.project?.name ?? "").localeCompare(b.project?.name ?? "")
      if (projectComparison !== 0) {
        return projectComparison
      }
      const dateA = a.eval_start_date ?? new Date(0)
      const dateB = b.eval_start_date ?? new Date(0)
      return dateA.getTime() - dateB.getTime()
    })

    for (const e of newEvaluations) {
      const evaluee = await UserRepository.getById(e.evaluee_id ?? 0)

      const evaluationTemplate = await EvaluationTemplateRepository.getById(
        e.evaluation_template_id ?? 0
      )

      const project = await ProjectRepository.getById(e?.project_id ?? 0)
      let projectName = ""
      if (project !== null) {
        projectName = ` for ${project.name}`
      }

      const existingRecords = evaluations.filter((ev) => ev.evaluee_id === e.evaluee_id)
      let fromDate = ""
      if (existingRecords.length >= 2) {
        fromDate = ` from ${format(e.eval_start_date ?? new Date(), "MMMM d")} - ${format(
          e.eval_end_date ?? new Date(),
          "MMMM d, yyyy"
        )}`
      }

      if (evaluee !== null) {
        evalueeList.push(
          `- ${evaluee.last_name}, ${evaluee.first_name} (${evaluationTemplate?.display_name}${projectName}${fromDate})`
        )
      }
    }

    let modifiedContent = emailTemplate.content ?? ""

    if (evaluation?.is_external === true) {
      const externalEvaluator = await ExternalUserRepository.getById(
        evaluation.external_evaluator_id ?? 0
      )
      modifiedContent = modifiedContent.replace(
        "{{link}}",
        `<a href='${process.env.APP_URL}/external-evaluations/${evaluationAdministration.id}/evaluations/all?token=${externalEvaluator?.access_token}'>link</a>`
      )
    } else {
      modifiedContent = modifiedContent.replace(
        "{{link}}",
        `<a href='${process.env.APP_URL}/evaluation-administrations/${evaluationAdministration.id}/evaluations/all'>link</a>`
      )
    }

    modifiedContent = modifiedContent.replace("{{evaluator_first_name}}", `${evaluator.first_name}`)

    modifiedContent = modifiedContent.replace(
      "{{evaluee_list}}",
      `<div style="margin-left: 20px">${evalueeList.join("\n")}</div>`
    )

    modifiedContent = modifiedContent.replace(/(?:\r\n|\r|\n)/g, "<br>")

    modifiedContent = modifiedContent.replace("{{evaluation_end_date}}", scheduleEndDate)

    const currentDate = new Date()
    const emailLogData: EmailLog = {
      content: modifiedContent,
      created_at: currentDate,
      email_address: evaluator.email,
      email_status: EmailLogType.Pending,
      email_type: emailTemplate.template_type,
      mail_id: "",
      notes: `{"evaluation_administration_id": ${evaluationAdministration.id}}`,
      sent_at: currentDate,
      subject: emailTemplate.subject,
      updated_at: currentDate,
      user_id: evaluator.id,
    }

    const sgResp = await sendMail(evaluator.email, emailTemplate.subject ?? "", modifiedContent)
    if (sgResp !== null && sgResp !== undefined) {
      const mailId = sgResp[0].headers["x-message-id"]
      emailLogData.mail_id = mailId
      emailLogData.email_status = EmailLogType.Sent
    } else {
      emailLogData.email_status = EmailLogType.Error
    }

    await EmailLogRepository.create(emailLogData)

    return emailLogData
  }
}

export const sendReminders = async (id: number) => {
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
        status: {
          in: [EvaluationStatus.Submitted, EvaluationStatus.Reviewed],
        },
        evaluator_id: evaluator.id,
      })

      const totalEvaluations = await EvaluationRepository.countAllByFilters({
        evaluation_administration_id: evaluationAdministration.id,
        for_evaluation: true,
        evaluator_id: evaluator.id,
        status: {
          notIn: [EvaluationStatus.Removed],
        },
      })

      const email_logs = await EmailLogRepository.getAllByEmail(evaluator.email)

      evaluators.push({
        ...evaluator,
        totalSubmitted,
        totalEvaluations,
        is_external: evaluation.is_external,
        email_logs,
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
        status: {
          in: [EvaluationStatus.Submitted, EvaluationStatus.Reviewed],
        },
        external_evaluator_id: evaluator.id,
      })

      const totalEvaluations = await EvaluationRepository.countAllByFilters({
        evaluation_administration_id: evaluationAdministration.id,
        for_evaluation: true,
        external_evaluator_id: evaluator.id,
      })

      const email_logs = await EmailLogRepository.getAllByEmail(evaluator.email)

      evaluators.push({
        ...evaluator,
        totalSubmitted,
        totalEvaluations,
        is_external: evaluation.is_external,
        email_logs,
      })
    }
  }

  return evaluators
}

export const addEvaluator = async (
  id: number,
  evaluation_template_id: number,
  evaluation_result_id: number,
  evaluee_id: number,
  project_member_id: number | null,
  user_id: number,
  is_external: boolean
) => {
  const evaluationAdministration = await EvaluationAdministrationRepository.getById(id)

  if (evaluationAdministration === null) {
    throw new CustomError("Evaluation administration not found", 400)
  }

  const evaluationTemplate = await EvaluationTemplateRepository.getById(evaluation_template_id)

  if (evaluationTemplate === null) {
    throw new CustomError("Evaluation template not found", 400)
  }

  const evaluationResult = await EvaluationResultRepository.getById(evaluation_result_id)

  if (evaluationResult === null) {
    throw new CustomError("Evaluation result not found", 400)
  }

  const evaluee = await UserRepository.getById(evaluee_id)

  if (evaluee === null) {
    throw new CustomError("Evaluee not found", 400)
  }

  const user = is_external
    ? await ExternalUserRepository.getById(user_id)
    : await UserRepository.getById(user_id)

  if (user === null) {
    throw new CustomError("User not found", 400)
  }

  let projectMember = null

  if (evaluationTemplate.id !== 11 && evaluationTemplate.id !== 12) {
    projectMember = await ProjectMemberRepository.getById(project_member_id ?? 0)
    if (projectMember === null) {
      throw new CustomError("Please select a project.", 400)
    }
  }

  const currentDate = new Date()

  const existingEvaluation = await EvaluationRepository.getByFilters({
    evaluation_template_id: evaluationTemplate.id,
    evaluation_administration_id: evaluationAdministration.id,
    evaluation_result_id: evaluationResult.id,
    evaluator_id: !is_external ? user.id : null,
    evaluee_id: evaluee.id,
    project_id: projectMember !== null ? projectMember.project_id : null,
    project_member_id: projectMember !== null ? projectMember.id : null,
  })

  if (existingEvaluation !== null) {
    throw new CustomError("This evaluator already exists.", 400)
  }

  await EvaluationRepository.create({
    evaluation_template_id: evaluationTemplate.id,
    evaluation_administration_id: evaluationAdministration.id,
    evaluation_result_id: evaluationResult.id,
    evaluator_id: !is_external ? user.id : null,
    evaluee_id: evaluee.id,
    project_id: projectMember !== null ? projectMember.project_id : null,
    project_member_id: projectMember !== null ? projectMember.id : null,
    for_evaluation: true,
    eval_start_date:
      projectMember !== null
        ? (projectMember.start_date ?? 0) < (evaluationAdministration.eval_period_start_date ?? 0)
          ? evaluationAdministration.eval_period_start_date
          : projectMember.start_date
        : evaluationAdministration.eval_period_start_date,
    eval_end_date:
      projectMember !== null
        ? (projectMember.end_date ?? 0) > (evaluationAdministration.eval_period_end_date ?? 0)
          ? evaluationAdministration.eval_period_end_date
          : projectMember.end_date
        : evaluationAdministration.eval_period_end_date,
    percent_involvement: projectMember !== null ? projectMember.allocation_rate : null,
    status: EvaluationStatus.Draft,
    submission_method: null,
    is_external,
    external_evaluator_id: is_external ? user.id : null,
    created_at: currentDate,
    updated_at: currentDate,
  })
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
    const projectsCount = await ProjectMemberRepository.countByFilters({
      user_id: evaluationResult.user_id,
      project_role_id: evaluationTemplate.evaluee_role_id,
      OR: [
        {
          start_date: {
            gte: evaluationAdministration.eval_period_start_date ?? new Date(),
            lte: evaluationAdministration.eval_period_end_date ?? new Date(),
          },
        },
        {
          end_date: {
            gte: evaluationAdministration.eval_period_start_date ?? new Date(),
            lte: evaluationAdministration.eval_period_end_date ?? new Date(),
          },
        },
        {
          start_date: { lte: evaluationAdministration.eval_period_start_date ?? new Date() },
          end_date: { gte: evaluationAdministration.eval_period_end_date ?? new Date() },
        },
        {
          start_date: { gte: evaluationAdministration.eval_period_start_date ?? new Date() },
          end_date: { lte: evaluationAdministration.eval_period_end_date ?? new Date() },
        },
      ],
    })
    const existingEvaluationResultDetailsCount =
      await EvaluationResultDetailsRepository.countByFilters({
        evaluation_administration_id: evaluationAdministration.id,
        user_id: evaluee.id,
        evaluation_result_id: evaluationResult.id,
        evaluation_template_id: evaluationTemplate.id,
      })
    if (
      externalUser !== null &&
      (projectsCount === 0 || existingEvaluationCount !== projectsCount)
    ) {
      await EvaluationRepository.create({
        evaluation_template_id: evaluationTemplate.id,
        evaluation_administration_id: evaluationAdministration.id,
        evaluation_result_id: evaluationResult.id,
        evaluee_id: evaluee.id,
        project_id: null,
        for_evaluation: true,
        eval_start_date: null,
        eval_end_date: null,
        percent_involvement: null,
        status: EvaluationStatus.Draft,
        submission_method: null,
        is_external: true,
        external_evaluator_id: externalUser.id,
        created_at: currentDate,
        updated_at: currentDate,
      })

      if (existingEvaluationResultDetailsCount === 0) {
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
}
