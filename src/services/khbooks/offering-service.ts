import { type Prisma } from "@prisma/client"
import * as OfferingRepository from "../../repositories/khbooks/offering-repository"
import CustomError from "../../utils/custom-error"

export const getAllByFilters = async (
  name: string,
  category_id: number,
  client_id: number,
  global: boolean,
  page: string
) => {
  const itemsPerPage = 20
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where: Prisma.offeringsWhereInput = {}

  if (name !== undefined) {
    Object.assign(where, {
      name: {
        contains: name,
      },
    })
  }

  if (!isNaN(category_id)) {
    Object.assign(where, {
      category_id,
    })
  }

  if (!isNaN(client_id)) {
    Object.assign(where, {
      client_id,
    })
  }

  if (global) {
    Object.assign(where, {
      client_id: null,
    })
  }

  const offerings = await OfferingRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const totalItems = await OfferingRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: offerings,
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
}

export const deleteById = async (id: number) => {
  const offering = await OfferingRepository.getById(id)

  if (offering === null) {
    throw new CustomError("Offering not found", 400)
  }

  await OfferingRepository.deleteById(id)
}
