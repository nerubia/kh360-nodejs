import { type Prisma } from "@prisma/client"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import { type Evaluation } from "../types/evaluation-type"

export const getById = async (id: number) => {
  return await EvaluationRepository.getById(id)
}

export const getAllByFilters = async (where: Prisma.evaluationsWhereInput) => {
  return await EvaluationRepository.getAllByFilters(where)
}

export const getAllDistinctByFilters = async (
  where: Prisma.evaluationsWhereInput,
  distinct: Prisma.EvaluationsScalarFieldEnum | Prisma.EvaluationsScalarFieldEnum[]
) => {
  return await EvaluationRepository.getAllDistinctByFilters(where, distinct)
}

export const updateById = async (id: number, data: Evaluation) => {
  await EvaluationRepository.updateById(id, data)
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

export const countAllByFilters = async (where: Prisma.evaluationsWhereInput) => {
  return await EvaluationRepository.countAllByFilters(where)
}

export const aggregateSumByFilters = async (
  _sum: Prisma.EvaluationsSumAggregateInputType,
  where: Prisma.evaluationsWhereInput
) => {
  return await EvaluationRepository.aggregateSumByFilters(_sum, where)
}
