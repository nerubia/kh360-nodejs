import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.test_apisWhereInput
) => {
  return await prisma.test_apis.findMany({
    skip,
    take,
    where,
    orderBy: {
      status: "desc",
    },
    include: {
      test_items: true,
    },
  })
}

export const countAllByFilters = async (where: Prisma.test_apisWhereInput) => {
  const count = await prisma.test_apis.count({
    where,
  })
  return count
}

export const create = async (data: Prisma.test_apisUncheckedCreateInput) => {
  return await prisma.test_apis.create({
    data,
  })
}

export const getById = async (id: number) => {
  return await prisma.test_apis.findFirst({
    where: {
      id,
    },
  })
}

export const updateById = async (id: number, data: Prisma.test_apisUncheckedUpdateInput) => {
  return await prisma.test_apis.update({
    where: {
      id,
    },
    data,
    select: {
      id: true,
      name: true,
      endpoint: true,
      env: true,
      description: true,
      status: true,
    },
  })
}

export const deleteById = async (id: number) => {
  await prisma.test_apis.delete({
    where: {
      id,
    },
  })
}
