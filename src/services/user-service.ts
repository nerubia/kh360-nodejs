import * as UserRepository from "../repositories/user-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as EvaluationAdministrationRepository from "../repositories/evaluation-administration-repository"
import * as EvaluationRatingRepository from "../repositories/evaluation-rating-repository"
import * as AnswerOptionRepository from "../repositories/answer-option-repository"
import * as EvaluationResultDetailService from "../services/evaluation-result-detail-service"
import * as EvaluationResultService from "../services/evaluation-result-service"
import { EvaluationStatus } from "../types/evaluation-type"
import { submitEvaluationSchema } from "../utils/validation/evaluations/submit-evaluation-schema"
import { type UserToken } from "../types/user-token-type"
import { differenceInDays, endOfYear, startOfYear } from "date-fns"
import { EvaluationAdministrationStatus } from "../types/evaluation-administration-type"
import CustomError from "../utils/custom-error"
import { AnswerType } from "../types/answer-type"

export const getById = async (id: number) => {
  return await UserRepository.getById(id)
}

export const submitEvaluation = async (
  id: number,
  user: UserToken,
  answer_option_ids: number[],
  evaluation_rating_ids: number[],
  comment: string,
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
    evaluation.status !== EvaluationAdministrationStatus.Ongoing
  ) {
    throw new CustomError("Only open and ongoing statuses are allowed.", 400)
  }

  const evaluationRatings = await EvaluationRatingRepository.getAllByFilters({
    id: {
      in: evaluation_rating_ids,
    },
  })

  if (evaluation?.id !== undefined) {
    await EvaluationRepository.updateById(evaluation.id, {
      comments: comment,
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

    const rate = Number(answerOption?.rate ?? 0)
    const percentage =
      answerOption?.answer_type === AnswerType.NA && is_submitting
        ? 0
        : Number(evaluationRating.percentage ?? 0)
    const score = rate * percentage

    if (answerOption?.id !== undefined) {
      if (is_submitting) {
        await submitEvaluationSchema.validate({
          answerOption,
          comments,
        })
      }

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
    await submitEvaluationSchema.validate({
      answer_option_ids,
      comment,
    })

    const answerOptions = await AnswerOptionRepository.getAllByFilters({
      id: {
        in: answer_option_ids,
      },
    })

    const isAllNa = answerOptions.every((answer) => answer.answer_type === AnswerType.NA)

    let score = "0"
    let weight = 0
    let weighted_score = 0
    const currentDate = new Date()
    const totalDaysInAYear = differenceInDays(endOfYear(currentDate), startOfYear(currentDate)) + 1

    if (!isAllNa) {
      const evaluationRatings = await EvaluationRatingRepository.aggregateSumByEvaluationId(
        evaluation.id,
        {
          score: true,
          percentage: true,
        }
      )

      score = (
        Number(evaluationRatings._sum.score) / Number(evaluationRatings._sum.percentage)
      ).toFixed(2)

      const totalEvaluationDays =
        differenceInDays(
          new Date(evaluation.eval_end_date ?? 0),
          new Date(evaluation.eval_start_date ?? 0)
        ) + 1

      weight = (totalEvaluationDays / totalDaysInAYear) * Number(evaluation.percent_involvement)

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

    Object.assign(evaluation, {
      status: EvaluationStatus.Submitted,
    })
  }

  return evaluation
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
          in: [EvaluationStatus.Open, EvaluationStatus.Ongoing],
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
