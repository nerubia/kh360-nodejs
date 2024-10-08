import { type Prisma } from "@prisma/client"
import * as CurrencyRepository from "../../repositories/khbooks/currency-repository"
import { getCache, setCache } from "../../utils/redis"

export const getAllByFilters = async (page: string) => {
  const KEY = `CURRENCIES_${page}`

  let results = await getCache(KEY)

  if (results === null) {
    const itemsPerPage = 20
    const parsedPage = parseInt(page)
    const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

    const where: Prisma.currenciesWhereInput = {}

    const currencies = await CurrencyRepository.paginateByFilters(
      (currentPage - 1) * itemsPerPage,
      itemsPerPage,
      where
    )

    const totalItems = await CurrencyRepository.countAllByFilters(where)
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    results = {
      data: currencies,
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
