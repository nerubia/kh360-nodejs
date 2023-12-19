import prisma from "../utils/prisma"
import { type EvaluationResult } from "../types/evaluation-result-type"

export const getById = async (id: number) => {
  return await prisma.evaluation_results.findUnique({
    where: {
      id,
    },
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

export const updateZScoreById = async (id: number, zscore: number, banding: string) => {
  await prisma.evaluation_results.update({
    where: {
      id,
    },
    data: {
      zscore,
      banding,
    },
  })
}

export const updateScoreRatingById = async (id: number, score_rating_id: number) => {
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
