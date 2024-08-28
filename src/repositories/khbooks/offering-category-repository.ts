import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.offering_categoriesWhereInput
) => {
  return await prisma.offering_categories.findMany({
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

export const countAllByFilters = async (where: Prisma.offering_categoriesWhereInput) => {
  const count = await prisma.offering_categories.count({
    where,
  })
  return count
}
