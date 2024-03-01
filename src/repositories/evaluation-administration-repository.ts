import { type Prisma } from "@prisma/client"
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

export const getAllByStatusAndEndDate = async (status: string, date: Date) => {
  return await prisma.evaluation_administrations.findMany({
    where: {
      status,
      eval_schedule_end_date: {
        lte: date,
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

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.evaluation_administrationsWhereInput
) => {
  return await prisma.evaluation_administrations.findMany({
    skip,
    take,
    where,
    orderBy: {
      id: "desc",
    },
  })
}

export const getAllByFilters = async (where: Prisma.evaluation_administrationsWhereInput) => {
  return await prisma.evaluation_administrations.findMany({
    where,
    orderBy: {
      id: "desc",
    },
  })
}

export const getAllByStatuses = async (statuses: string[]) => {
  return await prisma.evaluation_administrations.findMany({
    where: {
      status: {
        in: statuses,
      },
    },
  })
}

export const countAllByFilters = async (where: Prisma.evaluation_administrationsWhereInput) => {
  const count = await prisma.evaluation_administrations.count({
    where,
  })

  return count
}

export const getAllByIdsAndStatuses = async (ids: number[], statuses: string[]) => {
  return await prisma.evaluation_administrations.findMany({
    where: {
      id: {
        in: ids,
      },
      status: {
        in: statuses,
      },
    },
  })
}
