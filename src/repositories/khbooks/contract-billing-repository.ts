import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.contract_billingsWhereInput
) => {
  return await prisma.contract_billings.findMany({
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

export const countAllByFilters = async (where: Prisma.contract_billingsWhereInput) => {
  const count = await prisma.contract_billings.count({
    where,
  })
  return count
}
