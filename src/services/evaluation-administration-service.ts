import * as EvaluationAdministrationRepository from "../repositories/evaluation-administration-repository"

export const getAllByStatus = async (status: string, date: Date) => {
  return await EvaluationAdministrationRepository.getAllByStatus(status, date)
}

export const updateStatusById = async (id: number, status: string) => {
  await EvaluationAdministrationRepository.updateStatusById(id, status)
}
