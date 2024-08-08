import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.test_batchesWhereInput
) => {
  return await prisma.test_batches.findMany({
    skip,
    take,
    where,
    orderBy: {
      status: "desc",
    },
  })
}

export const countAllByFilters = async (where: Prisma.test_batchesWhereInput) => {
  const count = await prisma.test_batches.count({
    where,
  })
  return count
}

export const create = async (data: Prisma.test_batchesUncheckedCreateInput) => {
  return await prisma.test_batches.create({
    data,
  })
}

export const getById = async (id: number) => {
  return await prisma.test_batches.findFirst({
    where: {
      id,
    },
  })
}

export const updateById = async (id: number, data: Prisma.test_batchesUncheckedUpdateInput) => {
  return await prisma.test_batches.update({
    where: {
      id,
    },
    data,
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
    },
  })
}

export const deleteById = async (id: number) => {
  await prisma.test_batches.delete({
    where: {
      id,
    },
  })
}
