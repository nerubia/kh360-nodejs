import * as EvaluationResultRepository from "../repositories/evaluation-result-repository"

export const getAllByEvaluationAdministrationId = async (
  evaluation_administration_id: number
) => {
  return await EvaluationResultRepository.getAllByEvaluationAdministrationId(
    evaluation_administration_id
  )
}

export const updateStatusById = async (id: number, status: string) => {
  await EvaluationResultRepository.updateStatusById(id, status)
}
