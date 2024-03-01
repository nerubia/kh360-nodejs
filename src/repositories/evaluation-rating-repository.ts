import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"
import { type EvaluationRating } from "../types/evaluation-rating-type"

export const getById = async (id: number) => {
  return await prisma.evaluation_ratings.findUnique({
    where: {
      id,
    },
  })
}

export const getAllByFilters = async (where: Prisma.evaluation_ratingsWhereInput) => {
  return await prisma.evaluation_ratings.findMany({
    where,
  })
}

export const getByFilters = async (where: Prisma.evaluation_ratingsWhereInput) => {
  return await prisma.evaluation_ratings.findFirst({
    where,
  })
}

export const updateById = async (rating_id: number, data: EvaluationRating) => {
  await prisma.evaluation_ratings.update({
    where: {
      id: rating_id,
    },
    data,
  })
}

export const deleteByEvaluationId = async (evaluation_id: number) => {
  await prisma.evaluation_ratings.deleteMany({
    where: {
      evaluation_id,
    },
  })
}

export const aggregateSumByEvaluationId = async (
  id: number,
  _sum: Prisma.Evaluation_ratingsSumAggregateInputType
) => {
  const sum = await prisma.evaluation_ratings.aggregate({
    _sum,
    where: {
      evaluation_id: id,
    },
  })
  return sum
}

export const getAverageScoreByTemplateContent = async (
  _avg: Prisma.Evaluation_ratingsAvgAggregateInputType,
  where: Prisma.evaluation_ratingsWhereInput
) => {
  const avg = await prisma.evaluation_ratings.aggregate({
    _avg,
    where,
  })
  return avg
}

export const resetByEvaluationId = async (evaluation_id: number) => {
  await prisma.evaluation_ratings.updateMany({
    where: {
      evaluation_id,
    },
    data: {
      answer_option_id: null,
      rate: 0,
      score: 0,
      comments: "",
    },
  })
}

export const deleteByEvaluationAdministrationIds = async (
  evaluationAdministrationIds: number[]
) => {
  await prisma.evaluation_ratings.deleteMany({
    where: {
      evaluation_administration_id: {
        in: evaluationAdministrationIds,
      },
    },
  })
}

export const deleteByEvaluationIds = async (evaluation_ids: number[]) => {
  await prisma.evaluation_ratings.deleteMany({
    where: {
      id: {
        in: evaluation_ids,
      },
    },
  })
}

export const softDeleteByEvaluationIds = async (evaluation_ids: number[]) => {
  await prisma.evaluation_ratings.updateMany({
    where: {
      id: {
        in: evaluation_ids,
      },
    },
    data: { deleted_at: new Date() },
  })
}

export const createMany = async (data: EvaluationRating[]) => {
  await prisma.evaluation_ratings.createMany({
    data,
  })
}
