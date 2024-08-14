import { type $Enums, type Prisma } from "@prisma/client"
import * as TestApiRepository from "../../repositories/test-suite/test-api-repository"
import { type TestApi } from "../../types/test-api-type"
import { type UserToken } from "../../types/user-token-type"
import CustomError from "../../utils/custom-error"

export const getAllByFilters = async (
  id: number,
  name: string,
  endpoint: string,
  env: string,
  status: number,
  page: string
) => {
  const itemsPerPage = 20
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where: Prisma.test_apisWhereInput = {}

  if (!isNaN(id)) {
    Object.assign(where, { id })
  }

  if (name !== undefined && name.length > 0) {
    Object.assign(where, { name: { contains: name } })
  }

  if (endpoint !== undefined && endpoint.length > 0) {
    Object.assign(where, { endpoint: { contains: endpoint } })
  }

  if (env !== undefined && env.length > 0) {
    Object.assign(where, { env: { contains: env } })
  }

  if (!isNaN(status)) {
    Object.assign(where, { status: Boolean(status) })
  }

  const testApis = await TestApiRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const totalItems = await TestApiRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: testApis,
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
}

export const create = async (user: UserToken, data: TestApi) => {
  const currentDate = new Date()

  return await TestApiRepository.create({
    name: data.name,
    endpoint: data.endpoint,
    http_method: data.http_method as $Enums.http_method,
    env: data.env,
    description: data.description,
    status: data.status,
    created_at: currentDate,
    created_by: user.id,
    updated_at: currentDate,
    updated_by: user.id,
  })
}

export const getById = async (id: number) => {
  return await TestApiRepository.getById(id)
}

export const updateById = async (user: UserToken, id: number, data: TestApi) => {
  const testApi = await TestApiRepository.getById(id)

  if (testApi === null) {
    throw new CustomError("Test api not found", 400)
  }

  const currentDate = new Date()

  return await TestApiRepository.updateById(testApi.id, {
    name: data.name,
    endpoint: data.endpoint,
    http_method: data.http_method as $Enums.http_method,
    env: data.env,
    description: data.description,
    status: data.status,
    updated_at: currentDate,
    updated_by: user.id,
  })
}

export const deleteById = async (id: number) => {
  const testApi = await TestApiRepository.getById(id)

  if (testApi === null) {
    throw new CustomError("Test api not found", 400)
  }

  await TestApiRepository.deleteById(id)
}
