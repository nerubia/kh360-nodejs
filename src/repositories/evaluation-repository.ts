import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"

export const getAllByFilters = async (where: Prisma.evaluationsWhereInput) => {
  return await prisma.evaluations.findMany({
    where,
    distinct: ["evaluator_id"],
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
