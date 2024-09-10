import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.uomsWhereInput
) => {
  return await prisma.uoms.findMany({
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

export const countAllByFilters = async (where: Prisma.uomsWhereInput) => {
  const count = await prisma.uoms.count({
    where,
  })
  return count
}
