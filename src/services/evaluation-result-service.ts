import * as EvaluationAdministrationRepository from "../repositories/evaluation-administration-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as EvaluationResultRepository from "../repositories/evaluation-result-repository"
import * as EvaluationResultDetailRepository from "../repositories/evaluation-result-detail-repository"
import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"
import * as EvaluationRatingRepository from "../repositories/evaluation-rating-repository"
import * as ScoreRatingRepository from "../repositories/score-rating-repository"
import * as UserRepository from "../repositories/user-repository"
import * as EvaluationTemplateContentRepository from "../repositories/evaluation-template-content-repository"
import { EvaluationResultStatus, type EvaluationResult } from "../types/evaluation-result-type"
import * as AnswerOptionRepository from "../repositories/answer-option-repository"
import CustomError from "../utils/custom-error"
import { getBanding } from "../utils/calculate-norms"
import { EvaluationAdministrationStatus } from "../types/evaluation-administration-type"
import { type Prisma } from "@prisma/client"
import { type UserToken } from "../types/user-token-type"
import { AnswerType } from "../types/answer-type"

export const getAllByFilters = async (
  user: UserToken,
  evaluation_administration_id: string,
  name: string,
  status: string,
  score_ratings_id: string,
  banding: string,
  sort_by: string,
  page: string
) => {
  if (
    !user.roles.includes("kh360") &&
    !user.roles.includes("khv2_cm_admin") &&
    !user.roles.includes("khv2_cm")
  ) {
    throw new CustomError("You do not have permission to view this.", 400)
  }

  const evaluationResultStatus = status === "all" ? "" : status

  const itemsPerPage = 20
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where = {
    status: {
      contains: evaluationResultStatus,
    },
  }

  if (user.roles.includes("khv2_cm")) {
    Object.assign(where, {
      users: {
        user_details: {
          cm_id: user.id,
        },
      },
    })
  }

  if (evaluation_administration_id === undefined || evaluation_administration_id === "all") {
    const evaluationAdministrations = await EvaluationAdministrationRepository.getAllByStatuses([
      EvaluationAdministrationStatus.Closed,
      EvaluationAdministrationStatus.Published,
    ])
    const evaluationAdministrationIds = evaluationAdministrations.map(
      (evaluationAdministration) => evaluationAdministration.id
    )
    Object.assign(where, {
      evaluation_administration_id: {
        in: evaluationAdministrationIds,
      },
    })
  } else {
    Object.assign(where, {
      evaluation_administration_id: {
        in: [parseInt(evaluation_administration_id)],
      },
    })
  }

  if (name !== undefined) {
    Object.assign(where, {
      users: {
        OR: [
          {
            first_name: {
              contains: name,
            },
          },
          {
            last_name: {
              contains: name,
            },
          },
        ],
      },
    })
  }

  if (score_ratings_id !== undefined && score_ratings_id !== "all") {
    Object.assign(where, {
      score_ratings_id: parseInt(score_ratings_id),
    })
  }

  if (banding !== undefined && banding !== "all") {
    Object.assign(where, {
      banding,
    })
  }

  const orderBy: Prisma.evaluation_resultsOrderByWithRelationInput[] = []

  if (sort_by === undefined || sort_by === "all") {
    orderBy.push(
      {
        users: {
          last_name: "asc",
        },
      },
      {
        users: {
          first_name: "asc",
        },
      }
    )
  }

  if (sort_by === "score_asc") {
    orderBy.push({
      score: "asc",
    })
  }

  if (sort_by === "score_desc") {
    orderBy.push({
      score: "desc",
    })
  }

  if (sort_by === "standard_score_asc") {
    orderBy.push({
      zscore: "asc",
    })
  }

  if (sort_by === "standard_score_desc") {
    orderBy.push({
      zscore: "desc",
    })
  }

  const evaluationResults = await EvaluationResultRepository.getAllByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where,
    orderBy
  )

  const finalEvaluationResults = await Promise.all(
    evaluationResults.map(async (evaluationResult) => {
      const evaluation_administration = await EvaluationAdministrationRepository.getById(
        evaluationResult.id
      )
      return {
        ...evaluationResult,
        evaluation_administration,
      }
    })
  )

  const totalItems = await EvaluationResultRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: finalEvaluationResults,
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
  const evaluationResult = await EvaluationResultRepository.getById(id)

  if (evaluationResult === null) {
    throw new CustomError("Invalid evaluation id.", 400)
  }

  const evaluee = await UserRepository.getById(evaluationResult.user_id ?? 0)
  const evaluationAdministration = await EvaluationAdministrationRepository.getById(
    evaluationResult.evaluation_administration_id ?? 0
  )
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

  const comments = evaluations
    .map((evaluation) => evaluation.comments)
    .filter((comment) => comment !== null && comment.length > 0)

  const recommendations = evaluations
    .map((evaluation) => evaluation.recommendations)
    .filter((recommendation) => recommendation !== null && recommendation.length > 0)

  const score_rating = await ScoreRatingRepository.getById(evaluationResult.score_ratings_id ?? 0)

  Object.assign(evaluationResult, {
    users: evaluee,
    eval_period_start_date: evaluationAdministration.eval_period_start_date,
    eval_period_end_date: evaluationAdministration.eval_period_end_date,
    comments,
    recommendations,
    evaluation_result_details: finalEvaluationResultDetails,
    status: evaluationAdministration.status,
    eval_admin_name: evaluationAdministration.name,
    total_score: Math.round((Number(evaluationResult.score) / 10) * 100),
    score_rating,
  })

  const previousEvaluationResult = await EvaluationResultRepository.getByFilters(
    {
      id: { lt: evaluationResult?.id },
      evaluation_administration_id: evaluationResult?.evaluation_administration_id,
    },
    {
      id: "desc",
    }
  )

  const nextEvaluationResult = await EvaluationResultRepository.getByFilters(
    {
      id: { gt: evaluationResult?.id },
      evaluation_administration_id: evaluationResult?.evaluation_administration_id,
    },
    {
      id: "asc",
    }
  )

  return {
    data: evaluationResult,
    previousId: previousEvaluationResult?.id,
    nextId: nextEvaluationResult?.id,
  }
}

export const updateById = async (id: number, data: EvaluationResult) => {
  await EvaluationResultRepository.updateById(id, data)
}

export const getAllByEvaluationAdministrationId = async (evaluation_administration_id: number) => {
  return await EvaluationResultRepository.getAllByEvaluationAdministrationId(
    evaluation_administration_id
  )
}

export const updateStatusById = async (id: number, status: string) => {
  const evaluationResult = await EvaluationResultRepository.getById(id)

  if (evaluationResult === null) {
    throw new CustomError("Id not found", 400)
  }

  if (status === EvaluationResultStatus.Ready) {
    const evaluations = await EvaluationRepository.getAllByFilters({
      evaluation_result_id: evaluationResult.id,
      is_external: true,
    })

    for (const evaluation of evaluations) {
      const template = await EvaluationTemplateRepository.getById(
        evaluation.evaluation_template_id ?? 0
      )
      if (template === null) {
        continue
      }
      if (
        evaluation.project_id === null &&
        evaluation.project_member_id === null &&
        template?.evaluee_role_id !== null &&
        template?.evaluee_role_id !== null
      ) {
        throw new CustomError("Please select a project for an external user.", 400, {
          template_id: template.id,
        })
      }
    }
  }

  return await EvaluationResultRepository.updateStatusById(id, status)
}

export const updateStatusByAdministrationId = async (
  evaluation_administration_id: number,
  status: string
) => {
  await EvaluationResultRepository.updateStatusByAdministrationId(
    evaluation_administration_id,
    status
  )
}

export const calculateScore = async (evaluation_result_id: number) => {
  const currentDate = new Date()
  const evaluationResultDetailsSum =
    await EvaluationResultDetailRepository.aggregateSumByEvaluationResultId(evaluation_result_id, {
      weight: true,
      weighted_score: true,
    })

  const calculated_score =
    Number(evaluationResultDetailsSum._sum.weighted_score) /
    Number(evaluationResultDetailsSum._sum.weight)
  const score = isNaN(calculated_score) ? 0 : calculated_score

  await EvaluationResultRepository.updateById(evaluation_result_id, {
    score,
    status: EvaluationResultStatus.Completed,
    updated_at: currentDate,
  })
}

export const calculateZScore = async (evaluation_result_id: number) => {
  const evaluationResultDetailsSum =
    await EvaluationResultDetailRepository.aggregateSumByEvaluationResultId(evaluation_result_id, {
      weight: true,
      weighted_zscore: true,
    })

  const zscore =
    Number(evaluationResultDetailsSum._sum.weighted_zscore) /
    Number(evaluationResultDetailsSum._sum.weight)

  await EvaluationResultRepository.updateZScoreById(
    evaluation_result_id,
    zscore,
    getBanding(zscore)
  )
}

export const calculateScoreRating = async (id: number) => {
  const evaluationResult = await EvaluationResultRepository.getById(id)

  if (evaluationResult === null) {
    throw new CustomError("Evaluation result not found", 400)
  }

  const score = evaluationResult.score

  if (score === null) {
    throw new CustomError("Invalid evaluation result score", 400)
  }

  const scoreRating = await ScoreRatingRepository.getByScore(score)

  if (scoreRating === null) {
    throw new CustomError("Score rating not found", 400)
  }

  await EvaluationResultRepository.updateScoreRatingById(id, scoreRating.id)
}
