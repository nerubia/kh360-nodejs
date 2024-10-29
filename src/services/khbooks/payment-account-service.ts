import { type Prisma } from "@prisma/client"
import * as PaymentAccountRepository from "../../repositories/khbooks/payment-account-repository"
import CustomError from "../../utils/custom-error"
import { type PaymentAccountFilters } from "../../types/payment-account-type"

export const getAllByFilters = async ({
  payment_account_name,
  payment_network,
  account_name,
  account_no,
  bank_name,
  page,
}: PaymentAccountFilters) => {
  const itemsPerPage = 20
  const parsedPage = parseInt(page ?? "1")
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where: Prisma.payment_accountsWhereInput = {}

  if (payment_account_name !== undefined) {
    Object.assign(where, {
      name: {
        contains: payment_account_name,
      },
    })
  }

  if (payment_network !== undefined) {
    Object.assign(where, {
      payment_network: {
        contains: payment_network,
      },
    })
  }

  if (account_name !== undefined) {
    Object.assign(where, {
      account_name: {
        contains: account_name,
      },
    })
  }

  if (account_no !== undefined) {
    Object.assign(where, {
      account_no: {
        contains: account_no,
      },
    })
  }

  if (bank_name !== undefined) {
    Object.assign(where, {
      bank_name: {
        contains: bank_name,
      },
    })
  }

  const paymentAccounts = await PaymentAccountRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const totalItems = await PaymentAccountRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: paymentAccounts,
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
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
