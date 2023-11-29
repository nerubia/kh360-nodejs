import prisma from "../utils/prisma"
import { type EvaluationResult } from "../types/evaluation-result-type"

export const getById = async (id: number) => {
  return await prisma.evaluation_results.findUnique({
    where: {
      id,
    },
  })
}

export const updateById = async (id: number, data: EvaluationResult) => {
  await prisma.evaluation_results.update({
    where: {
      id,
    },
    data,
  })
}

export const getAllByEvaluationAdministrationId = async (evaluation_administration_id: number) => {
  return await prisma.evaluation_results.findMany({
    where: {
      evaluation_administration_id,
    },
  })
}

export const updateStatusById = async (id: number, status: string) => {
  return await prisma.evaluation_results.update({
    where: {
      id,
    },
    data: {
      status,
    },
  })
}

export const updateStatusByAdministrationId = async (
  evaluation_administration_id: number,
  status: string
) => {
  await prisma.evaluation_results.updateMany({
    where: {
      evaluation_administration_id,
    },
    data: {
      status,
    },
  })
}
