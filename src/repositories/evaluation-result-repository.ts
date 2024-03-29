import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"
import { type EvaluationResult } from "../types/evaluation-result-type"

export const getAllByFiltersWithPaging = async (
  skip: number,
  take: number,
  where: Prisma.evaluation_resultsWhereInput,
  orderBy: Prisma.evaluation_resultsOrderByWithRelationInput[]
) => {
  return await prisma.evaluation_results.findMany({
    skip,
    take,
    select: {
      id: true,
      evaluation_administration_id: true,
      score: true,
      status: true,
      score_ratings: {
        select: {
          id: true,
          display_name: true,
        },
      },
      zscore: true,
      banding: true,
      users: {
        select: {
          id: true,
          slug: true,
          first_name: true,
          last_name: true,
          picture: true,
        },
      },
    },
    where,
    orderBy,
  })
}

export const getById = async (id: number) => {
  return await prisma.evaluation_results.findUnique({
    where: {
      id,
    },
  })
}

export const getByFilters = async (
  where: Prisma.evaluation_resultsWhereInput,
  orderBy: Prisma.evaluation_resultsOrderByWithRelationInput
) => {
  return await prisma.evaluation_results.findFirst({
    where,
    orderBy,
  })
}

export const getAllByFilters = async (where: Prisma.evaluation_resultsWhereInput) => {
  return await prisma.evaluation_results.findMany({
    where,
  })
}

export const getAllDistinctByFilters = async (
  where: Prisma.evaluation_resultsWhereInput,
  distinct: Prisma.Evaluation_resultsScalarFieldEnum | Prisma.Evaluation_resultsScalarFieldEnum[]
) => {
  return await prisma.evaluation_results.findMany({
    where,
    distinct,
  })
}

export const getByEvaluationAdministrationIdAndUserId = async (
  evaluation_administration_id: number,
  user_id: number
) => {
  return await prisma.evaluation_results.findFirst({
    where: {
      evaluation_administration_id,
      user_id,
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

export const updateZScoreById = async (id: number, zscore: number) => {
  await prisma.evaluation_results.update({
    where: {
      id,
    },
    data: {
      zscore,
    },
  })
}

export const updateBandingById = async (id: number, banding: string) => {
  return await prisma.evaluation_results.update({
    where: {
      id,
    },
    data: {
      banding,
    },
  })
}

export const updateScoreRatingById = async (id: number, score_rating_id: number | null) => {
  await prisma.evaluation_results.update({
    where: {
      id,
    },
    data: {
      score_ratings_id: score_rating_id,
      updated_at: new Date(),
    },
  })
}

export const updateByAdministrationId = async (
  evaluation_administration_id: number,
  data: Prisma.evaluation_resultsUncheckedUpdateInput
) => {
  await prisma.evaluation_results.updateMany({
    where: {
      evaluation_administration_id,
    },
    data: {
      ...data,
      updated_at: new Date(),
    },
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

export const countByAdministrationId = async (evaluation_administration_id: number) => {
  return await prisma.evaluation_results.count({
    where: {
      evaluation_administration_id,
    },
  })
}

export const countAllByFilters = async (where: Prisma.evaluation_resultsWhereInput) => {
  const count = await prisma.evaluation_results.count({
    where,
  })
  return count
}

export const deleteById = async (id: number) => {
  await prisma.evaluation_results.deleteMany({
    where: {
      id,
    },
  })
}

export const softDeleteById = async (id: number) => {
  await prisma.evaluation_results.updateMany({
    where: {
      id,
    },
    data: {
      deleted_at: new Date(),
    },
  })
}
