import { type Prisma } from "@prisma/client"
import * as PaymentAccountRepository from "../../repositories/khbooks/payment-account-repository"
import * as PaymentNetworkRepository from "../../repositories/khbooks/payment-network-repository"
import * as CountryRepository from "../../repositories/khbooks/country-repository"
import CustomError from "../../utils/custom-error"
import { type PaymentAccount, type PaymentAccountFilters } from "../../types/payment-account-type"

export const getAllByFilters = async ({
  payment_account_name,
  payment_network_id,
  account_name,
  account_no,
  bank_name,
  is_active,
  page,
  orderBy,
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

  if (!isNaN(payment_network_id)) {
    Object.assign(where, {
      payment_network_id,
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

  if (is_active !== undefined) {
    Object.assign(where, {
      is_active: Boolean(parseInt(is_active)),
    })
  }

  const finalOrderBy = orderBy ?? []

  const paymentAccounts = await PaymentAccountRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where,
    [
      ...finalOrderBy,
      {
        created_at: "desc",
      },
    ]
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

export const create = async (data: PaymentAccount) => {
  let country = null
  if (data.country_id !== null && data.country_id !== undefined) {
    country = await CountryRepository.getById(data.country_id ?? 0)
    if (country === null) {
      throw new CustomError("Country not found", 400)
    }
  }

  let payment_network = null
  if (data.payment_network_id !== null && data.payment_network_id !== undefined) {
    payment_network = await PaymentNetworkRepository.getById(data.payment_network_id ?? 0)
    if (payment_network === null) {
      throw new CustomError("Payment Network not found", 400)
    }
  }

  const currentDate = new Date()

  return await PaymentAccountRepository.create({
    name: data.name,
    payment_network_id: payment_network?.id ?? null,
    account_name: data.account_name,
    account_type: data.account_type,
    account_no: data.account_no,
    bank_name: data.bank_name,
    bank_branch: data.bank_branch,
    bank_code: data.bank_code,
    swift_code: data.swift_code,
    address1: data.address1,
    address2: data.address2,
    city: data.city,
    state: data.state,
    country_id: country?.id ?? null,
    postal_code: data.postal_code,
    description: data.description,
    is_active: data.is_active,
    created_at: currentDate,
    updated_at: currentDate,
  })
}

export const updateById = async (id: number, data: PaymentAccount) => {
  const paymentAccount = await PaymentAccountRepository.getById(id)

  if (paymentAccount === null) {
    throw new CustomError("Payment Account not found", 400)
  }

  let country = null
  if (data.country_id !== undefined && data.country_id !== null) {
    country = await CountryRepository.getById(data.country_id ?? 0)
    if (country === null) {
      throw new CustomError("Country not found", 400)
    }
  }

  let payment_network = null
  if (data.payment_network_id !== null && data.payment_network_id !== undefined) {
    payment_network = await PaymentNetworkRepository.getById(data.payment_network_id ?? 0)
    if (payment_network === null) {
      throw new CustomError("Payment Network not found", 400)
    }
  }

  const currentDate = new Date()

  return await PaymentAccountRepository.updateById(paymentAccount.id, {
    name: data.name,
    payment_network_id: payment_network?.id ?? null,
    account_name: data.account_name,
    account_type: data.account_type,
    account_no: data.account_no,
    bank_name: data.bank_name,
    bank_branch: data.bank_branch,
    bank_code: data.bank_code,
    swift_code: data.swift_code,
    address1: data.address1,
    address2: data.address2,
    city: data.city,
    state: data.state,
    country_id: country?.id ?? null,
    postal_code: data.postal_code,
    description: data.description,
    is_active: data.is_active,
    created_at: currentDate,
    updated_at: currentDate,
  })
}

export const deleteById = async (id: number) => {
  const paymentAccount = await PaymentAccountRepository.getById(id)

  if (paymentAccount === null) {
    throw new CustomError("Payment account not found", 400)
  }

  if (paymentAccount._count.invoices > 0) {
    throw new CustomError(
      "This payment account is linked to an invoice and cannot be deleted.",
      400
    )
  }

  await PaymentAccountRepository.deleteById(id)
}
