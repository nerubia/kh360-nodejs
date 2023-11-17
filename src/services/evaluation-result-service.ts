import * as EvaluationResultRepository from "../repositories/evaluation-result-repository"
import { type EvaluationResult } from "../types/evaluation-result-type"

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
