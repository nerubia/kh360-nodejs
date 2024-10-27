import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const getByInvoiceId = async (invoice_id: number) => {
  return await prisma.payment_details.findMany({
    where: {
      invoice_id,
    },
  })
}

export const countAllByFilters = async (where: Prisma.payment_detailsWhereInput) => {
  const count = await prisma.payment_details.count({
    where,
  })
  return count
}

export const createMany = async (data: Prisma.payment_detailsCreateManyInput[]) => {
  return await prisma.payment_details.createMany({
    data,
  })
}

export const updateById = async (id: number, data: Prisma.payment_detailsUncheckedUpdateInput) => {
  return await prisma.payment_details.update({
    where: {
      id,
    },
    data,
  })
}

export const deleteMany = async (ids: number[]) => {
  return await prisma.payment_details.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  })
}
