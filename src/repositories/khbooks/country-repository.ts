import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.countriesWhereInput
) => {
  return await prisma.countries.findMany({
    skip,
    take,
    where,
    orderBy: {
      name: "asc",
    },
  })
}

export const countAllByFilters = async (where: Prisma.countriesWhereInput) => {
  const count = await prisma.countries.count({
    where,
  })
  return count
}

export const getById = async (id: number) => {
  return await prisma.countries.findFirst({
    where: {
      id,
    },
  })
}
