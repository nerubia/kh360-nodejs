import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.contractsWhereInput
) => {
  return await prisma.contracts.findMany({
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

export const countAllByFilters = async (where: Prisma.contractsWhereInput) => {
  const count = await prisma.contracts.count({
    where,
  })
  return count
}
