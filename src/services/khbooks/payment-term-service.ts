import { type Prisma } from "@prisma/client"
import * as PaymentTermRepository from "../../repositories/khbooks/payment-term-repository"
import { getCache, setCache } from "../../utils/redis"

export const getAllByFilters = async (name: string, page: string) => {
  const KEY = `PAYMENT_TERMS_${name}_${page}`

  let results = await getCache(KEY)

  if (results === null) {
    const itemsPerPage = 20
    const parsedPage = parseInt(page)
    const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

    const where: Prisma.payment_termsWhereInput = {}

    if (name !== undefined) {
      Object.assign(where, {
        name: {
          contains: name,
        },
      })
    }

    const paymentTerms = await PaymentTermRepository.paginateByFilters(
      (currentPage - 1) * itemsPerPage,
      itemsPerPage,
      where
    )

    const totalItems = await PaymentTermRepository.countAllByFilters(where)
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    results = {
      data: paymentTerms,
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
