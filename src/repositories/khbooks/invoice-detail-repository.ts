import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const countAllByFilters = async (where: Prisma.invoice_detailsWhereInput) => {
  const count = await prisma.invoice_details.count({
    where,
  })
  return count
}

export const createMany = async (data: Prisma.invoice_detailsCreateManyInput[]) => {
  return await prisma.invoice_details.createMany({
    data,
  })
}

export const updateById = async (id: number, data: Prisma.invoice_detailsUncheckedUpdateInput) => {
  return await prisma.invoice_details.update({
    where: {
      id,
    },
    data,
  })
}

export const deleteMany = async (ids: number[]) => {
  return await prisma.invoice_details.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  })
}
