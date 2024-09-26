import { type Prisma } from "@prisma/client"
import * as CountryRepository from "../../repositories/khbooks/country-repository"
import { getCache, setCache } from "../../utils/redis"

export const getAllByFilters = async (page: string) => {
  const KEY = `COUNTRIES_${page}`

  let results = await getCache(KEY)

  if (results === null) {
    const itemsPerPage = 20
    const parsedPage = parseInt(page)
    const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

    const where: Prisma.countriesWhereInput = {}

    const countries = await CountryRepository.paginateByFilters(
      (currentPage - 1) * itemsPerPage,
      itemsPerPage,
      where
    )

    const totalItems = await CountryRepository.countAllByFilters(where)
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    results = {
      data: countries,
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

export const getById = async (id: number) => {
  return await CountryRepository.getById(id)
}
