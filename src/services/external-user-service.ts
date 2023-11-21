import * as ExternalUserRepository from "../repositories/external-user-repository"
import { type Prisma } from "@prisma/client"
import { type ExternalUser } from "../types/external-user-type"

export const getAll = async () => {
  return await ExternalUserRepository.getAll()
}

export const getAllByFilters = async (
  name: string,
  company: string,
  role: string,
  page: string
) => {
  const evaluatorRole = role === "all" ? "" : role

  const itemsPerPage = 10
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where = {
    role: {
      contains: evaluatorRole,
    },
    company: {
      contains: company,
    },
  }

  if (name !== undefined) {
    Object.assign(where, {
      OR: [
        {
          first_name: {
            contains: name,
          },
        },
        {
          last_name: {
            contains: name,
          },
        },
      ],
    })
  }

  const totalItems = await ExternalUserRepository.countByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const externalUsers = await ExternalUserRepository.getAllByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const pageInfo = {
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    totalPages,
    totalItems,
  }

  return {
    data: externalUsers,
    pageInfo,
  }
}

export const countByFilters = async (where: Prisma.external_usersWhereInput) => {
  return await ExternalUserRepository.countByFilters(where)
}

export const create = async (data: ExternalUser) => {
  return await ExternalUserRepository.create(data)
}

export const getById = async (id: number) => {
  return await ExternalUserRepository.getById(id)
}

export const updateById = async (id: number, data: ExternalUser) => {
  return await ExternalUserRepository.updateById(id, data)
}

export const deleteById = async (id: number) => {
  await ExternalUserRepository.deleteById(id)
}
