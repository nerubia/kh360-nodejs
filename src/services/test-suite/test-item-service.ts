import { type $Enums, type Prisma } from "@prisma/client"
import * as TestItemRepository from "../../repositories/test-suite/test-item-repository"
import * as TestApiRepository from "../../repositories/test-suite/test-api-repository"
import { type TestItem } from "../../types/test-item-type"
import { type UserToken } from "../../types/user-token-type"
import CustomError from "../../utils/custom-error"

export const getAllByFilters = async (
  apiId: number,
  name: string,
  status: number,
  page: string
) => {
  const itemsPerPage = 20
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where: Prisma.test_itemsWhereInput = {}

  if (!isNaN(apiId)) {
    Object.assign(where, {
      test_apis_id: apiId,
    })
  }

  if (name !== undefined) {
    Object.assign(where, {
      OR: [
        {
          payload: {
            contains: name,
          },
        },
        {
          response: {
            contains: name,
          },
        },
        {
          description: {
            contains: name,
          },
        },
      ],
    })
  }

  if (!isNaN(status)) {
    Object.assign(where, {
      status: Boolean(status),
    })
  }

  const testItems = await TestItemRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const totalItems = await TestItemRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: testItems,
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
}

export const create = async (user: UserToken, data: TestItem) => {
  const testApi = await TestApiRepository.getById(data.apiId)

  if (testApi === null) {
    throw new CustomError("Test api not found", 400)
  }

  const currentDate = new Date()

  return await TestItemRepository.create({
    test_apis_id: testApi.id,
    http_method: data.http_method as $Enums.http_method,
    payload: data.payload,
    response: data.response,
    description: data.description,
    status: data.status,
    created_at: currentDate,
    created_by: user.id,
    updated_at: currentDate,
    updated_by: user.id,
  })
}

export const getById = async (id: number) => {
  return await TestItemRepository.getById(id)
}

export const updateById = async (user: UserToken, id: number, data: TestItem) => {
  const testItem = await TestItemRepository.getById(id)

  if (testItem === null) {
    throw new CustomError("Test item not found", 400)
  }

  const testApi = await TestApiRepository.getById(data.apiId)

  if (testApi === null) {
    throw new CustomError("Test api not found", 400)
  }

  const currentDate = new Date()

  return await TestItemRepository.updateById(testItem.id, {
    test_apis_id: testApi.id,
    http_method: data.http_method as $Enums.http_method,
    payload: data.payload,
    response: data.response,
    description: data.description,
    status: data.status,
    updated_at: currentDate,
    updated_by: user.id,
  })
}

export const deleteById = async (id: number) => {
  const testItem = await TestItemRepository.getById(id)

  if (testItem === null) {
    throw new CustomError("Test item not found", 400)
  }

  await TestItemRepository.deleteById(id)
}
