import { type Prisma } from "@prisma/client"
import * as EvaluationResultDetailRepository from "../repositories/evaluation-result-detail-repository"
import { type EvaluationResultDetail } from "../types/evaluation-result-detail-type"

export const getAllByFilters = async (where: Prisma.evaluation_result_detailsWhereInput) => {
  return await EvaluationResultDetailRepository.getAllByFilters(where)
}

export const updateById = async (id: number, data: EvaluationResultDetail) => {
  await EvaluationResultDetailRepository.updateById(id, data)
}

export const aggregateSumByEvaluationResultId = async (
  evaluation_result_id: number,
  _sum: Prisma.Evaluation_result_detailsSumAggregateInputType
) => {
  return await EvaluationResultDetailRepository.aggregateSumByEvaluationResultId(
    evaluation_result_id,
    _sum
  )
}
