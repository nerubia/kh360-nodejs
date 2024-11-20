import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.payment_accountsWhereInput
) => {
  return await prisma.payment_accounts.findMany({
    skip,
    take,
    where,
    include: {
      countries: {
        select: {
          name: true,
        },
      },
      payment_networks: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          invoices: true,
        },
      },
    },
    orderBy: [
      {
        created_at: "desc",
      },
    ],
  })
}

export const countAllByFilters = async (where: Prisma.payment_accountsWhereInput) => {
  const count = await prisma.payment_accounts.count({
    where,
  })
  return count
}

export const getById = async (id: number) => {
  return await prisma.payment_accounts.findFirst({
    where: {
      id,
    },
    include: {
      countries: {
        select: {
          id: true,
          name: true,
        },
      },
      payment_networks: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          invoices: true,
        },
      },
    },
  })
}

export const getByName = async (name: string) => {
  return await prisma.payment_accounts.findFirst({
    where: {
      name,
    },
  })
}

export const create = async (data: Prisma.payment_accountsUncheckedCreateInput) => {
  return await prisma.payment_accounts.create({
    data,
  })
}

export const updateById = async (id: number, data: Prisma.payment_accountsUncheckedUpdateInput) => {
  return await prisma.payment_accounts.update({
    where: {
      id,
    },
    data,
  })
}

export const deleteById = async (id: number) => {
  await prisma.payment_accounts.delete({
    where: {
      id,
    },
  })
}
