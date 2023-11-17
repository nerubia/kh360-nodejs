import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"

export const getById = async (id: number) => {
  return await prisma.answer_options.findUnique({
    where: {
      id,
    },
  })
}

export const getAllByFilters = async (where: Prisma.answer_optionsWhereInput) => {
  return await prisma.answer_options.findMany({
    where,
  })
}
