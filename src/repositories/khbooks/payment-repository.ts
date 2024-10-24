import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.paymentsWhereInput
) => {
  return await prisma.payments.findMany({
    skip,
    take,
    where,
    include: {
      clients: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      {
        payment_date: "desc",
      },
      {
        payment_reference_no: "asc",
      },
      {
        clients: {
          name: "asc",
        },
      },
    ],
  })
}

export const countAllByFilters = async (where: Prisma.paymentsWhereInput) => {
  const count = await prisma.payments.count({
    where,
  })
  return count
}
