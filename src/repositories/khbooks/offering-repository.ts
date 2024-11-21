import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.offeringsWhereInput,
  orderBy: Prisma.offeringsOrderByWithRelationInput[]
) => {
  return await prisma.offerings.findMany({
    skip,
    take,
    where,
    orderBy,
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
      _count: {
        select: {
          invoice_details: true,
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
    include: {
      offering_categories: {
        select: {
          id: true,
          name: true,
        },
      },
      clients: {
        select: {
          id: true,
          name: true,
        },
      },
      currencies: {
        select: {
          id: true,
          code: true,
        },
      },
      _count: {
        select: {
          invoice_details: true,
        },
      },
    },
  })
}

export const getByName = async (name: string) => {
  return await prisma.offerings.findFirst({
    where: {
      name,
    },
  })
}

export const updateById = async (id: number, data: Prisma.offeringsUncheckedUpdateInput) => {
  return await prisma.offerings.update({
    where: {
      id,
    },
    data,
  })
}

export const deleteById = async (id: number) => {
  await prisma.offerings.delete({
    where: {
      id,
    },
  })
}
