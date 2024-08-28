import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.invoicesWhereInput
) => {
  return await prisma.invoices.findMany({
    skip,
    take,
    where,
    orderBy: [
      {
        invoice_date: "desc",
      },
    ],
    include: {
      clients: {
        select: {
          name: true,
        },
      },
    },
  })
}

export const countAllByFilters = async (where: Prisma.invoicesWhereInput) => {
  const count = await prisma.invoices.count({
    where,
  })
  return count
}
