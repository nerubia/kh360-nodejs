import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"
import { type Evaluation } from "../types/evaluation-type"

export const getById = async (id: number) => {
  return await prisma.evaluations.findUnique({
    where: {
      id,
    },
  })
}

export const getByFilters = async (where: Prisma.evaluationsWhereInput) => {
  return await prisma.evaluations.findFirst({
    include: {
      project_members: {
        select: {
          project_role_id: true,
        },
      },
    },
    where,
  })
}

export const getAllByFilters = async (where: Prisma.evaluationsWhereInput) => {
  return await prisma.evaluations.findMany({
    include: {
      project_members: {
        select: {
          project_role_id: true,
        },
      },
    },
    where,
  })
}

export const getAllDistinctByFilters = async (
  where: Prisma.evaluationsWhereInput,
  distinct: Prisma.EvaluationsScalarFieldEnum | Prisma.EvaluationsScalarFieldEnum[]
) => {
  return await prisma.evaluations.findMany({
    where,
    distinct,
  })
}

export const create = async (data: Prisma.evaluationsCreateInput) => {
  return await prisma.evaluations.create({ data })
}

export const updateById = async (id: number, data: Evaluation) => {
  await prisma.evaluations.update({
    where: {
      id,
    },
    data,
  })
}

export const updateProjectById = async (
  id: number,
  project_id: number,
  project_member_id: number
) => {
  return await prisma.evaluations.update({
    where: {
      id,
    },
    data: {
      project_id,
      project_member_id,
    },
  })
}

export const updateZScoreById = async (id: number, zscore: number, weighted_zscore: number) => {
  return await prisma.evaluations.update({
    where: {
      id,
    },
    data: {
      zscore,
      weighted_zscore,
    },
  })
}

export const updateStatusById = async (id: number, status: string) => {
  await prisma.evaluations.update({
    where: {
      id,
    },
    data: {
      status,
      updated_at: new Date(),
    },
  })
}

export const updateStatusByAdministrationId = async (
  evaluation_administration_id: number,
  status: string
) => {
  await prisma.evaluations.updateMany({
    where: {
      evaluation_administration_id,
      for_evaluation: true,
    },
    data: {
      status,
      updated_at: new Date(),
    },
  })
}

export const deleteById = async (id: number) => {
  await prisma.evaluations.deleteMany({
    where: {
      id,
    },
  })
}

export const countAllByFilters = async (where: Prisma.evaluationsWhereInput) => {
  const count = await prisma.evaluations.count({
    where,
  })

  return count
}

export const aggregateSumByFilters = async (
  _sum: Prisma.EvaluationsSumAggregateInputType,
  where: Prisma.evaluationsWhereInput
) => {
  const sum = await prisma.evaluations.aggregate({
    _sum,
    where,
  })
  return sum
}

export const deleteByAdministrationIdAndStatus = async (
  evaluation_administration_id: number,
  status: string
) => {
  await prisma.evaluations.deleteMany({
    where: {
      evaluation_administration_id,
      status,
    },
  })
}
