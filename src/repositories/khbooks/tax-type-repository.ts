import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.tax_typesWhereInput
) => {
  return await prisma.tax_types.findMany({
    skip,
    take,
    where,
    orderBy: [
      {
        created_at: "desc",
      },
    ],
  })
}

export const countAllByFilters = async (where: Prisma.tax_typesWhereInput) => {
  const count = await prisma.tax_types.count({
    where,
  })
  return count
}

export const getById = async (id: number) => {
  return await prisma.tax_types.findFirst({
    where: {
      id,
    },
  })
}
