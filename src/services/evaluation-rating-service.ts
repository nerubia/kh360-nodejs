import { type Prisma } from "@prisma/client"
import * as EvaluationRatingRepository from "../repositories/evaluation-rating-repository"
import { type EvaluationRating } from "../types/evaluation-rating-type"

export const getById = async (id: number) => {
  return await EvaluationRatingRepository.getById(id)
}

export const getAllByFilters = async (where: Prisma.evaluation_ratingsWhereInput) => {
  return await EvaluationRatingRepository.getAllByFilters(where)
}

export const updateById = async (id: number, data: EvaluationRating) => {
  await EvaluationRatingRepository.updateById(id, data)
}

export const aggregateSumByEvaluationId = async (
  id: number,
  _sum: Prisma.Evaluation_ratingsSumAggregateInputType
) => {
  return await EvaluationRatingRepository.aggregateSumByEvaluationId(id, _sum)
}
