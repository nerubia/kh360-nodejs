import * as EvaluationAdministrationRepository from "../repositories/evaluation-administration-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as EvaluationResultRepository from "../repositories/evaluation-result-repository"
import * as EvaluationResultDetailsRepository from "../repositories/evaluation-result-detail-repository"
import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"
import * as ScoreRatingRepository from "../repositories/score-rating-repository"
import { EvaluationResultStatus, type EvaluationResult } from "../types/evaluation-result-type"
import CustomError from "../utils/custom-error"
import { getBanding } from "../utils/calculate-norms"
import { EvaluationAdministrationStatus } from "../types/evaluation-administration-type"
import { type Prisma } from "@prisma/client"
import { type UserToken } from "../types/user-token-type"

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
    await EvaluationResultDetailsRepository.aggregateSumByEvaluationResultId(evaluation_result_id, {
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
    await EvaluationResultDetailsRepository.aggregateSumByEvaluationResultId(evaluation_result_id, {
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
