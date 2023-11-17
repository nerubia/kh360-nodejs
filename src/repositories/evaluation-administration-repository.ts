import { type EvaluationAdministration } from "../types/evaluation-administration-type"
import prisma from "../utils/prisma"

export const getAllByStatusAndDate = async (status: string, date: Date) => {
  return await prisma.evaluation_administrations.findMany({
    where: {
      status,
      eval_schedule_start_date: {
        lte: date,
      },
      eval_schedule_end_date: {
        gte: date,
      },
    },
  })
}

export const getAllByStatus = async (status: string) => {
  return await prisma.evaluation_administrations.findMany({
    where: {
      status,
    },
  })
}

export const getById = async (id: number) => {
  return await prisma.evaluation_administrations.findUnique({
    where: {
      id,
    },
  })
}

export const create = async (data: EvaluationAdministration) => {
  return await prisma.evaluation_administrations.create({
    data,
  })
}

export const updateStatusById = async (id: number, status: string) => {
  await prisma.evaluation_administrations.update({
    where: {
      id,
    },
    data: {
      status,
    },
  })
}
