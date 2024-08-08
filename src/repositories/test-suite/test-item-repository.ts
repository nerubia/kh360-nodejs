import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.test_itemsWhereInput
) => {
  return await prisma.test_items.findMany({
    skip,
    take,
    where,
    orderBy: {
      status: "desc",
    },
    include: {
      test_apis: true,
    },
  })
}

export const countAllByFilters = async (where: Prisma.test_itemsWhereInput) => {
  const count = await prisma.test_items.count({
    where,
  })
  return count
}

export const create = async (data: Prisma.test_itemsUncheckedCreateInput) => {
  return await prisma.test_items.create({
    data,
  })
}

export const getById = async (id: number) => {
  return await prisma.test_items.findFirst({
    where: {
      id,
    },
  })
}

export const updateById = async (id: number, data: Prisma.test_itemsUncheckedUpdateInput) => {
  return await prisma.test_items.update({
    where: {
      id,
    },
    data,
    select: {
      id: true,
      http_method: true,
      payload: true,
      response: true,
      description: true,
      status: true,
    },
  })
}

export const deleteById = async (id: number) => {
  await prisma.test_items.delete({
    where: {
      id,
    },
  })
}
