import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.offeringsWhereInput
) => {
  return await prisma.offerings.findMany({
    skip,
    take,
    where,
    orderBy: [
      {
        created_at: "desc",
      },
    ],
    include: {
      offering_categories: {
        select: {
          name: true,
        },
      },
      clients: {
        select: {
          name: true,
        },
      },
      currencies: {
        select: {
          code: true,
        },
      },
    },
  })
}

export const countAllByFilters = async (where: Prisma.offeringsWhereInput) => {
  const count = await prisma.offerings.count({
    where,
  })
  return count
}

export const create = async (data: Prisma.offeringsUncheckedCreateInput) => {
  return await prisma.offerings.create({
    data,
  })
}

export const getById = async (id: number) => {
  return await prisma.offerings.findFirst({
    where: {
      id,
    },
  })
}

export const deleteById = async (id: number) => {
  await prisma.offerings.delete({
    where: {
      id,
    },
  })
}
