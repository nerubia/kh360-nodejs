import { type Prisma } from "@prisma/client"
import * as EvaluationRepository from "../repositories/evaluation-repository"

export const getAllByFilters = async (where: Prisma.evaluationsWhereInput) => {
  return await EvaluationRepository.getAllByFilters(where)
}

export const updateStatusById = async (id: number, status: string) => {
  await EvaluationRepository.updateStatusById(id, status)
}

export const updateStatusByAdministrationId = async (
  evaluation_administration_id: number,
  status: string
) => {
  await EvaluationRepository.updateStatusByAdministrationId(evaluation_administration_id, status)
}
