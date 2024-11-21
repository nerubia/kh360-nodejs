import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.currenciesWhereInput
) => {
  return await prisma.currencies.findMany({
    skip,
    take,
    where,
    orderBy: [
      {
        name: "asc",
      },
    ],
  })
}

export const countAllByFilters = async (where: Prisma.currenciesWhereInput) => {
  const count = await prisma.currencies.count({
    where,
  })
  return count
}

export const getById = async (id: number) => {
  return await prisma.currencies.findFirst({
    where: {
      id,
    },
  })
}
