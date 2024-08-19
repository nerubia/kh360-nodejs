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

// NOTE: If we need to paginate test_items, simply use the test_items api
export const getById = async (id: number) => {
  const testBatch = await prisma.test_batches.findFirst({
    where: {
      id,
    },
    include: {
      test_items: {
        include: {
          test_items: true,
        },
      },
    },
  })
  if (testBatch === null) {
    return null
  }
  return {
    ...testBatch,
    test_items: testBatch.test_items.map((testItem) => testItem.test_items),
  }
}

export const updateById = async (id: number, data: Prisma.test_batchesUncheckedUpdateInput) => {
  const testBatch = await prisma.test_batches.update({
    where: {
      id,
    },
    data,
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      test_items: {
        include: {
          test_items: true,
        },
      },
    },
  })

  return {
    ...testBatch,
    test_items: testBatch.test_items.map((testItem) => testItem.test_items),
  }
}

export const deleteById = async (id: number) => {
  await prisma.test_batches.delete({
    where: {
      id,
    },
  })
}
