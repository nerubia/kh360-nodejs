import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.invoice_activitiesWhereInput
) => {
  return await prisma.invoice_activities.findMany({
    skip,
    take,
    where,
    orderBy: [
      {
        created_at: "asc",
      },
    ],
    include: {
      payments: {
        select: {
          id: true,
          payment_no: true,
          payment_amount: true,
        },
      },
    },
  })
}

export const countAllByFilters = async (where: Prisma.invoice_activitiesWhereInput) => {
  const count = await prisma.invoice_activities.count({
    where,
  })
  return count
}

export const create = async (data: Prisma.invoice_activitiesUncheckedCreateInput) => {
  return await prisma.invoice_activities.create({
    data,
  })
}
