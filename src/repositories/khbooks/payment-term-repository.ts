import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.payment_termsWhereInput
) => {
  return await prisma.payment_terms.findMany({
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

export const countAllByFilters = async (where: Prisma.payment_termsWhereInput) => {
  const count = await prisma.payment_terms.count({
    where,
  })
  return count
}

export const getById = async (id: number) => {
  return await prisma.payment_terms.findFirst({
    where: {
      id,
    },
  })
}
