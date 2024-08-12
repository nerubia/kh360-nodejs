import { type Prisma } from "@prisma/client"
import * as TestBatchRepository from "../../repositories/test-suite/test-batch-repository"
import { type TestBatch } from "../../types/test-batch-type"
import { type UserToken } from "../../types/user-token-type"
import CustomError from "../../utils/custom-error"

export const getAllByFilters = async (name: string, status: number, page: string) => {
  const itemsPerPage = 20
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where: Prisma.test_batchesWhereInput = {}

  if (name !== undefined) {
    Object.assign(where, {
      name: {
        contains: name,
      },
    })
  }

  if (!isNaN(status)) {
    Object.assign(where, {
      status: Boolean(status),
    })
  }

  const testBatches = await TestBatchRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const totalItems = await TestBatchRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: testBatches,
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
}

export const create = async (user: UserToken, data: TestBatch) => {
  const currentDate = new Date()

  const newIds = data.itemIds ?? []

  return await TestBatchRepository.create({
    name: data.name,
    description: data.description,
    status: data.status,
    created_at: currentDate,
    created_by: user.id,
    updated_at: currentDate,
    updated_by: user.id,
    test_items: {
      create: newIds.map((id) => ({
        test_items_id: id,
      })),
    },
  })
}

export const getById = async (id: number) => {
  return await TestBatchRepository.getById(id)
}

export const updateById = async (user: UserToken, id: number, data: TestBatch) => {
  const testBatch = await TestBatchRepository.getById(id)

  if (testBatch === null) {
    throw new CustomError("Test batch not found", 400)
  }

  const currentDate = new Date()

  const existingIds: number[] = []
  const newIds = data.itemIds ?? []

  for (const item of testBatch.test_items) {
    if (item !== null) {
      existingIds.push(item.id)
    }
  }

  const toDelete = existingIds.filter((itemId) => !newIds.includes(itemId))
  const toAdd = newIds.filter((itemId) => !existingIds.includes(itemId))

  return await TestBatchRepository.updateById(testBatch.id, {
    name: data.name,
    description: data.description,
    status: data.status,
    updated_at: currentDate,
    updated_by: user.id,
    test_items: {
      create: toAdd.map((id) => ({
        test_items_id: id,
      })),
      deleteMany: {
        test_items_id: {
          in: toDelete,
        },
      },
    },
  })
}

export const deleteById = async (id: number) => {
  const testBatch = await TestBatchRepository.getById(id)

  if (testBatch === null) {
    throw new CustomError("Test batch not found", 400)
  }

  await TestBatchRepository.deleteById(id)
}
