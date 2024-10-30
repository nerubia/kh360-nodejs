import { type Prisma } from "@prisma/client"
import * as PaymentNetworkRepository from "../../repositories/khbooks/payment-network-repository"
import { getCache, setCache } from "../../utils/redis"

export const getAllByFilters = async (name: string, page: string) => {
  const KEY = `PAYMENT_NETWORKS_${name}_${page}`

  let results = await getCache(KEY)

  if (results === null) {
    const itemsPerPage = 20
    const parsedPage = parseInt(page)
    const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

    const where: Prisma.payment_networksWhereInput = {}

    if (name !== undefined) {
      Object.assign(where, {
        name: {
          contains: name,
        },
      })
    }

    const paymentNetworks = await PaymentNetworkRepository.paginateByFilters(
      (currentPage - 1) * itemsPerPage,
      itemsPerPage,
      where
    )

    const totalItems = await PaymentNetworkRepository.countAllByFilters(where)
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    results = {
      data: paymentNetworks,
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
