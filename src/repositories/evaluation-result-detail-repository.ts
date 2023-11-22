import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"
import { type EvaluationResultDetail } from "../types/evaluation-result-detail-type"

export const getById = async (id: number) => {
  return await prisma.evaluation_result_details.findUnique({
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

export const create = async (data: Prisma.evaluation_result_detailsCreateInput) => {
  return await prisma.evaluation_result_details.create({ data })
}

export const updateById = async (id: number, data: EvaluationResultDetail) => {
  await prisma.evaluation_result_details.update({
    where: {
      id,
    },
    data,
  })
}

export const aggregateSumByEvaluationResultId = async (
  evaluation_result_id: number,
  _sum: Prisma.Evaluation_result_detailsSumAggregateInputType
) => {
  return await prisma.evaluation_result_details.aggregate({
    where: {
      evaluation_result_id,
    },
    _sum,
  })
}
