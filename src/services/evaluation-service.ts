import * as EvaluationRepository from "../repositories/evaluation-repository"

export const getAllByAdministrationId = async (
  evaluation_administration_id: number
) => {
  return await EvaluationRepository.getAllByAdministrationId(
    evaluation_administration_id
  )
}

export const updateStatusById = async (id: number, status: string) => {
  await EvaluationRepository.updateStatusById(id, status)
}
