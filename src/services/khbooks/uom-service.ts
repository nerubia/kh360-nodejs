import { type Prisma } from "@prisma/client"
import * as UomRepository from "../../repositories/khbooks/uom-repository"
import { getCache, setCache } from "../../utils/redis"

export const getAllByFilters = async (name: string, page: string) => {
  const KEY = `UOMS_${name}_${page}`

  let results = await getCache(KEY)

  if (results === null) {
    const itemsPerPage = 20
    const parsedPage = parseInt(page)
    const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

    const where: Prisma.uomsWhereInput = {}

    if (name !== undefined) {
      Object.assign(where, {
        name: {
          contains: name,
        },
      })
    }

    const uoms = await UomRepository.paginateByFilters(
      (currentPage - 1) * itemsPerPage,
      itemsPerPage,
      where
    )

    const totalItems = await UomRepository.countAllByFilters(where)
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    results = {
      data: uoms,
      pageInfo: {
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
        currentPage,
        totalPages,
        totalItems,
      },
    }

    await setCache(KEY, results)
  }

  return results
}
