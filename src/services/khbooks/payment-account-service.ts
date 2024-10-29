import { type Prisma } from "@prisma/client"
import * as PaymentAccountRepository from "../../repositories/khbooks/payment-account-repository"
import { getCache, setCache } from "../../utils/redis"
import CustomError from "../../utils/custom-error"

export const getAllByFilters = async (page: string) => {
  const KEY = `PAYMENT_ACCOUNTS_${page}`

  let results = await getCache(KEY)

  if (results === null) {
    const itemsPerPage = 20
    const parsedPage = parseInt(page)
    const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

    const where: Prisma.payment_accountsWhereInput = {}

    const paymentAccounts = await PaymentAccountRepository.paginateByFilters(
      (currentPage - 1) * itemsPerPage,
      itemsPerPage,
      where
    )

    const totalItems = await PaymentAccountRepository.countAllByFilters(where)
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    results = {
      data: paymentAccounts,
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
  return await PaymentAccountRepository.getById(id)
}

export const deleteById = async (id: number) => {
  const paymentAccount = await PaymentAccountRepository.getById(id)

  if (paymentAccount === null) {
    throw new CustomError("Payment account not found", 400)
  }

  await PaymentAccountRepository.deleteById(id)
}
