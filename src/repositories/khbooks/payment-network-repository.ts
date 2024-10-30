import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const getById = async (id: number) => {
  return await prisma.payment_networks.findFirst({
    where: {
      id,
    },
  })
}

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.payment_networksWhereInput
) => {
  return await prisma.payment_networks.findMany({
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

export const countAllByFilters = async (where: Prisma.payment_networksWhereInput) => {
  const count = await prisma.payment_networks.count({
    where,
  })
  return count
}
