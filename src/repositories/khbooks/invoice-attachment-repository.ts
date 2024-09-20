import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const getByFilters = async (where: Prisma.invoice_attachmentsWhereInput) => {
  return await prisma.invoice_attachments.findMany({
    where,
  })
}

export const createMany = async (data: Prisma.invoice_attachmentsCreateInput[]) => {
  return await prisma.invoice_attachments.createMany({
    data,
  })
}

export const deleteMany = async (ids: number[]) => {
  return await prisma.invoice_attachments.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  })
}
