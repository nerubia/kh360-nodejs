import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"
import { type EvaluationResultDetail } from "../types/evaluation-result-detail-type"

export const getById = async (id: number) => {
  return await prisma.evaluations.findUnique({
    where: {
      id,
    },
  })
}

export const getAllByFilters = async (where: Prisma.evaluation_result_detailsWhereInput) => {
  return await prisma.evaluation_result_details.findMany({
    where,
  })
}

export const updateById = async (id: number, data: EvaluationResultDetail) => {
  await prisma.evaluation_result_details.update({
    where: {
      id,
    },
    data,
  })
}

export const aggregateSum = async (_sum: Prisma.Evaluation_result_detailsSumAggregateInputType) => {
  return await prisma.evaluation_result_details.aggregate({
    _sum,
  })
}
