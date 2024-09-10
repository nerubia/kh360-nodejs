import { type Prisma } from "@prisma/client"
import * as TaxTypeRepository from "../../repositories/khbooks/tax-type-repository"

export const getAllByFilters = async (name: string, page: string) => {
  const itemsPerPage = 20
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where: Prisma.tax_typesWhereInput = {}

  if (name !== undefined) {
    Object.assign(where, {
      name: {
        contains: name,
      },
    })
  }

  const taxTypes = await TaxTypeRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const totalItems = await TaxTypeRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: taxTypes,
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
}
