import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"

export const getById = async (id: number) => {
  return await prisma.answers.findUnique({
    where: {
      id,
    },
  })
}

export const getAllByFilters = async (where: Prisma.answersWhereInput) => {
  return await prisma.answers.findMany({
    where,
  })
}

export const list = async (is_active: boolean) => {
  return await prisma.answers.findMany({
    where: {
      is_active,
    },
  })
}
