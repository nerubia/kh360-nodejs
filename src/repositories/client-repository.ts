import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const getById = async (id: number) => {
  return await prisma.clients.findUnique({
    select: {
      id: true,
      name: true,
      company_id: true,
      payment_account_id: true,
      currencies: {
        select: {
          id: true,
        },
      },
    },
    where: {
      id,
    },
  })
}

export const getAllByName = async (name: string) => {
  return await prisma.clients.findMany({
    where: {
      name: {
        contains: name,
      },
    },
  })
}

export const getAllByFilters = async (where: Prisma.clientsWhereInput) => {
  return await prisma.clients.findMany({
    select: {
      id: true,
      name: true,
      display_name: true,
      contact_first_name: true,
      contact_last_name: true,
      email: true,
      address1: true,
      address2: true,
      city: true,
      state: true,
      country_id: true,
      postal_code: true,
      company_id: true,
      currency_id: true,
      payment_term_id: true,
      payment_account_id: true,
      tax_type_id: true,
      status: true,
      companies: {
        select: {
          id: true,
          name: true,
        },
      },
      currencies: {
        select: {
          id: true,
          name: true,
          code: true,
          prefix: true,
        },
      },
      payment_accounts: {
        select: {
          account_name: true,
          account_type: true,
          account_no: true,
          bank_name: true,
          bank_branch: true,
          swift_code: true,
        },
      },
    },
    where,
    orderBy: {
      display_name: "asc",
    },
  })
}
