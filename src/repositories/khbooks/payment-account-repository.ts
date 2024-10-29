import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.payment_accountsWhereInput
) => {
  return await prisma.payment_accounts.findMany({
    skip,
    take,
    where,
    include: {
      countries: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      {
        created_at: "desc",
      },
    ],
  })
}

export const countAllByFilters = async (where: Prisma.payment_accountsWhereInput) => {
  const count = await prisma.payment_accounts.count({
    where,
  })
  return count
}

export const getById = async (id: number) => {
  return await prisma.payment_accounts.findFirst({
    where: {
      id,
    },
  })
}

export const deleteById = async (id: number) => {
  await prisma.payment_accounts.delete({
    where: {
      id,
    },
  })
}
