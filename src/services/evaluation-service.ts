import { type Prisma } from "@prisma/client"
import * as EmailRecipientRepository from "../repositories/email-recipient-repository"
import * as EmailTemplateRepository from "../repositories/email-template-repository"
import * as EvaluationAdministrationRepository from "../repositories/evaluation-administration-repository"
import * as EvaluationRatingRepository from "../repositories/evaluation-rating-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"
import * as ExternalUserRepository from "../repositories/external-user-repository"
import * as UserRepository from "../repositories/user-repository"
import * as ProjectMemberRepository from "../repositories/project-member-repository"
import * as ProjectRepository from "../repositories/project-repository"
import * as ProjectRoleRepository from "../repositories/project-role-repository"
import * as SystemSettingsRepository from "../repositories/system-settings-repository"
import { EvaluationStatus, type Evaluation } from "../types/evaluation-type"
import { type UserToken } from "../types/user-token-type"
import CustomError from "../utils/custom-error"
import { calculateNorms } from "../utils/calculate-norms"
import { formatDateRange } from "../utils/format-date"
import { sendMail } from "../utils/sendgrid"
import { format, utcToZonedTime } from "date-fns-tz"
import { EmailSender } from "../types/email-sender"

export const getById = async (id: number) => {
  return await EvaluationRepository.getById(id)
}

export const getAllByFilters = async (where: Prisma.evaluationsWhereInput) => {
  return await EvaluationRepository.getAllByFilters(where)
}

export const getEvaluations = async (
  evaluation_administration_id: number,
  evaluator_id: number,
  external_evaluator_id: number,
  evaluation_template_id: number,
  evaluation_result_id: number,
  for_evaluation: boolean
) => {
  let where = {}

  if (!isNaN(evaluator_id)) {
    where = {
      evaluator_id,
      evaluation_administration_id,
    }
  } else if (!isNaN(external_evaluator_id)) {
    where = {
      external_evaluator_id,
      evaluation_administration_id,
    }
  } else if (!isNaN(evaluation_template_id)) {
    where = {
      evaluation_template_id,
      evaluation_result_id,
    }
  } else {
    where = {
      evaluation_result_id,
    }
  }

  Object.assign(where, {
    deleted_at: null,
  })

  if (for_evaluation) {
    Object.assign(where, {
      for_evaluation,
    })
  }

  const evaluations = await EvaluationRepository.getAllByFilters(where)

  const finalEvaluations = await Promise.all(
    evaluations.map(async (evaluation) => {
      const evaluator =
        evaluation.is_external === true
          ? await ExternalUserRepository.getById(evaluation.external_evaluator_id ?? 0)
          : await UserRepository.getById(evaluation.evaluator_id ?? 0)

      const evaluee = await UserRepository.getById(evaluation.evaluee_id ?? 0)
      const project = await ProjectRepository.getById(evaluation.project_id ?? 0)
      const projectRole = await ProjectRoleRepository.getById(
        evaluation.project_members?.project_role_id ?? 0
      )

      const template = await EvaluationTemplateRepository.getById(
        evaluation.evaluation_template_id ?? 0
      )

      const hasForEval = await EvaluationRepository.hasForEvaluation(
        evaluation.evaluation_administration_id ?? 0,
        evaluation.evaluation_result_id ?? 0
      )

      return {
        id: evaluation.id,
        eval_start_date: evaluation.eval_start_date,
        eval_end_date: evaluation.eval_end_date,
        percent_involvement: evaluation.percent_involvement,
        status: evaluation.status,
        for_evaluation: evaluation.for_evaluation,
        is_external: evaluation.is_external,
        evaluator,
        evaluee,
        project,
        project_role: projectRole,
        external_evaluator_id: evaluation.external_evaluator_id,
        template,
        comments: evaluation.comments,
        hasForEvaluation: hasForEval,
      }
    })
  )

  return finalEvaluations
}

export const getUserEvaluations = async (
  user: UserToken,
  evaluation_administration_id: number,
  for_evaluation: boolean
) => {
  const filter = {
    evaluation_administration_id,
    for_evaluation,
    status: {
      in: [
        EvaluationStatus.Open,
        EvaluationStatus.Ongoing,
        EvaluationStatus.Submitted,
        EvaluationStatus.ForRemoval,
      ],
    },
    deleted_at: null,
  }

  if (user.is_external) {
    Object.assign(filter, {
      external_evaluator_id: user.id,
    })
  } else {
    Object.assign(filter, {
      evaluator_id: user.id,
    })
  }

  const evaluations = await EvaluationRepository.getAllByFilters(filter)

  const finalEvaluations = await Promise.all(
    evaluations.map(async (evaluation) => {
      const evaluator = user.is_external
        ? await ExternalUserRepository.getById(evaluation.external_evaluator_id ?? 0)
        : await UserRepository.getById(evaluation.evaluator_id ?? 0)
      const evaluee = await UserRepository.getById(evaluation.evaluee_id ?? 0)
      const project = await ProjectRepository.getById(evaluation.project_id ?? 0)
      const projectRole = await ProjectRoleRepository.getById(
        evaluation.project_members?.project_role_id ?? 0
      )

      const template = await EvaluationTemplateRepository.getById(
        evaluation.evaluation_template_id ?? 0
      )

      if (template?.evaluee_role_id !== null) {
        const project_role = await ProjectRoleRepository.getById(template?.evaluee_role_id ?? 0)
        Object.assign(template ?? 0, {
          project_role,
        })
      }

      return {
        id: evaluation.id,
        comments: evaluation.comments,
        recommendations: evaluation.recommendations,
        eval_start_date: evaluation.eval_start_date,
        eval_end_date: evaluation.eval_end_date,
        percent_involvement: evaluation.percent_involvement,
        status: evaluation.status,
        for_evaluation: evaluation.for_evaluation,
        evaluator,
        evaluee,
        project,
        project_role: projectRole,
        template,
      }
    })
  )

  return finalEvaluations
}

export const getAllDistinctByFilters = async (
  where: Prisma.evaluationsWhereInput,
  distinct: Prisma.EvaluationsScalarFieldEnum | Prisma.EvaluationsScalarFieldEnum[]
) => {
  return await EvaluationRepository.getAllDistinctByFilters(where, distinct)
}

export const updateProjectById = async (
  id: number,
  project_id: number,
  project_member_id: number
) => {
  const evaluation = await EvaluationRepository.getById(id)

  if (evaluation === null) {
    throw new CustomError("Id not found", 400)
  }

  const evaluationAdministration = await EvaluationAdministrationRepository.getById(
    evaluation.evaluation_administration_id ?? 0
  )

  if (evaluationAdministration === null) {
    throw new CustomError("Id not found", 400)
  }

  const project = await ProjectRepository.getById(project_id)

  if (project === null) {
    throw new CustomError("Id not found", 400)
  }

  const projectMember = await ProjectMemberRepository.getById(project_member_id)

  if (projectMember === null) {
    throw new CustomError("Id not found", 400)
  }

  const eval_start_date =
    (projectMember.start_date ?? 0) < (evaluationAdministration.eval_period_start_date ?? 0)
      ? evaluationAdministration.eval_period_start_date
      : projectMember.start_date
  const eval_end_date =
    (projectMember.end_date ?? 0) > (evaluationAdministration.eval_period_end_date ?? 0)
      ? evaluationAdministration.eval_period_end_date
      : projectMember.end_date
  const percent_involvement = Number(projectMember.allocation_rate) ?? 100

  await EvaluationRepository.updateProjectById(
    evaluation.id,
    project.id,
    projectMember.id,
    eval_start_date,
    eval_end_date,
    percent_involvement
  )

  return {
    id: evaluation.id,
    eval_start_date,
    eval_end_date,
    percent_involvement,
    project,
  }
}

export const updateById = async (id: number, data: Evaluation) => {
  await EvaluationRepository.updateById(id, data)
}

export const updateStatusById = async (id: number, status: string) => {
  await EvaluationRepository.updateStatusById(id, status)
}

export const updateStatusByAdministrationId = async (
  evaluation_administration_id: number,
  status: string
) => {
  await EvaluationRepository.updateStatusByAdministrationId(evaluation_administration_id, status)
}

export const setForEvaluations = async (ids: number[], for_evaluation: boolean) => {
  await EvaluationRepository.updateEvaluations(ids, {
    status: for_evaluation ? EvaluationStatus.Draft : EvaluationStatus.Excluded,
    for_evaluation,
  })
}

export const deleteById = async (id: number) => {
  const evaluation = await EvaluationRepository.getById(id)

  if (evaluation === null) {
    throw new CustomError("Id not found", 400)
  }

  await EvaluationRepository.deleteById(id)
}

export const countAllByFilters = async (where: Prisma.evaluationsWhereInput) => {
  return await EvaluationRepository.countAllByFilters(where)
}

export const aggregateSumByFilters = async (
  _sum: Prisma.EvaluationsSumAggregateInputType,
  where: Prisma.evaluationsWhereInput
) => {
  return await EvaluationRepository.aggregateSumByFilters(_sum, where)
}

export const calculateZscore = async (evaluation_administration_id: number) => {
  const uniqueInternalEvaluations = await EvaluationRepository.getAllDistinctByFilters(
    {
      evaluation_administration_id,
      status: EvaluationStatus.Submitted,
      is_external: false,
    },
    ["evaluator_id"]
  )

  for (const uniqueEvaluation of uniqueInternalEvaluations) {
    const evaluations = await EvaluationRepository.getAllByFilters({
      evaluation_administration_id,
      evaluator_id: uniqueEvaluation.evaluator_id,
      status: EvaluationStatus.Submitted,
    })

    const scores = evaluations.map((evaluation) => Number(evaluation.score))
    const norms = await calculateNorms(scores)

    for (const evaluation of evaluations) {
      let zscore = 0
      let weighted_zscore = 0

      if (Number(evaluation.score) !== 0) {
        zscore = (Number(evaluation.score) - norms.mean) / norms.stdDev
        weighted_zscore = zscore * Number(evaluation.weight)
      }

      await EvaluationRepository.updateZScoreById(
        evaluation.id,
        isNaN(zscore) ? 0 : zscore,
        isNaN(weighted_zscore) ? 0 : weighted_zscore
      )
    }
  }

  const uniqueExternalEvaluations = await EvaluationRepository.getAllDistinctByFilters(
    {
      evaluation_administration_id,
      status: EvaluationStatus.Submitted,
      is_external: true,
    },
    ["external_evaluator_id"]
  )

  for (const uniqueEvaluation of uniqueExternalEvaluations) {
    const evaluations = await EvaluationRepository.getAllByFilters({
      evaluation_administration_id,
      external_evaluator_id: uniqueEvaluation.external_evaluator_id,
      status: EvaluationStatus.Submitted,
    })

    const scores = evaluations.map((evaluation) => Number(evaluation.score))
    const norms = await calculateNorms(scores)

    for (const evaluation of evaluations) {
      let zscore = 0
      let weighted_zscore = 0

      if (Number(evaluation.score) !== 0) {
        zscore = (Number(evaluation.score) - norms.mean) / norms.stdDev
        weighted_zscore = zscore * Number(evaluation.weight)
      }

      await EvaluationRepository.updateZScoreById(
        evaluation.id,
        isNaN(zscore) ? 0 : zscore,
        isNaN(weighted_zscore) ? 0 : weighted_zscore
      )
    }
  }
}

export const approve = async (id: number) => {
  const evaluation = await EvaluationRepository.getById(id)

  if (evaluation === null) {
    throw new CustomError("Id not found", 400)
  }

  if (evaluation.status !== EvaluationStatus.ForRemoval) {
    throw new CustomError("Invalid status", 400)
  }

  const evaluationTemplate = await EvaluationTemplateRepository.getById(
    evaluation.evaluation_template_id ?? 0
  )

  if (evaluationTemplate === null) {
    throw new CustomError("Template not found", 400)
  }

  const evaluee = await UserRepository.getById(evaluation.evaluee_id ?? 0)

  if (evaluee === null) {
    throw new CustomError("Evaluee not found", 400)
  }

  const evaluator =
    evaluation.is_external === true
      ? await ExternalUserRepository.getById(evaluation.external_evaluator_id ?? 0)
      : await UserRepository.getById(evaluation.evaluator_id ?? 0)

  if (evaluator === null) {
    throw new CustomError("Evaluator not found", 400)
  }

  const emailTemplate = await EmailTemplateRepository.getByTemplateType(
    "Approved Request to Remove Evaluee"
  )

  if (emailTemplate === null) {
    throw new CustomError("Email template not found", 400)
  }

  const project = await ProjectRepository.getById(evaluation.project_id ?? 0)

  const emailSubject = emailTemplate.subject ?? ""
  const emailContent = emailTemplate.content ?? ""

  let project_details = ""
  if (project !== null) {
    const projectDuration = formatDateRange(
      new Date(evaluation.eval_start_date ?? ""),
      new Date(evaluation.eval_end_date ?? "")
    )
    project_details = `for ${project.name} during ${projectDuration}`
  }

  const replacements: Record<string, string> = {
    template_name: evaluationTemplate.display_name ?? "",
    evaluee_first_name: evaluee.first_name ?? "",
    evaluee_last_name: evaluee.last_name ?? "",
    evaluator_first_name: evaluator.first_name ?? "",
    template_display_name: evaluationTemplate.display_name ?? "",
    project_details,
  }

  const modifiedSubject: string = emailSubject.replace(
    /{{(.*?)}}/g,
    (match: string, p1: string) => {
      return replacements[p1] ?? match
    }
  )
  let modifiedContent: string = emailContent.replace(/{{(.*?)}}/g, (match: string, p1: string) => {
    return replacements[p1] ?? match
  })
  modifiedContent = modifiedContent.replace(/(?:\r\n|\r|\n)/g, "<br>")

  const systemSettings = await SystemSettingsRepository.getByName(EmailSender.EVALUATION)

  await sendMail({
    to: [evaluator.email],
    from: systemSettings?.value,
    subject: modifiedSubject,
    content: modifiedContent,
  })

  await EvaluationRepository.updateStatusById(evaluation.id, EvaluationStatus.Removed)
  await EvaluationRatingRepository.resetByEvaluationId(evaluation.id)

  const filter = {
    evaluation_administration_id: evaluation.evaluation_administration_id,
    for_evaluation: true,
    status: {
      in: [EvaluationStatus.Open, EvaluationStatus.Ongoing, EvaluationStatus.ForRemoval],
    },
  }

  if (evaluation.is_external === true) {
    Object.assign(filter, {
      external_evaluator_id: evaluation.external_evaluator_id,
    })
  } else {
    Object.assign(filter, {
      evaluator_id: evaluation.evaluator_id,
    })
  }

  const userRemainingEvaluations = await EvaluationRepository.countAllByFilters(filter)

  if (userRemainingEvaluations === 0) {
    const evaluationAdministration = await EvaluationAdministrationRepository.getById(
      evaluation.evaluation_administration_id ?? 0
    )

    let emailTemplate = await EmailTemplateRepository.getByTemplateType(
      "Evaluation Completed by Evaluator"
    )

    const systemSettings = await SystemSettingsRepository.getByName(EmailSender.EVALUATION)

    if (evaluationAdministration !== null && emailTemplate !== null) {
      const currentDate = new Date()

      const emailSubject = emailTemplate.subject ?? ""
      const emailContent = emailTemplate.content ?? ""

      const defaultTimezone = await SystemSettingsRepository.getByName("default_timezone")

      const targetTimeZone = defaultTimezone?.value ?? "+08:00"

      const convertedDate = utcToZonedTime(currentDate, targetTimeZone)

      const replacements: Record<string, string> = {
        evaluator_last_name: evaluator.last_name ?? "",
        evaluator_first_name: evaluator.first_name ?? "",
        evaluation_administration_name: evaluationAdministration.name ?? "",
        submitted_date: format(convertedDate, "yyyy-MM-dd hh:mm:ss a", {
          timeZone: targetTimeZone,
        }),
      }

      const modifiedSubject: string = emailSubject.replace(
        /{{(.*?)}}/g,
        (match: string, p1: string) => {
          return replacements[p1] ?? match
        }
      )
      let modifiedContent: string = emailContent.replace(
        /{{(.*?)}}/g,
        (match: string, p1: string) => {
          return replacements[p1] ?? match
        }
      )

      modifiedContent = modifiedContent.replace(/(?:\r\n|\r|\n)/g, "<br>")

      const emailRecipients = await EmailRecipientRepository.getAllByEmailType("KH360 Admin")

      for (const emailRecipient of emailRecipients) {
        await sendMail({
          to: [emailRecipient.email],
          from: systemSettings?.value,
          subject: modifiedSubject,
          content: modifiedContent,
        })
      }
    }

    emailTemplate = await EmailTemplateRepository.getByTemplateType(
      evaluation.is_external === true
        ? "Evaluation Complete Thank You Message External"
        : "Evaluation Complete Thank You Message"
    )

    if (emailTemplate === null) {
      throw new CustomError("Email template not found", 400)
    }

    const emailSubject = emailTemplate.subject ?? ""
    const emailContent = emailTemplate.content ?? ""

    modifiedContent = emailContent.concat(`\n\nThanks and Best Regards,\nKH360 Admin`)
    modifiedContent = modifiedContent.replace(/(?:\r\n|\r|\n)/g, "<br>")

    await sendMail({
      to: [evaluator.email],
      from: systemSettings?.value,
      subject: emailSubject,
      content: modifiedContent,
    })
  }
}

export const decline = async (id: number) => {
  const evaluation = await EvaluationRepository.getById(id)

  if (evaluation === null) {
    throw new CustomError("Id not found", 400)
  }

  if (evaluation.status !== EvaluationStatus.ForRemoval) {
    throw new CustomError("Invalid status", 400)
  }

  const evaluationTemplate = await EvaluationTemplateRepository.getById(
    evaluation.evaluation_template_id ?? 0
  )

  if (evaluationTemplate === null) {
    throw new CustomError("Template not found", 400)
  }

  const evaluee = await UserRepository.getById(evaluation.evaluee_id ?? 0)

  if (evaluee === null) {
    throw new CustomError("Evaluee not found", 400)
  }

  const evaluator =
    evaluation.is_external === true
      ? await ExternalUserRepository.getById(evaluation.external_evaluator_id ?? 0)
      : await UserRepository.getById(evaluation.evaluator_id ?? 0)

  if (evaluator === null) {
    throw new CustomError("Evaluator not found", 400)
  }

  const emailTemplate = await EmailTemplateRepository.getByTemplateType(
    "Declined Request to Remove Evaluee"
  )

  if (emailTemplate === null) {
    throw new CustomError("Email template not found", 400)
  }

  const project = await ProjectRepository.getById(evaluation.project_id ?? 0)

  const emailSubject = emailTemplate.subject ?? ""
  const emailContent = emailTemplate.content ?? ""

  let project_details = ""
  if (project !== null) {
    const projectDuration = formatDateRange(
      new Date(evaluation.eval_start_date ?? ""),
      new Date(evaluation.eval_end_date ?? "")
    )
    project_details = `for ${project.name} during ${projectDuration}`
  }

  const replacements: Record<string, string> = {
    template_name: evaluationTemplate.display_name ?? "",
    evaluee_first_name: evaluee.first_name ?? "",
    evaluee_last_name: evaluee.last_name ?? "",
    evaluator_first_name: evaluator.first_name ?? "",
    template_display_name: evaluationTemplate.display_name ?? "",
    project_details,
  }

  const modifiedSubject: string = emailSubject.replace(
    /{{(.*?)}}/g,
    (match: string, p1: string) => {
      return replacements[p1] ?? match
    }
  )
  let modifiedContent: string = emailContent.replace(/{{(.*?)}}/g, (match: string, p1: string) => {
    return replacements[p1] ?? match
  })
  modifiedContent = modifiedContent.replace(/(?:\r\n|\r|\n)/g, "<br>")

  const systemSettings = await SystemSettingsRepository.getByName(EmailSender.EVALUATION)

  await sendMail({
    to: [evaluator.email],
    from: systemSettings?.value,
    subject: modifiedSubject,
    content: modifiedContent,
  })

  await EvaluationRepository.updateStatusById(evaluation.id, EvaluationStatus.Ongoing)
}
