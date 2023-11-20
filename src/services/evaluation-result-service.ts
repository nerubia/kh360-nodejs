import * as EvaluationResultRepository from "../repositories/evaluation-result-repository"
import * as EvaluationResultDetailsRepository from "../repositories/evaluation-result-detail-repository"
import { EvaluationResultStatus, type EvaluationResult } from "../types/evaluation-result-type"

export const updateById = async (id: number, data: EvaluationResult) => {
  await EvaluationResultRepository.updateById(id, data)
}

export const getAllByEvaluationAdministrationId = async (evaluation_administration_id: number) => {
  return await EvaluationResultRepository.getAllByEvaluationAdministrationId(
    evaluation_administration_id
  )
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
  await EvaluationResultRepository.updateById(evaluation_result_id, {
    score:
      Number(evaluationResultDetailsSum._sum.weighted_score) /
      Number(evaluationResultDetailsSum._sum.weight),
    status: EvaluationResultStatus.Completed,
    updated_at: currentDate,
  })
}
