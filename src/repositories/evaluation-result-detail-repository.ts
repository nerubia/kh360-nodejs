import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"
import { type EvaluationResultDetail } from "../types/evaluation-result-detail-type"

export const getById = async (id: number) => {
  return await prisma.evaluation_result_details.findUnique({
    where: {
      id,
    },
  })
}

export const getAllByFilters = async (where: Prisma.evaluation_result_detailsWhereInput) => {
  return await prisma.evaluation_result_details.findMany({
    where,
  })
}

export const countByFilters = async (where: Prisma.evaluation_result_detailsWhereInput) => {
  return await prisma.evaluation_result_details.count({
    where,
  })
}

export const create = async (data: Prisma.evaluation_result_detailsCreateInput) => {
  return await prisma.evaluation_result_details.create({ data })
}

export const updateById = async (id: number, data: EvaluationResultDetail) => {
  await prisma.evaluation_result_details.update({
    where: {
      id,
    },
    data,
  })
}

export const updateWeightById = async (id: number, weight: number) => {
  await prisma.evaluation_result_details.updateMany({
    where: {
      id,
    },
    data: {
      weight,
    },
  })
}

export const updateZScoreById = async (
  id: number,
  zscore: number,
  weighted_zscore: number,
  banding: string
) => {
  return await prisma.evaluation_result_details.update({
    where: {
      id,
    },
    data: {
      zscore,
      weighted_zscore,
      banding,
    },
  })
}

export const updateScoreRatingById = async (id: number, score_rating_id: number | null) => {
  await prisma.evaluation_result_details.update({
    where: {
      id,
    },
    data: {
      score_ratings_id: score_rating_id,
      updated_at: new Date(),
    },
  })
}

export const updateByAdministrationId = async (
  evaluation_administration_id: number,
  data: Prisma.evaluation_result_detailsUpdateInput
) => {
  await prisma.evaluation_result_details.updateMany({
    where: {
      evaluation_administration_id,
    },
    data: {
      ...data,
      updated_at: new Date(),
    },
  })
}

export const aggregateSumByEvaluationResultId = async (
  evaluation_result_id: number,
  _sum: Prisma.Evaluation_result_detailsSumAggregateInputType
) => {
  return await prisma.evaluation_result_details.aggregate({
    where: {
      evaluation_result_id,
    },
    _sum,
  })
}
