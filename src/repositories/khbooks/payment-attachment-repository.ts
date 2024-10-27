import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const getByFilters = async (where: Prisma.payment_attachmentsWhereInput) => {
  return await prisma.payment_attachments.findMany({
    where,
  })
}

export const getByPaymentId = async (payment_id: number) => {
  return await prisma.payment_attachments.findMany({
    where: {
      payment_id,
    },
  })
}

export const createMany = async (data: Prisma.payment_attachmentsCreateInput[]) => {
  return await prisma.payment_attachments.createMany({
    data,
  })
}

export const deleteMany = async (ids: number[]) => {
  return await prisma.payment_attachments.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  })
}
