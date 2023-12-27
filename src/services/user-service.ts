import * as UserRepository from "../repositories/user-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as EvaluationAdministrationRepository from "../repositories/evaluation-administration-repository"
import * as EvaluationRatingRepository from "../repositories/evaluation-rating-repository"
import * as EvaluationResultRepository from "../repositories/evaluation-result-repository"
import * as EvaluationTemplateContentRepository from "../repositories/evaluation-template-content-repository"
import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"
import * as AnswerOptionRepository from "../repositories/answer-option-repository"
import * as EvaluationResultDetailService from "../services/evaluation-result-detail-service"
import * as EvaluationResultDetailRepository from "../repositories/evaluation-result-detail-repository"
import * as EmailTemplateRepository from "../repositories/email-template-repository"
import * as EvaluationResultService from "../services/evaluation-result-service"
import * as ExternalUserRepository from "../repositories/external-user-repository"
import * as ProjectRepository from "../repositories/project-repository"
import * as EmailRecipientRepository from "../repositories/email-recipient-repository"
import * as ScoreRatingRepository from "../repositories/score-rating-repository"
import * as SystemSettingsRepository from "../repositories/system-settings-repository"
import { EvaluationStatus } from "../types/evaluation-type"
import { submitEvaluationSchema } from "../utils/validation/evaluations/submit-evaluation-schema"
import { type UserToken } from "../types/user-token-type"
import { differenceInDays } from "date-fns"
import { EvaluationAdministrationStatus } from "../types/evaluation-administration-type"
import CustomError from "../utils/custom-error"
import { AnswerType } from "../types/answer-type"
import { sendMail } from "../utils/sendgrid"
import { formatDateRange } from "../utils/format-date"
import { format, utcToZonedTime } from "date-fns-tz"

export const getById = async (id: number) => {
  return await UserRepository.getById(id)
}

export const submitEvaluation = async (
  id: number,
  user: UserToken,
  answer_option_ids: number[],
  evaluation_rating_ids: number[],
  comment: string,
  recommendation: string,
  evaluation_rating_comments: string[],
  is_submitting: boolean
) => {
  const evaluation = await EvaluationRepository.getById(id)

  if (evaluation === null) {
    throw new CustomError("Invalid evaluation id.", 400)
  }

  if (user.is_external && user.id !== evaluation.external_evaluator_id) {
    throw new CustomError("You do not have permission to answer this.", 400)
  }

  if (!user.is_external && user.id !== evaluation.evaluator_id) {
    throw new CustomError("You do not have permission to answer this.", 400)
  }

  if (
    evaluation.status !== EvaluationStatus.Open &&
    evaluation.status !== EvaluationStatus.Ongoing
  ) {
    throw new CustomError("Only open and ongoing statuses are allowed.", 400)
  }

  if (is_submitting) {
    await submitEvaluationSchema.validate({
      answer_option_ids,
      comment,
    })
  }

  const evaluationRatings = await EvaluationRatingRepository.getAllByFilters({
    id: {
      in: evaluation_rating_ids,
    },
  })

  if (evaluation?.id !== undefined) {
    await EvaluationRepository.updateById(evaluation.id, {
      comments: comment,
      recommendations: recommendation,
      status: EvaluationStatus.Ongoing,
      updated_at: new Date(),
    })
    Object.assign(evaluation, {
      status: EvaluationStatus.Ongoing,
    })
  }

  for (const [index, evaluationRating] of evaluationRatings.entries()) {
    const answerOptionId = answer_option_ids[index]
    const answerOption = await AnswerOptionRepository.getById(answerOptionId ?? 0)
    const comments = evaluation_rating_comments[index] ?? ""

    if (is_submitting) {
      await submitEvaluationSchema.validate({
        answerOption,
        comments,
      })
    }

    const rate = Number(answerOption?.rate ?? 0)
    const percentage =
      answerOption?.answer_type === AnswerType.NA && is_submitting
        ? 0
        : Number(evaluationRating.percentage ?? 0)
    const score = rate * percentage

    if (answerOption?.id !== undefined) {
      await EvaluationRatingRepository.updateById(evaluationRating.id, {
        answer_option_id: answerOption?.id,
        rate,
        score,
        comments,
        percentage,
        updated_at: new Date(),
      })
    }
  }

  if (is_submitting && evaluation !== null) {
    const answerOptions = await AnswerOptionRepository.getAllByFilters({
      id: {
        in: answer_option_ids,
      },
    })

    const isAllNa = answerOptions.every((answer) => answer.answer_type === AnswerType.NA)

    let score = 0
    let weight = 0
    let weighted_score = 0
    const currentDate = new Date()

    if (!isAllNa) {
      const evaluationRatings = await EvaluationRatingRepository.aggregateSumByEvaluationId(
        evaluation.id,
        {
          score: true,
          percentage: true,
        }
      )

      const computed_score = (
        Number(evaluationRatings._sum.score) / Number(evaluationRatings._sum.percentage)
      ).toFixed(2)

      score = Number(computed_score)

      const evaluationAdministration = await EvaluationAdministrationRepository.getById(
        evaluation.evaluation_administration_id ?? 0
      )

      if (evaluationAdministration === null) {
        throw new CustomError("Invalid id.", 400)
      }

      const totalEvaluationAdministrationDays =
        differenceInDays(
          new Date(evaluationAdministration.eval_period_end_date ?? 0),
          new Date(evaluationAdministration.eval_period_start_date ?? 0)
        ) + 1

      const totalEvaluationDays =
        differenceInDays(
          new Date(evaluation.eval_end_date ?? 0),
          new Date(evaluation.eval_start_date ?? 0)
        ) + 1

      weight =
        (totalEvaluationDays / totalEvaluationAdministrationDays) *
        Number(evaluation.percent_involvement)

      weighted_score = weight * Number(score)
    }

    await EvaluationRepository.updateById(evaluation.id, {
      score,
      weight,
      weighted_score,
      status: EvaluationStatus.Submitted,
      submission_method: "Manual",
      submitted_date: currentDate,
      updated_at: currentDate,
    })

    const remainingEvaluations = await EvaluationRepository.countAllByFilters({
      evaluation_result_id: evaluation.evaluation_result_id,
      status: {
        in: [
          EvaluationStatus.Draft,
          EvaluationStatus.Pending,
          EvaluationStatus.Open,
          EvaluationStatus.Ongoing,
        ],
      },
    })

    if (remainingEvaluations === 0 && evaluation.evaluation_result_id !== null) {
      await EvaluationResultDetailService.calculateScore(evaluation.evaluation_result_id)
      await EvaluationResultService.calculateScore(evaluation.evaluation_result_id)
    }

    const filter = {
      evaluation_administration_id: evaluation.evaluation_administration_id,
      for_evaluation: true,
      status: {
        in: [EvaluationStatus.Open, EvaluationStatus.Ongoing, EvaluationStatus.ForRemoval],
      },
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

    const userRemainingEvaluations = await EvaluationRepository.countAllByFilters(filter)

    if (userRemainingEvaluations === 0) {
      const evaluationAdministration = await EvaluationAdministrationRepository.getById(
        evaluation.evaluation_administration_id ?? 0
      )

      const emailTemplate = await EmailTemplateRepository.getByTemplateType(
        "Evaluation Completed by Evaluator"
      )

      if (evaluationAdministration !== null && emailTemplate !== null) {
        const emailSubject = emailTemplate.subject ?? ""
        const emailContent = emailTemplate.content ?? ""

        const systemSettings = await SystemSettingsRepository.getByName("default_timezone")

        const targetTimeZone = systemSettings?.value ?? "+08:00"

        const convertedDate = utcToZonedTime(currentDate, targetTimeZone)

        const replacements: Record<string, string> = {
          evaluator_last_name: user.last_name,
          evaluator_first_name: user.first_name,
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
          await sendMail(emailRecipient.email, modifiedSubject, modifiedContent)
        }
      }
    }

    Object.assign(evaluation, {
      status: EvaluationStatus.Submitted,
    })
  }

  return evaluation
}

export const getEvaluationResult = async (user: UserToken, id: number) => {
  const evaluationResult =
    await EvaluationResultRepository.getByEvaluationAdministrationIdAndUserId(id, user.id)

  if (evaluationResult === null) {
    throw new CustomError("Invalid evaluation id.", 400)
  }

  const evaluee = await UserRepository.getById(evaluationResult.user_id ?? 0)
  const evaluationAdministration = await EvaluationAdministrationRepository.getById(id)
  const evaluations = await EvaluationRepository.getAllByFilters({
    evaluation_result_id: evaluationResult.id,
    for_evaluation: true,
  })
  const evaluationTemplateIds = evaluations.map((evaluation) => evaluation.evaluation_template_id)
  const evaluationResultDetails = await EvaluationResultDetailRepository.getAllByFilters({
    evaluation_result_id: evaluationResult.id,
    evaluation_template_id: {
      in: evaluationTemplateIds as number[],
    },
  })

  const finalEvaluationResultDetails = await Promise.all(
    evaluationResultDetails.map(async (detail) => {
      const evaluation_template = await EvaluationTemplateRepository.getById(
        detail.evaluation_template_id ?? 0
      )
      const evaluation_template_contents =
        await EvaluationTemplateContentRepository.getByEvaluationTemplateId(
          evaluation_template?.id ?? 0
        )

      const finalEvaluationTemplateContents = await Promise.all(
        evaluation_template_contents.map(async (content) => {
          const evaluationRatingIds = []
          const evaluationRatings = await EvaluationRatingRepository.getAllByFilters({
            evaluation_template_content_id: content.id,
          })
          for (const evaluationRating of evaluationRatings) {
            if (evaluationRating.answer_option_id !== null) {
              const answerOption = await AnswerOptionRepository.getById(
                evaluationRating.answer_option_id
              )
              if (answerOption?.answer_type !== AnswerType.NA) {
                evaluationRatingIds.push(evaluationRating.id)
              }
            }
          }
          const evaluationRatingsAverage =
            await EvaluationRatingRepository.getAverageScoreByTemplateContent(
              {
                rate: true,
              },
              {
                id: {
                  in: evaluationRatingIds,
                },
              }
            )

          const average_rate = Math.round((Number(evaluationRatingsAverage._avg.rate) / 10) * 100)

          return {
            name: content.name,
            description: content.description,
            average_rate,
          }
        })
      )

      const score_rating = await ScoreRatingRepository.getById(detail.score_ratings_id ?? 0)

      if (score_rating === null) {
        throw new CustomError("Score rating not found", 400)
      }

      return {
        id: detail.id,
        score: detail.score,
        zscore: detail.zscore,
        banding: detail.banding,
        template_name: evaluation_template?.display_name,
        evaluation_template_contents: finalEvaluationTemplateContents,
        total_score: Math.round((Number(detail.score) / 10) * 100),
        score_rating,
      }
    })
  )

  if (evaluee === null) {
    throw new CustomError("Evaluee not found", 400)
  }

  if (evaluationAdministration === null) {
    throw new CustomError("Evaluation administration not found", 400)
  }

  if (evaluations === null) {
    throw new CustomError("Evaluations not found", 400)
  }

  if (evaluationResultDetails.length === 0) {
    throw new CustomError("Evaluation result details not found", 400)
  }

  const comments = evaluations
    .map((evaluation) => evaluation.comments)
    .filter((comment) => comment !== null && comment.length > 0)

  const score_rating = await ScoreRatingRepository.getById(evaluationResult.score_ratings_id ?? 0)

  Object.assign(evaluationResult, {
    users: evaluee,
    eval_period_start_date: evaluationAdministration.eval_period_start_date,
    eval_period_end_date: evaluationAdministration.eval_period_end_date,
    comments,
    evaluation_result_details: finalEvaluationResultDetails,
    status: evaluationAdministration.status,
    eval_admin_name: evaluationAdministration.name,
    total_score: Math.round((Number(evaluationResult.score) / 10) * 100),
    score_rating,
  })

  return evaluationResult
}

export const getEvaluationAdministrationsAsEvaluee = async (user: UserToken, page: number) => {
  const itemsPerPage = 20
  const currentPage = isNaN(page) || page < 0 ? 1 : page

  const evaluations = await EvaluationRepository.getAllByFilters({
    for_evaluation: true,
    evaluee_id: user.id,
  })

  const evaluationAdministrationIds = evaluations.map(
    (evaluation) => evaluation.evaluation_administration_id
  )

  const evaluationAdministrations = await EvaluationAdministrationRepository.getAllByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    {
      id: {
        in: evaluationAdministrationIds as number[],
      },
      status: EvaluationAdministrationStatus.Published,
    }
  )

  const finalEvaluationAdministrations = await Promise.all(
    evaluationAdministrations.map(async (evaluationAdministration) => {
      const totalEvaluations = await EvaluationRepository.countAllByFilters({
        evaluation_administration_id: evaluationAdministration.id,
        for_evaluation: true,
        evaluee_id: user.id,
      })

      const totalSubmitted = await EvaluationRepository.countAllByFilters({
        for_evaluation: true,
        evaluation_administration_id: evaluationAdministration.id,
        status: EvaluationStatus.Submitted,
        evaluee_id: user.id,
      })

      const totalPending = await EvaluationRepository.countAllByFilters({
        for_evaluation: true,
        evaluation_administration_id: evaluationAdministration.id,
        status: {
          in: [EvaluationStatus.Open, EvaluationStatus.Ongoing],
        },
        evaluee_id: user.id,
      })

      const evaluationResult =
        await EvaluationResultRepository.getByEvaluationAdministrationIdAndUserId(
          evaluationAdministration.id,
          user.id
        )

      return {
        id: evaluationAdministration.id,
        name: evaluationAdministration.name,
        eval_period_start_date: evaluationAdministration.eval_period_start_date,
        eval_period_end_date: evaluationAdministration.eval_period_end_date,
        eval_schedule_start_date: evaluationAdministration.eval_schedule_start_date,
        eval_schedule_end_date: evaluationAdministration.eval_schedule_end_date,
        remarks: evaluationAdministration.remarks,
        totalEvaluations,
        totalSubmitted,
        totalPending,
        banding: evaluationResult?.banding,
      }
    })
  )

  const totalItems = await EvaluationAdministrationRepository.countAllByFilters({
    id: {
      in: evaluationAdministrationIds as number[],
    },
    status: EvaluationAdministrationStatus.Published,
  })

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

export const getEvaluationAdministrations = async (user: UserToken, page: number) => {
  const itemsPerPage = 20
  const currentPage = isNaN(page) || page < 0 ? 1 : page

  const filter = {
    for_evaluation: true,
    ...(user.is_external ? { external_evaluator_id: user.id } : { evaluator_id: user.id }),
  }

  const evaluations = await EvaluationRepository.getAllByFilters(filter)

  const evaluationAdministrationIds = evaluations.map(
    (evaluation) => evaluation.evaluation_administration_id
  )

  const evaluationAdministrations = await EvaluationAdministrationRepository.getAllByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    {
      id: {
        in: evaluationAdministrationIds as number[],
      },
      status: EvaluationAdministrationStatus.Ongoing,
    }
  )

  const finalEvaluationAdministrations = await Promise.all(
    evaluationAdministrations.map(async (evaluationAdministration) => {
      const totalEvaluations = await EvaluationRepository.countAllByFilters({
        evaluation_administration_id: evaluationAdministration.id,
        for_evaluation: true,
        ...(user.is_external ? { external_evaluator_id: user.id } : { evaluator_id: user.id }),
        status: {
          notIn: [EvaluationStatus.Removed],
        },
      })

      const totalSubmitted = await EvaluationRepository.countAllByFilters({
        for_evaluation: true,
        evaluation_administration_id: evaluationAdministration.id,
        status: EvaluationStatus.Submitted,
        ...(user.is_external ? { external_evaluator_id: user.id } : { evaluator_id: user.id }),
      })

      const totalPending = await EvaluationRepository.countAllByFilters({
        for_evaluation: true,
        evaluation_administration_id: evaluationAdministration.id,
        status: {
          in: [
            EvaluationStatus.Open,
            EvaluationStatus.Ongoing,
            EvaluationStatus.Submitted,
            EvaluationStatus.ForRemoval,
          ],
        },
        ...(user.is_external ? { external_evaluator_id: user.id } : { evaluator_id: user.id }),
      })

      return {
        id: evaluationAdministration.id,
        name: evaluationAdministration.name,
        eval_period_start_date: evaluationAdministration.eval_period_start_date,
        eval_period_end_date: evaluationAdministration.eval_period_end_date,
        eval_schedule_start_date: evaluationAdministration.eval_schedule_start_date,
        eval_schedule_end_date: evaluationAdministration.eval_schedule_end_date,
        remarks: evaluationAdministration.remarks,
        totalEvaluations,
        totalSubmitted,
        totalPending,
      }
    })
  )

  const totalItems = await EvaluationAdministrationRepository.countAllByFilters({
    id: {
      in: evaluationAdministrationIds as number[],
    },
    status: EvaluationAdministrationStatus.Ongoing,
  })

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

export const sendRequestToRemove = async (evaluation_id: number, comment: string) => {
  const evaluation = await EvaluationRepository.getById(evaluation_id)

  if (evaluation === null) {
    throw new CustomError("Id not found", 400)
  }

  await EvaluationRepository.updateById(evaluation_id, {
    comments: comment,
    updated_at: new Date(),
    status: EvaluationStatus.ForRemoval,
  })

  const project = await ProjectRepository.getById(evaluation.project_id ?? 0)
  const evaluationTemplate = await EvaluationTemplateRepository.getById(
    evaluation.evaluation_template_id ?? 0
  )
  const emailTemplate = await EmailTemplateRepository.getByTemplateType(
    "Request to Remove Evaluation"
  )

  if (evaluationTemplate === null) {
    throw new CustomError("Evaluation template not found", 400)
  }

  if (emailTemplate === null) {
    throw new CustomError("Email template not found", 400)
  }

  const evaluator =
    evaluation?.is_external === true
      ? await ExternalUserRepository.getById(evaluation.external_evaluator_id ?? 0)
      : await UserRepository.getById(evaluation?.evaluator_id ?? 0)
  const evaluee = await UserRepository.getById(evaluation?.evaluee_id ?? 0)

  if (evaluator === null) {
    throw new CustomError("Evaluator not found", 400)
  }

  if (evaluee === null) {
    throw new CustomError("Evaluee not found", 400)
  }

  const emailContent = emailTemplate.content ?? ""

  const dateRange = formatDateRange(
    evaluation.eval_start_date ?? new Date(),
    evaluation.eval_end_date ?? new Date()
  )

  const replacements: Record<string, string> = {
    evaluee_first_name: evaluee.first_name ?? "",
    evaluee_last_name: evaluee.last_name ?? "",
    template_display_name: evaluationTemplate.display_name ?? "",
    "project duration information": `Project Duration: ${dateRange}`,
    comments: comment,
    link: `<a href='${process.env.APP_URL}/admin/evaluation-administrations/${evaluation.evaluation_administration_id}/progress'>link</a>`,
    "evaluator first name": evaluator.first_name ?? "",
    evaluator_last_name: evaluator.last_name ?? "",
  }

  let modifiedContent: string = emailContent.replace(/{{(.*?)}}/g, (match: string, p1: string) => {
    return replacements[p1] ?? match
  })

  modifiedContent = modifiedContent.replace(
    "{{project name information}}\n",
    project?.name !== undefined ? `Project Name: ${project.name}\n` : ""
  )

  modifiedContent = modifiedContent.replace(/(?:\r\n|\r|\n)/g, "<br>")

  const emailRecipients = await EmailRecipientRepository.getAllByEmailType("KH360 Admin")

  if (emailRecipients.length === 0) {
    throw new CustomError("Recipients not found", 400)
  }

  for (const emailRecipient of emailRecipients) {
    await sendMail(emailRecipient.email, emailTemplate.subject ?? "", modifiedContent)
  }
}
